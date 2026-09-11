import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { whatsappService } from './whatsapp';

const prisma = new PrismaClient();

// Função auxiliar para buscar a data atual zerada (meia-noite)
const getToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

// Função auxiliar para buscar a próxima ocorrência de um dia da semana (0 = Domingo, 4 = Quinta)
const getNextDayOfWeek = (date: Date, dayOfWeek: number) => {
  const resultDate = new Date(date.getTime());
  resultDate.setDate(date.getDate() + (7 + dayOfWeek - date.getDay()) % 7);
  return resultDate;
};

export function initializeCronJobs() {
  console.log('Inicializando Cron Jobs para o WhatsApp...');

  // REGRA DE SEGUNDA-FEIRA: Notifica o ministro de Quinta e de Domingo
  // Roda toda segunda-feira às 10:00 da manhã -> '0 10 * * 1'
  cron.schedule('0 10 * * 1', async () => {
    console.log('[CRON] Executando rotina de Segunda-Feira...');
    try {
      const today = getToday();
      const nextThursday = getNextDayOfWeek(today, 4);
      const nextSunday = getNextDayOfWeek(today, 0);

      await notifyMinisterForDate(nextThursday, 'Quinta-Feira');
      await notifyMinisterForDate(nextSunday, 'Domingo');
    } catch (err) {
      console.error('[CRON] Erro na rotina de Segunda:', err);
    }
  });

  // REGRA DE QUINTA-FEIRA: Reforço para o ministro de Domingo
  // Roda toda quinta-feira às 10:00 da manhã -> '0 10 * * 4'
  cron.schedule('0 10 * * 4', async () => {
    console.log('[CRON] Executando rotina de Quinta-Feira...');
    try {
      const today = getToday();
      const nextSunday = getNextDayOfWeek(today, 0);

      await notifyMinisterForDate(nextSunday, 'Domingo (Reforço)');
    } catch (err) {
      console.error('[CRON] Erro na rotina de Quinta:', err);
    }
  });
}

// Lógica principal de buscar culto, achar o ministro e mandar a mensagem
async function notifyMinisterForDate(date: Date, dayLabel: string) {
  // Buscar o culto para a data específica
  const service = await prisma.service.findFirst({
    where: {
      date: {
        gte: date,
        lt: new Date(date.getTime() + 24 * 60 * 60 * 1000)
      }
    },
    include: {
      schedules: {
        include: {
          band: true,
          participants: {
            include: {
              user: true,
              role: true
            }
          }
        }
      }
    }
  });

  if (!service) {
    console.log(`[CRON] Nenhum culto encontrado para ${dayLabel} (${date.toLocaleDateString()}).`);
    return;
  }

  const schedule = service.schedules[0];
  if (!schedule) {
    console.log(`[CRON] Nenhuma escala criada para o culto de ${dayLabel}.`);
    return;
  }

  // Encontrar quem é o "Ministro" ou "Ministra"
  const ministerParticipant = schedule.participants.find(p => 
    p.role.name.toLowerCase().includes('ministro') || 
    p.role.name.toLowerCase().includes('ministra')
  );

  if (!ministerParticipant) {
    console.log(`[CRON] Nenhum Ministro(a) escalado para o culto de ${dayLabel}.`);
    return;
  }

  const minister = ministerParticipant.user;
  if (!minister.phone) {
    console.log(`[CRON] Ministro ${minister.name} não possui telefone cadastrado.`);
    return;
  }

  // Montar a string com os integrantes da equipe (Banda + Participantes da Escala)
  let teamString = `*Banda:* ${schedule.band?.name || 'Avulso'}\n*Equipe:*\n`;
  schedule.participants.forEach(p => {
    teamString += `- ${p.user.name} (${p.role.name})\n`;
  });

  // Montar a mensagem final
  const message = `Olá *${minister.name}*, a Paz!\n\nEste é um lembrete automático do sistema.\nVocê está escalado(a) como Ministro(a) para o Culto de *${dayLabel}* (${date.toLocaleDateString('pt-BR')}) às ${service.time || '18:30'}.\n\nSua equipe escalada:\n${teamString}\nPor favor, não se esqueça de adicionar o repertório no sistema o quanto antes!\n\n_Mensagem automática do Sistema_`;

  // Disparar via WhatsApp
  const success = await whatsappService.sendMessage(minister.phone, message);
  if (success) {
    console.log(`[CRON] Mensagem enviada para o Ministro ${minister.name} (${dayLabel}).`);
  } else {
    console.log(`[CRON] Falha ao enviar mensagem para ${minister.name} (${minister.phone}).`);
  }
}
