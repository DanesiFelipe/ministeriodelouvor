const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.repertoireSong.deleteMany({});
  await prisma.repertoire.deleteMany({});
  await prisma.scheduleParticipant.deleteMany({});
  await prisma.schedule.deleteMany({});
  await prisma.service.deleteMany({});
  console.log('All services and dependencies wiped.');
}
main().catch(console.error).finally(() => prisma.$disconnect());
