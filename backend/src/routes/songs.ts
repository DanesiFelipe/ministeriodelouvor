import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Listar todas as músicas
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const songs = await prisma.song.findMany({
      orderBy: { title: 'asc' }
    });
    res.json(songs);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar músicas' });
  }
});

// Criar nova música
router.post('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, artist, key, links } = req.body;
    
    if (!title) {
      res.status(400).json({ error: 'O título é obrigatório' });
      return;
    }

    const song = await prisma.song.create({
      data: { title, artist, key, links }
    });
    res.status(201).json(song);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar música' });
  }
});

// Editar música
router.put('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { title, artist, key, links } = req.body;
    const songId = req.params.id as string;
    const song = await prisma.song.update({
      where: { id: songId },
      data: { title, artist, key, links }
    });
    res.json(song);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar música' });
  }
});

// Excluir música (Apenas Admin?)
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'ADMIN') {
      res.status(403).json({ error: 'Apenas administrador pode excluir' });
      return;
    }
    const songId = req.params.id as string;
    await prisma.song.delete({ where: { id: songId } });
    res.json({ message: 'Música excluída com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir música' });
  }
});

export default router;
