import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

export const runAutoFill = async (scheduleId: string) => {
  const schedule = await prisma.schedule.findUnique({
    where: { id: scheduleId },
    include: { service: true, band: true, participants: true }
  });
  if (!schedule) return { warnings: ['Escala não encontrada'] };

  const serviceDate = schedule.service.date;
  const newParticipants: any[] = [];
  const warnings: string[] = [];

  if (schedule.bandId) {
    const bandMembers = await prisma.memberBand.findMany({
      where: { bandId: schedule.bandId },
      include: { 
        user: {
          include: {
            memberRoles: { include: { role: true } },
            unavailabilities: { where: { date: serviceDate } }
          }
        } 
      }
    });

    for (const mb of bandMembers) {
      const user = mb.user;
      const mainRole = user.memberRoles[0]?.role;
      if (!mainRole) { warnings.push(`${user.name} não possui função.`); continue; }
      if (user.unavailabilities.length > 0) { warnings.push(`${user.name} indisponível.`); continue; }
      if (!schedule.participants.some((p: any) => p.userId === user.id)) {
        newParticipants.push({ scheduleId: schedule.id, userId: user.id, roleId: mainRole.id });
      }
    }
  }

  // 3 Back Vocals para toda escala (banda ou avulso) e o resto avulso se não for banda
  const allRoles = await prisma.role.findMany();
  for (const role of allRoles) {
    // Se for banda, não preenche instrumentistas avulsos, só back vocal e ministro se a banda não tiver
    // Wait: a rule: "backs (em cada escala tem 3)".
    if (role.name === 'Back Vocal') {
      const currentBacks = newParticipants.filter(p => p.roleId === role.id).length;
      const needed = 3 - currentBacks;
      if (needed > 0) {
        const availableMembers = await prisma.memberRole.findMany({
          where: {
            roleId: role.id,
            user: {
              active: true,
              unavailabilities: { none: { date: serviceDate } }
            }
          },
          include: { user: true },
          take: needed
        });
        
        for (const avail of availableMembers) {
          if (!newParticipants.some(p => p.userId === avail.userId) && !schedule.participants.some((p: any) => p.userId === avail.userId)) {
            newParticipants.push({ scheduleId: schedule.id, userId: avail.userId, roleId: role.id });
          }
        }
      }
    } else if (!schedule.bandId) {
      // Para Avulso, preencher 1 de cada
      const availableMember = await prisma.memberRole.findFirst({
        where: {
          roleId: role.id,
          user: {
            active: true,
            unavailabilities: { none: { date: serviceDate } },
          }
        },
        include: { user: true }
      });
      if (availableMember && !newParticipants.some(p => p.userId === availableMember.userId)) {
        newParticipants.push({ scheduleId: schedule.id, userId: availableMember.userId, roleId: role.id });
      }
    } else if (role.name === 'Ministro') {
      // Banda precisa de ministro
      const currentMinisters = newParticipants.filter(p => p.roleId === role.id).length;
      if (currentMinisters === 0) {
        const availableMember = await prisma.memberRole.findFirst({
          where: { roleId: role.id, user: { active: true, unavailabilities: { none: { date: serviceDate } } } }
        });
        if (availableMember) {
          newParticipants.push({ scheduleId: schedule.id, userId: availableMember.userId, roleId: role.id });
        }
      }
    }
  }

  if (newParticipants.length > 0) {
    await prisma.scheduleParticipant.createMany({ data: newParticipants });
  }
  return { warnings };
};

// Buscar escalas do usuário logado
router.get('/my-schedules', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return;

    // Buscar escalas futuras onde o user está como participante
    const schedules = await prisma.schedule.findMany({
      where: {
        participants: {
          some: { userId }
        },
        service: {
          date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } // Hoje em diante
        }
      },
      include: {
        service: true,
        participants: {
          where: { userId },
          include: { role: true }
        }
      },
      orderBy: {
        service: { date: 'asc' }
      }
    });

    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar escalas do usuário' });
  }
});

// Gerar escala automaticamente (Endpoint)
router.post('/:id/auto-fill', requireAuth, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const scheduleId = req.params.id as string;
    const result = await runAutoFill(scheduleId);
    res.json({ message: 'Escala automática gerada com sucesso!', warnings: result.warnings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao gerar escala automática' });
  }
});

// Criar uma escala para um culto
router.post('/', requireAuth, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { serviceId, bandId, notes } = req.body;
    
    if (!serviceId) {
      res.status(400).json({ error: 'ID do culto é obrigatório' });
      return;
    }

    const schedule = await prisma.schedule.create({
      data: { serviceId, bandId, notes }
    });
    res.status(201).json(schedule);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar escala' });
  }
});

// Adicionar um membro a uma função na escala (Escala Manual)
router.post('/:id/participants', requireAuth, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const scheduleId = req.params.id as string;
    const { userId, roleId } = req.body;

    if (!userId || !roleId) {
      res.status(400).json({ error: 'Usuário e Função são obrigatórios' });
      return;
    }

    const participant = await prisma.scheduleParticipant.create({
      data: { scheduleId, userId, roleId },
      include: { user: { select: { name: true } }, role: true }
    });
    
    res.status(201).json(participant);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao escalar membro. Ele já pode estar nesta função.' });
  }
});

// Remover membro da escala
router.delete('/:scheduleId/participants/:participantId', requireAuth, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const participantId = req.params.participantId as string;
    await prisma.scheduleParticipant.delete({ where: { id: participantId } });
    res.json({ message: 'Membro removido da escala' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover membro da escala' });
  }
});

export default router;
