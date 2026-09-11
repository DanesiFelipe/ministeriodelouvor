import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireAdmin, AuthRequest } from '../middleware/auth';
import bcrypt from 'bcrypt';

const router = Router();
const prisma = new PrismaClient();

// Listar todos os membros
router.get('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        active: true,
        createdAt: true,
      }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar membros' });
  }
});

// Criar um novo membro (Apenas Admin)
router.post('/', requireAuth, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, phone, password, username, roleIds, bandId } = req.body;

    if (!name || !password || !username) {
      res.status(400).json({ error: 'Nome, usuário e senha são obrigatórios' });
      return;
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email || '' },
          { username }
        ]
      }
    });

    if (existingUser) {
      res.status(400).json({ error: 'Usuário ou E-mail já está em uso' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email: email || `${username}@louvor.com`, // fallback
        phone: phone || null,
        username,
        passwordHash,
        role: 'MEMBER',
        active: true,
      }
    });

    // Vincular funções musicais (MemberRole)
    if (roleIds && Array.isArray(roleIds) && roleIds.length > 0) {
      const memberRolesData = roleIds.map((rId: string) => ({
        userId: user.id,
        roleId: rId
      }));
      await prisma.memberRole.createMany({ data: memberRolesData });
    }

    // Vincular a uma banda fixa (MemberBand)
    if (bandId) {
      await prisma.memberBand.create({
        data: {
          userId: user.id,
          bandId
        }
      });
    }

    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar membro' });
  }
});

// Atualizar membro (Apenas Admin)
router.put('/:id', requireAuth, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { name, email, role, active } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: { name, email, role, active },
      select: { id: true, name: true, email: true, role: true, active: true }
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
});

// Aprovar usuário
router.put('/:id/approve', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.params.id as string;
    const user = await prisma.user.update({
      where: { id: userId },
      data: { active: true }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao aprovar usuário' });
  }
});

// Alterar função de sistema do usuário (Apenas Admin)
router.put('/:id/role', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.params.id as string;
    const { role } = req.body;
    
    if (role !== 'ADMIN' && role !== 'MEMBER') {
      return res.status(400).json({ error: 'Função de sistema inválida' });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao alterar função do usuário' });
  }
});

// Excluir / Desativar usuário (Apenas Admin)
router.delete('/:id', requireAuth, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    
    // Por segurança, vamos apenas inativar em vez de deletar do banco
    await prisma.user.update({
      where: { id },
      data: { active: false }
    });

    res.json({ message: 'Membro desativado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao desativar membro' });
  }
});

export default router;
