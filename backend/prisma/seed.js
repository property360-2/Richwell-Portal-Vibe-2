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

  const createdUsers = [];
  for (const user of users) {
    // eslint-disable-next-line no-await-in-loop
    const u = await prisma.user.upsert({
      where: { email: user.email },
      update: { passwordHash, firstName: user.firstName, lastName: user.lastName, role: user.role },
      create: {
        ...user,
        passwordHash
      }
    });
    createdUsers.push(u);
  }

  // Create a sample program
  const program = await prisma.program.upsert({
    where: { code: 'BSCS' },
    update: {},
    create: { code: 'BSCS', name: 'BS Computer Science', department: 'CS', description: 'Computer Science program' }
  });

  // Create sample subjects
  const subj1 = await prisma.subject.upsert({
    where: { code: 'CS101' },
    update: {},
    create: { code: 'CS101', name: 'Intro to Computing', units: 3, subjectType: 'MINOR' }
  });
  const subj2 = await prisma.subject.upsert({
    where: { code: 'CS102' },
    update: {},
    create: { code: 'CS102', name: 'Data Structures', units: 3, subjectType: 'MAJOR', prerequisiteId: subj1.id }
  });

  await prisma.programSubject.upsert({
    where: { programId_subjectId: { programId: program.id, subjectId: subj1.id } },
    update: { recommendedYear: 1, recommendedSemester: 'FIRST' },
    create: { programId: program.id, subjectId: subj1.id, recommendedYear: 1, recommendedSemester: 'FIRST' }
  });
  await prisma.programSubject.upsert({
    where: { programId_subjectId: { programId: program.id, subjectId: subj2.id } },
    update: { recommendedYear: 1, recommendedSemester: 'SECOND' },
    create: { programId: program.id, subjectId: subj2.id, recommendedYear: 1, recommendedSemester: 'SECOND' }
  });

  // Create a professor profile
  const professorUser = createdUsers.find((u) => u.role === 'PROFESSOR');
  const professor = await prisma.professor.upsert({
    where: { userId: professorUser.id },
    update: {},
    create: { userId: professorUser.id, department: 'CS', employmentStatus: 'full-time' }
  });

  // Create sections for the subjects
  const term = await prisma.academicTerm.upsert({
    where: { schoolYear_semester: { schoolYear: '2025-2026', semester: 'FIRST' } },
    update: { isActive: true },
    create: { schoolYear: '2025-2026', semester: 'FIRST', isActive: true }
  });

  await prisma.section.upsert({
    where: { id: 1 },
    update: {},
    create: { name: 'CS101-A', subjectId: subj1.id, professorId: professor.id, maxSlots: 40, semester: term.semester, academicYear: term.schoolYear, status: 'OPEN' }
  });

  await prisma.section.upsert({
    where: { id: 2 },
    update: {},
    create: { name: 'CS101-B', subjectId: subj1.id, professorId: professor.id, maxSlots: 40, semester: term.semester, academicYear: term.schoolYear, status: 'OPEN' }
  });

  // Create a student profile under BSCS
  const studentUser = createdUsers.find((u) => u.role === 'STUDENT');
  await prisma.student.upsert({
    where: { userId: studentUser.id },
    update: { programId: program.id, studentNo: 'S20250001', yearLevel: 1 },
    create: { userId: studentUser.id, studentNo: 'S20250001', programId: program.id, yearLevel: 1 }
  });

  // Create admin profiles (registrar, admission) are user-only; no extra records needed

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
