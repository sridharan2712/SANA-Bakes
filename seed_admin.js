const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const email = 'admin@sana.com';
  let user = await prisma.user.findUnique({ where: { email } });
  
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: 'Admin',
        password: hashedPassword,
        role: 'ADMIN'
      }
    });
    console.log('Admin user created successfully');
  } else {
    user = await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        role: 'ADMIN'
      }
    });
    console.log('Admin user updated successfully');
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
