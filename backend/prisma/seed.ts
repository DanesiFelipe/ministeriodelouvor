import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Limpando banco de dados...');
  await prisma.scheduleParticipant.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.service.deleteMany();
  await prisma.memberBand.deleteMany();
  await prisma.memberRole.deleteMany();
  await prisma.user.deleteMany();
  await prisma.band.deleteMany();
  await prisma.role.deleteMany();

  console.log('Criando Funções (Roles)...');
  const roleNames = ['Ministro', 'Back Vocal', 'Teclado', 'Violão', 'Guitarra', 'Baixo', 'Bateria'];
  const roles: Record<string, any> = {};
  
  for (const name of roleNames) {
    roles[name] = await prisma.role.create({ data: { name } });
  }

  console.log('Criando Bandas...');
  const band1 = await prisma.band.create({ data: { name: 'Banda 1', description: 'Equipe Alpha' } });
  const band2 = await prisma.band.create({ data: { name: 'Banda 2', description: 'Equipe Beta' } });
  const band3 = await prisma.band.create({ data: { name: 'Banda 3', description: 'Equipe Gama' } });
  const bands = [band1, band2, band3];

  console.log('Criando Admin...');
  const adminPassword = await bcrypt.hash('admin', 10);
  const admin = await prisma.user.create({
    data: {
      name: 'Administrador',
      email: 'admin@louvor.com',
      username: 'admin',
      passwordHash: adminPassword,
      role: 'ADMIN',
      active: true,
    }
  });

  console.log('Criando Membros Fictícios...');
  const defaultPassword = await bcrypt.hash('123456', 10);

  // Helper to create user
  const createUser = async (name: string, roleName: string, bandId?: string) => {
    const user = await prisma.user.create({
      data: {
        name,
        email: `${name.toLowerCase().replace(/ /g, '')}@louvor.com`,
        username: name.toLowerCase().replace(/ /g, ''),
        passwordHash: defaultPassword,
        role: 'MEMBER',
        active: true,
      }
    });

    await prisma.memberRole.create({
      data: { userId: user.id, roleId: roles[roleName].id }
    });

    if (bandId) {
      await prisma.memberBand.create({
        data: { userId: user.id, bandId }
      });
    }
    return user;
  };

  // Criar 3 Ministros (Avulsos)
  await createUser('Marcos Ministro', 'Ministro');
  await createUser('Sarah Ministra', 'Ministro');
  await createUser('Davi Ministro', 'Ministro');

  // Criar 9 Back Vocals (Avulsos, para ter 3 em cada banda/escala)
  for (let i = 1; i <= 9; i++) {
    await createUser(`Vocalista ${i}`, 'Back Vocal');
  }

  // Preencher as 3 Bandas com instrumentistas
  for (let i = 0; i < bands.length; i++) {
    const bId = bands[i].id;
    await createUser(`Tecladista B${i+1}`, 'Teclado', bId);
    await createUser(`Violonista B${i+1}`, 'Violão', bId);
    await createUser(`Guitarrista B${i+1}`, 'Guitarra', bId);
    await createUser(`Baixista B${i+1}`, 'Baixo', bId);
    await createUser(`Baterista B${i+1}`, 'Bateria', bId);
  }

  console.log('Seed finalizado com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
