import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_for_development_only';

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({ 
      where: { username },
      include: {
        memberRoles: {
          include: { role: true }
        }
      }
    });

    if (!user) {
      res.status(401).json({ error: 'Credenciais inválidas' });
      return;
    }

    if (!user.active) {
      res.status(403).json({ error: 'Usuário inativo. Contate o administrador.' });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    
    if (!passwordMatch) {
      res.status(401).json({ error: 'Credenciais inválidas' });
      return;
    }

    const isMinistro = user.memberRoles.some(mr => 
      mr.role.name.toLowerCase().includes('ministro') || 
      mr.role.name.toLowerCase().includes('ministra')
    );

    const token = jwt.sign(
      { id: user.id, role: user.role, isMinistro },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
        isMinistro
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// Dados para formulário de cadastro (Público)
router.get('/register-data', async (req: Request, res: Response) => {
  try {
    const roles = await prisma.role.findMany({ orderBy: { name: 'asc' } });
    const bands = await prisma.band.findMany({ orderBy: { name: 'asc' } });
    res.json({ roles, bands });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar dados' });
  }
});

// Auto-Cadastro Público
router.post('/register', async (req: Request, res: Response): Promise<void> => {
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
        email: email || `${username}@louvor.com`,
        username,
        phone,
        passwordHash,
        role: 'MEMBER',
        active: false, // Requer aprovação do admin
      }
    });

    if (roleIds && Array.isArray(roleIds) && roleIds.length > 0) {
      const memberRolesData = roleIds.map((rId: string) => ({ userId: user.id, roleId: rId }));
      await prisma.memberRole.createMany({ data: memberRolesData });
    }

    // bandId desativado no registro pois agora exige roleId (adicionar via painel de bandas)

    res.status(201).json({ message: 'Cadastro realizado com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro interno ao realizar cadastro' });
  }
});

// Rota para pegar os dados do próprio usuário autenticado
import { requireAuth, AuthRequest } from '../middleware/auth';
router.get('/me', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, name: true, email: true, role: true, active: true,
        memberRoles: { select: { role: { select: { name: true } } } }
      }
    });
    
    if (!user) {
      res.status(404).json({ error: 'Usuário não encontrado' });
      return;
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

export default router;
