import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import authRoutes from './routes/auth';
import usersRoutes from './routes/users';
import rolesRoutes from './routes/roles';
import bandsRoutes from './routes/bands';
import servicesRoutes from './routes/services';
import schedulesRoutes from './routes/schedules';
import songsRoutes from './routes/songs';
import repertoiresRoutes from './routes/repertoires';
import noticesRoutes from './routes/notices';
import whatsappRoutes from './routes/whatsapp';
import { whatsappService } from './services/whatsapp';
import { initializeCronJobs } from './services/cron';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// 1. Segurança de Cabeçalhos HTTP
app.use(helmet());

// 2. Prevenção contra Poluição de Parâmetros HTTP
app.use(hpp());

// 3. Limite de Requisições (Rate Limiting) para evitar ataques de Força Bruta e DDoS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limita cada IP a 100 requisições por janela
  message: { status: 'error', message: 'Muitas requisições originadas deste IP. Por favor, tente novamente mais tarde.' }
});
app.use('/api', limiter);

// 4. Configuração de CORS restrita (permitindo apenas o frontend)
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// 5. Limite de tamanho de payload (Body Parser) para evitar sobrecarga de memória
app.use(express.json({ limit: '10kb' }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API do Ministério de Louvor está rodando!' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/bands', bandsRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/schedules', schedulesRoutes);
app.use('/api/songs', songsRoutes);
app.use('/api/repertoires', repertoiresRoutes);
app.use('/api/notices', noticesRoutes);
app.use('/api/whatsapp', whatsappRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  
  // Ensure default admin user exists
  prisma.user.findUnique({ where: { username: 'admin' } }).then(async (admin) => {
    if (!admin) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      await prisma.user.create({
        data: {
          name: 'Admin',
          username: 'admin',
          email: 'admin@admin.com',
          passwordHash: hashedPassword,
          role: 'ADMIN',
          active: true,
        }
      });
      console.log('Default admin user created');
    }
  });

  // Inicializar serviços de mensageria e agendamentos
  whatsappService.initialize();
  initializeCronJobs();
});
