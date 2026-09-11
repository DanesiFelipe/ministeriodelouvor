import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function resetAdmin() {
  const username = 'admin'; // Or what the user has
  const passwordHash = await bcrypt.hash('123456', 10);
  
  // Create or update admin user
  const admin = await prisma.user.upsert({
    where: { username },
    update: {
      passwordHash,
      role: 'ADMIN',
      active: true,
    },
    create: {
      name: 'Administrador',
      email: 'admin@admin.com',
      username: username,
      passwordHash,
      role: 'ADMIN',
      active: true,
    }
  });

  console.log('Admin user updated:', admin.username);
  console.log('Password reset to: 123456');
}

resetAdmin()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
