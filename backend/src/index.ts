import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

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
  
  // Inicializar serviços de mensageria e agendamentos
  whatsappService.initialize();
  initializeCronJobs();
});
