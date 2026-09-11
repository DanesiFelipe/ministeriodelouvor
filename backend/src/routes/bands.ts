import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const bands = await prisma.band.findMany();
    res.json(bands);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar bandas' });
  }
});

router.post('/', requireAuth, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;
    if (!name) {
      res.status(400).json({ error: 'Nome é obrigatório' });
      return;
    }

    const band = await prisma.band.create({
      data: { name, description }
    });
    res.status(201).json(band);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar banda' });
  }
});

router.put('/:id', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, description } = req.body;

    const band = await prisma.band.update({
      where: { id },
      data: { name, description }
    });
    res.json(band);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar banda' });
  }
});

router.delete('/:id', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.band.delete({ where: { id } });
    res.json({ message: 'Banda removida' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover banda. Verifique se existem membros ou escalas associadas a ela.' });
  }
});

// MEMBROS DA BANDA
router.get('/:id/members', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const bandId = req.params.id as string;
    const members = await prisma.memberBand.findMany({
      where: { bandId },
      include: {
        user: { select: { id: true, name: true, email: true } }
      }
    });
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar membros da banda' });
  }
});

router.post('/:id/members', requireAuth, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bandId = req.params.id as string;
    const { userId } = req.body;
    
    if (!userId) {
      res.status(400).json({ error: 'Usuário é obrigatório' });
      return;
    }

    const memberBand = await prisma.memberBand.create({
      data: { bandId, userId }
    });
    res.status(201).json(memberBand);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao adicionar membro à banda (pode já estar na banda)' });
  }
});

router.delete('/:id/members/:userId', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const bandId = req.params.id as string;
    const userId = req.params.userId as string;
    
    await prisma.memberBand.delete({
      where: {
        userId_bandId: { userId, bandId }
      }
    });
    res.json({ message: 'Membro removido da banda' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover membro da banda' });
  }
});

export default router;
