import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireAdmin, AuthRequest } from '../middleware/auth';
import { runAutoFill } from './schedules';

const router = Router();
const prisma = new PrismaClient();

// Listar Cultos
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const services = await prisma.service.findMany({
      orderBy: { date: 'asc' },
      include: {
        schedules: {
          include: {
            band: true,
            participants: {
              include: {
                user: { select: { id: true, name: true, role: true } },
                role: true
              }
            }
          }
        },
        repertoires: true
      }
    });
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar cultos' });
  }
});

// Criar Culto
router.post('/', requireAuth, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, date, time } = req.body;
    
    if (!type || !date) {
      res.status(400).json({ error: 'Tipo e data são obrigatórios' });
      return;
    }

    const service = await prisma.service.create({
      data: { 
        type, 
        date: new Date(date), 
        time 
      }
    });
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar culto' });
  }
});

// Gerar mês automaticamente (Cultos e Escalas)
router.post('/generate-month', requireAuth, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { year, month } = req.body;
    if (!year || !month) {
      res.status(400).json({ error: 'Ano e mês são obrigatórios' });
      return;
    }

    const bands = await prisma.band.findMany({ orderBy: { name: 'asc' } });
    let bandIndex = 0;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const generated = [];

    for (let day = 1; day <= endDate.getDate(); day++) {
      const currentDate = new Date(year, month - 1, day);
      const weekDay = currentDate.getDay();

      if (weekDay === 0 || weekDay === 4) { // Domingo (0) ou Quinta (4)
        const type = weekDay === 0 ? 'DOMINGO' : 'QUINTA';
        const time = weekDay === 0 ? '18:30' : '20:00';

        const service = await prisma.service.create({
          data: { type, date: currentDate, time }
        });

        let bandId = null;
        if (weekDay === 0 && bands.length > 0) {
          bandId = bands[bandIndex % bands.length].id;
          bandIndex++;
        }

        const schedule = await prisma.schedule.create({
          data: { serviceId: service.id, bandId, status: 'PUBLISHED' }
        });

        // Trigger auto-fill logic automatically
        await runAutoFill(schedule.id);
        
        generated.push(service);
      }
    }

    res.json({ message: 'Cultos do mês gerados com sucesso!', generated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao gerar o mês' });
  }
});

// Atualizar Culto
router.put('/:id', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { type, date, time, status } = req.body;

    const service = await prisma.service.update({
      where: { id },
      data: { type, date: new Date(date), time, status }
    });
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar culto' });
  }
});

// Excluir Culto
router.delete('/:id', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    // Delete schedules and their participants
    const schedules = await prisma.schedule.findMany({ where: { serviceId: id } });
    for (const schedule of schedules) {
      await prisma.scheduleParticipant.deleteMany({ where: { scheduleId: schedule.id } });
    }
    await prisma.schedule.deleteMany({ where: { serviceId: id } });

    // Delete repertoires and their songs
    const repertoires = await prisma.repertoire.findMany({ where: { serviceId: id } });
    for (const repertoire of repertoires) {
      await prisma.repertoireSong.deleteMany({ where: { repertoireId: repertoire.id } });
    }
    await prisma.repertoire.deleteMany({ where: { serviceId: id } });

    // Finally delete the service
    await prisma.service.delete({ where: { id } });
    res.json({ message: 'Culto removido com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao remover culto' });
  }
});

export default router;
