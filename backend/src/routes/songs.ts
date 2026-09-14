import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireAdminOrMinistro, AuthRequest } from '../middleware/auth';

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
router.post('/', requireAuth, requireAdminOrMinistro, async (req: AuthRequest, res: Response): Promise<void> => {
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
router.put('/:id', requireAuth, requireAdminOrMinistro, async (req: AuthRequest, res: Response) => {
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

// Excluir música
router.delete('/:id', requireAuth, requireAdminOrMinistro, async (req: AuthRequest, res: Response) => {
  try {
    const songId = req.params.id as string;
    // Primeiro remove das entradas de repertório (FK constraint)
    await prisma.repertoireSong.deleteMany({ where: { songId } });
    // Agora deleta a música em si
    await prisma.song.delete({ where: { id: songId } });
    res.json({ message: 'Música excluída com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao excluir música' });
  }
});

export default router;
