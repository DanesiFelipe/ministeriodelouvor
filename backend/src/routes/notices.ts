import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth as authenticate } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all notices
router.get('/', authenticate, async (req, res) => {
  try {
    const notices = await prisma.notice.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: { id: true, name: true, role: true }
        }
      }
    });
    res.json(notices);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar avisos' });
  }
});

// Create notice
router.post('/', authenticate, async (req: any, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Título e conteúdo são obrigatórios' });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Apenas administradores podem criar avisos' });
  }

  try {
    const notice = await prisma.notice.create({
      data: {
        title,
        content,
        creatorId: req.user.id
      },
      include: {
        createdBy: {
          select: { id: true, name: true, role: true }
        }
      }
    });
    res.json(notice);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar aviso' });
  }
});

// Delete notice
router.delete('/:id', authenticate, async (req: any, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Apenas administradores podem excluir avisos' });
  }

  try {
    await prisma.notice.delete({
      where: { id: req.params.id }
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao excluir aviso' });
  }
});

export default router;
