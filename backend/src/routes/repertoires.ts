import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireAdminOrMinistro, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Obter repertório de um culto
router.get('/service/:serviceId', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const serviceId = req.params.serviceId as string;
    const repertoire = await prisma.repertoire.findFirst({
      where: { serviceId },
      include: {
        songs: {
          include: { song: true },
          orderBy: { order: 'asc' }
        },
        minister: { select: { id: true, name: true } }
      }
    });
    res.json(repertoire || null);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar repertório' });
  }
});

// Salvar/Criar repertório de um culto
router.post('/service/:serviceId', requireAuth, requireAdminOrMinistro, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const serviceId = req.params.serviceId as string;
    const { songs, ministerId, notes } = req.body;
    // songs is an array of objects: { songId, key } or just string IDs for retrocompatibility
    
    if (!songs || !Array.isArray(songs)) {
      res.status(400).json({ error: 'Lista de músicas é inválida' });
      return;
    }

    // Tentar achar repertório existente
    let repertoire = await prisma.repertoire.findFirst({
      where: { serviceId }
    });

    if (repertoire) {
      // Atualizar
      await prisma.repertoire.update({
        where: { id: repertoire.id },
        data: { ministerId: ministerId || req.user!.id, notes }
      });
      // Deletar musicas antigas
      await prisma.repertoireSong.deleteMany({ where: { repertoireId: repertoire.id } });
    } else {
      // Criar
      repertoire = await prisma.repertoire.create({
        data: {
          serviceId,
          ministerId: ministerId || req.user!.id,
          notes
        }
      });
    }

    // Criar as novas associações (com    // Recriar vínculos na ordem
    if (songs.length > 0) {
      const repertoireSongsData = songs.map((s: any, index: number) => ({
        repertoireId: repertoire.id,
        songId: typeof s === 'string' ? s : s.songId,
        key: typeof s === 'string' ? null : s.key,
        order: index
      }));
      await prisma.repertoireSong.createMany({
        data: repertoireSongsData
      });
    }
    res.json({ message: 'Repertório salvo com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao salvar repertório' });
  }
});

export default router;
