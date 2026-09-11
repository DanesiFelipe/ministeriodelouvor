import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const roles = await prisma.role.findMany();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar funções' });
  }
});

router.post('/', requireAuth, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;
    if (!name) {
      res.status(400).json({ error: 'Nome é obrigatório' });
      return;
    }

    const role = await prisma.role.create({
      data: { name, description }
    });
    res.status(201).json(role);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar função' });
  }
});

router.put('/:id', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, description } = req.body;

    const role = await prisma.role.update({
      where: { id },
      data: { name, description }
    });
    res.json(role);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar função' });
  }
});

router.delete('/:id', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.role.delete({ where: { id } });
    res.json({ message: 'Função removida' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover função. Verifique se existem membros associados a ela.' });
  }
});

export default router;
