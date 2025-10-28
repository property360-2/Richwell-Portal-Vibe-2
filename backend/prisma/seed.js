import bcrypt from 'bcryptjs';

import prisma from '../src/lib/prisma.js';

const defaultPassword = 'ChangeMe123!';

const users = [
  {
    email: 'student@example.com',
    firstName: 'Samantha',
    lastName: 'Student',
    role: 'STUDENT'
  },
  {
    email: 'professor@example.com',
    firstName: 'Peter',
    lastName: 'Professor',
    role: 'PROFESSOR'
  },
  {
    email: 'registrar@example.com',
    firstName: 'Rachel',
    lastName: 'Registrar',
    role: 'REGISTRAR'
  },
  {
    email: 'admission@example.com',
    firstName: 'Alicia',
    lastName: 'Admission',
    role: 'ADMISSION'
  },
  {
    email: 'dean@example.com',
    firstName: 'Derek',
    lastName: 'Dean',
    role: 'DEAN'
  }
];

async function main() {
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  for (const user of users) {
    // eslint-disable-next-line no-await-in-loop
    await prisma.user.upsert({
      where: { email: user.email },
      update: { passwordHash },
      create: {
        ...user,
        passwordHash
      }
    });
  }

  console.info('Seed completed. Default password:', defaultPassword);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
