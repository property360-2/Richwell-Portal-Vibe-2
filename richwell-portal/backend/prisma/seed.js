import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Ensure environment variables from prisma/.env are loaded regardless of CWD
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // ============================
  // 1. ROLES
  // ============================
  const roles = await Promise.all([
    prisma.role.upsert({
      where: { name: 'student' },
      update: {},
      create: { name: 'student' }
    }),
    prisma.role.upsert({
      where: { name: 'professor' },
      update: {},
      create: { name: 'professor' }
    }),
    prisma.role.upsert({
      where: { name: 'registrar' },
      update: {},
      create: { name: 'registrar' }
    }),
    prisma.role.upsert({
      where: { name: 'admission' },
      update: {},
      create: { name: 'admission' }
    }),
    prisma.role.upsert({
      where: { name: 'dean' },
      update: {},
      create: { name: 'dean' }
    })
  ]);

  console.log('✅ Roles created');

  // ============================
  // 2. DEPARTMENTS & SECTORS
  // ============================
  const ccseDept = await prisma.department.upsert({
    where: { code: 'CCSE' },
    update: {},
    create: {
      name: 'College of Computer Studies and Engineering',
      code: 'CCSE'
    }
  });

  const cbmDept = await prisma.department.upsert({
    where: { code: 'CBM' },
    update: {},
    create: {
      name: 'College of Business Management',
      code: 'CBM'
    }
  });

  const undergrad = await prisma.sector.upsert({
    where: { name: 'Undergraduate' },
    update: {},
    create: {
      name: 'Undergraduate',
      description: 'Bachelor degree programs'
    }
  });

  console.log('✅ Departments & Sectors created');

  // ============================
  // 3. PROGRAMS
  // ============================
  const bscs = await prisma.program.upsert({
    where: { code: 'BSCS' },
    update: {},
    create: {
      name: 'Bachelor of Science in Computer Science',
      code: 'BSCS',
      description: 'Four-year computer science program',
      departmentId: ccseDept.id,
      sectorId: undergrad.id
    }
  });

  const bsit = await prisma.program.upsert({
    where: { code: 'BSIT' },
    update: {},
    create: {
      name: 'Bachelor of Science in Information Technology',
      code: 'BSIT',
      description: 'Four-year IT program',
      departmentId: ccseDept.id,
      sectorId: undergrad.id
    }
  });

  const bsba = await prisma.program.upsert({
    where: { code: 'BSBA' },
    update: {},
    create: {
      name: 'Bachelor of Science in Business Administration',
      code: 'BSBA',
      description: 'Four-year business program',
      departmentId: cbmDept.id,
      sectorId: undergrad.id
    }
  });

  console.log('✅ Programs created');

  // ============================
  // 4. CURRICULUM
  // ============================
  await prisma.curriculum.upsert({
    where: { 
      programId_startYear: {
        programId: bscs.id,
        startYear: 2024
      }
    },
    update: {},
    create: {
      programId: bscs.id,
      startYear: 2024,
      endYear: 2028,
      status: 'active'
    }
  });

  console.log('✅ Curriculum created');

  // ============================
  // 5. USERS
  // ============================
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Admission Staff
  const admissionUser = await prisma.user.upsert({
    where: { email: 'admission@richwell.edu' },
    update: {},
    create: {
      email: 'admission@richwell.edu',
      password: hashedPassword,
      roleId: roles.find(r => r.name === 'admission').id,
      status: 'active'
    }
  });

  // Registrar
  const registrarUser = await prisma.user.upsert({
    where: { email: 'registrar@richwell.edu' },
    update: {},
    create: {
      email: 'registrar@richwell.edu',
      password: hashedPassword,
      roleId: roles.find(r => r.name === 'registrar').id,
      status: 'active'
    }
  });

  // Professors
  const prof1User = await prisma.user.upsert({
    where: { email: 'prof.santos@richwell.edu' },
    update: {},
    create: {
      email: 'prof.santos@richwell.edu',
      password: hashedPassword,
      roleId: roles.find(r => r.name === 'professor').id,
      status: 'active'
    }
  });

  const prof2User = await prisma.user.upsert({
    where: { email: 'prof.reyes@richwell.edu' },
    update: {},
    create: {
      email: 'prof.reyes@richwell.edu',
      password: hashedPassword,
      roleId: roles.find(r => r.name === 'professor').id,
      status: 'active'
    }
  });

  const prof3User = await prisma.user.upsert({
    where: { email: 'prof.garcia@richwell.edu' },
    update: {},
    create: {
      email: 'prof.garcia@richwell.edu',
      password: hashedPassword,
      roleId: roles.find(r => r.name === 'professor').id,
      status: 'active'
    }
  });

  // Students
  const student1User = await prisma.user.upsert({
    where: { email: 'juan.delacruz@student.richwell.edu' },
    update: {},
    create: {
      email: 'juan.delacruz@student.richwell.edu',
      password: hashedPassword,
      roleId: roles.find(r => r.name === 'student').id,
      status: 'active'
    }
  });

  const student2User = await prisma.user.upsert({
    where: { email: 'maria.santos@student.richwell.edu' },
    update: {},
    create: {
      email: 'maria.santos@student.richwell.edu',
      password: hashedPassword,
      roleId: roles.find(r => r.name === 'student').id,
      status: 'active'
    }
  });

  console.log('✅ Users created');

  // ============================
  // 6. PROFESSORS
  // ============================
  const prof1 = await prisma.professor.upsert({
    where: { userId: prof1User.id },
    update: {},
    create: {
      userId: prof1User.id,
      department: 'CCSE',
      employmentStatus: 'Full-time'
    }
  });

  const prof2 = await prisma.professor.upsert({
    where: { userId: prof2User.id },
    update: {},
    create: {
      userId: prof2User.id,
      department: 'CCSE',
      employmentStatus: 'Full-time'
    }
  });

  const prof3 = await prisma.professor.upsert({
    where: { userId: prof3User.id },
    update: {},
    create: {
      userId: prof3User.id,
      department: 'CCSE',
      employmentStatus: 'Part-time'
    }
  });

  console.log('✅ Professors created');

  // ============================
  // 7. STUDENTS
  // ============================
  const student1 = await prisma.student.upsert({
    where: { studentNo: '2024-00001' },
    update: {},
    create: {
      userId: student1User.id,
      studentNo: '2024-00001',
      programId: bscs.id,
      yearLevel: 1,
      status: 'regular'
    }
  });

  const student2 = await prisma.student.upsert({
    where: { studentNo: '2023-00045' },
    update: {},
    create: {
      userId: student2User.id,
      studentNo: '2023-00045',
      programId: bscs.id,
      yearLevel: 2,
      status: 'irregular',
      gpa: 2.75,
      hasInc: true
    }
  });

  console.log('✅ Students created');

  // ============================
  // 8. SUBJECTS (BSCS Year 1)
  // ============================
  const subjects = [
    {
      code: 'CS101',
      name: 'Introduction to Computing',
      units: 3,
      subjectType: 'major',
      yearStanding: '1st Year',
      recommendedYear: '1',
      recommendedSemester: 'first',
      programId: bscs.id,
      prerequisiteId: null
    },
    {
      code: 'CS102',
      name: 'Computer Programming 1',
      units: 3,
      subjectType: 'major',
      yearStanding: '1st Year',
      recommendedYear: '1',
      recommendedSemester: 'first',
      programId: bscs.id,
      prerequisiteId: null
    },
    {
      code: 'MATH101',
      name: 'College Algebra',
      units: 3,
      subjectType: 'minor',
      yearStanding: '1st Year',
      recommendedYear: '1',
      recommendedSemester: 'first',
      programId: bscs.id,
      prerequisiteId: null
    },
    {
      code: 'ENG101',
      name: 'English Communication',
      units: 3,
      subjectType: 'minor',
      yearStanding: '1st Year',
      recommendedYear: '1',
      recommendedSemester: 'first',
      programId: bscs.id,
      prerequisiteId: null
    },
    {
      code: 'PE101',
      name: 'Physical Education 1',
      units: 2,
      subjectType: 'minor',
      yearStanding: '1st Year',
      recommendedYear: '1',
      recommendedSemester: 'first',
      programId: bscs.id,
      prerequisiteId: null
    },
    {
      code: 'NSTP101',
      name: 'NSTP 1',
      units: 3,
      subjectType: 'minor',
      yearStanding: '1st Year',
      recommendedYear: '1',
      recommendedSemester: 'first',
      programId: bscs.id,
      prerequisiteId: null
    }
  ];

  const createdSubjects = {};
  for (const subj of subjects) {
    const subject = await prisma.subject.upsert({
      where: { code: subj.code },
      update: {},
      create: subj
    });
    createdSubjects[subj.code] = subject;
  }

  // Second semester subjects with prerequisites
  const cs103 = await prisma.subject.upsert({
    where: { code: 'CS103' },
    update: {},
    create: {
      code: 'CS103',
      name: 'Computer Programming 2',
      units: 3,
      subjectType: 'major',
      yearStanding: '1st Year',
      recommendedYear: '1',
      recommendedSemester: 'second',
      programId: bscs.id,
      prerequisiteId: createdSubjects['CS102'].id
    }
  });

  const cs104 = await prisma.subject.upsert({
    where: { code: 'CS104' },
    update: {},
    create: {
      code: 'CS104',
      name: 'Data Structures and Algorithms',
      units: 3,
      subjectType: 'major',
      yearStanding: '1st Year',
      recommendedYear: '1',
      recommendedSemester: 'second',
      programId: bscs.id,
      prerequisiteId: createdSubjects['CS102'].id
    }
  });

  console.log('✅ Subjects created');

  // ============================
  // 9. ACADEMIC TERM
  // ============================
  const activeTerm = await prisma.academicTerm.upsert({
    where: { 
      id: 1 // Use a specific ID or create unique constraint
    },
    update: {
      isActive: true
    },
    create: {
      schoolYear: '2024-2025',
      semester: 'first',
      isActive: true
    }
  });

  console.log('✅ Academic term created');

  // ============================
  // 10. SECTIONS (First Semester)
  // ============================
  const sections = [
    {
      name: 'CS101-A',
      subjectId: createdSubjects['CS101'].id,
      professorId: prof1.id,
      maxSlots: 40,
      availableSlots: 40,
      semester: 'first',
      schoolYear: '2024-2025',
      schedule: 'MWF 8:00-9:00 AM',
      status: 'open'
    },
    {
      name: 'CS102-A',
      subjectId: createdSubjects['CS102'].id,
      professorId: prof1.id,
      maxSlots: 40,
      availableSlots: 40,
      semester: 'first',
      schoolYear: '2024-2025',
      schedule: 'MWF 9:00-10:00 AM',
      status: 'open'
    },
    {
      name: 'CS102-B',
      subjectId: createdSubjects['CS102'].id,
      professorId: prof2.id,
      maxSlots: 40,
      availableSlots: 40,
      semester: 'first',
      schoolYear: '2024-2025',
      schedule: 'TTH 10:00-11:30 AM',
      status: 'open'
    },
    {
      name: 'MATH101-A',
      subjectId: createdSubjects['MATH101'].id,
      professorId: prof2.id,
      maxSlots: 45,
      availableSlots: 45,
      semester: 'first',
      schoolYear: '2024-2025',
      schedule: 'MWF 10:00-11:00 AM',
      status: 'open'
    },
    {
      name: 'ENG101-A',
      subjectId: createdSubjects['ENG101'].id,
      professorId: prof3.id,
      maxSlots: 35,
      availableSlots: 35,
      semester: 'first',
      schoolYear: '2024-2025',
      schedule: 'TTH 8:00-9:30 AM',
      status: 'open'
    },
    {
      name: 'PE101-A',
      subjectId: createdSubjects['PE101'].id,
      professorId: prof3.id,
      maxSlots: 50,
      availableSlots: 50,
      semester: 'first',
      schoolYear: '2024-2025',
      schedule: 'SAT 7:00-9:00 AM',
      status: 'open'
    },
    {
      name: 'NSTP101-A',
      subjectId: createdSubjects['NSTP101'].id,
      professorId: prof3.id,
      maxSlots: 45,
      availableSlots: 45,
      semester: 'first',
      schoolYear: '2024-2025',
      schedule: 'SAT 9:00-12:00 PM',
      status: 'open'
    }
  ];

  for (const sec of sections) {
    await prisma.section.upsert({
      where: { name: sec.name },
      update: {},
      create: sec
    });
  }

  console.log('✅ Sections created');

  // ============================
  // 10b. BSIS PROGRAM AND SUBJECTS + SECTIONS
  // ============================
  const bsis = await prisma.program.upsert({
    where: { code: 'BSIS' },
    update: {},
    create: {
      name: 'Bachelor of Science in Information Systems',
      code: 'BSIS',
      description: 'Four-year Information Systems program',
      departmentId: ccseDept.id,
      sectorId: undergrad.id
    }
  });

  const bsisSubjectMeta = [
    // 1st Year
    { code: 'IS111', name: 'Introduction to Computing', units: 3, type: 'major', year: '1', sem: 'first', prereq: null },
    { code: 'IS112', name: 'Computer Programming 1', units: 3, type: 'major', year: '1', sem: 'first', prereq: null },
    { code: 'IS121', name: 'Computer Programming 2', units: 3, type: 'major', year: '1', sem: 'second', prereq: 'IS112' },
    { code: 'GE-MATH', name: 'Mathematics in the Modern World', units: 3, type: 'minor', year: '1', sem: 'second', prereq: null },
    // 2nd Year
    { code: 'IS211', name: 'Database Management System', units: 3, type: 'major', year: '2', sem: 'first', prereq: 'IS121' },
    { code: 'IS212', name: 'Web Systems and Technologies', units: 3, type: 'major', year: '2', sem: 'first', prereq: 'IS121' },
    { code: 'STAT212', name: 'Statistics with Software Application', units: 3, type: 'minor', year: '2', sem: 'second', prereq: 'GE-MATH' },
    { code: 'IS214', name: 'Systems Analysis and Design', units: 3, type: 'major', year: '2', sem: 'second', prereq: 'IS211' },
    // 3rd Year
    { code: 'IS311', name: 'Research Methods 1 (Thesis Proposal)', units: 3, type: 'major', year: '3', sem: 'first', prereq: 'IS214' },
    { code: 'IS312', name: 'IS Project Management', units: 3, type: 'major', year: '3', sem: 'first', prereq: 'IS214' },
    { code: 'IS322', name: 'Research Methods 2 (System Analysis & Design)', units: 3, type: 'major', year: '3', sem: 'second', prereq: 'IS311' },
    // 4th Year
    { code: 'IS411', name: 'Capstone Project 1 (System Development Phase)', units: 3, type: 'major', year: '4', sem: 'first', prereq: 'IS322' },
    { code: 'IS422', name: 'Capstone Project 2 (Implementation & Defense)', units: 3, type: 'major', year: '4', sem: 'second', prereq: 'IS411' },
  ];

  const createdIS = {};
  for (const s of bsisSubjectMeta) {
    const row = await prisma.subject.upsert({
      where: { code: s.code },
      update: {},
      create: {
        code: s.code,
        name: s.name,
        units: s.units,
        subjectType: s.type,
        yearStanding: `${s.year}st Year`,
        recommendedYear: s.year,
        recommendedSemester: s.sem,
        programId: bsis.id,
        prerequisiteId: null,
      }
    });
    createdIS[s.code] = row;
  }

  for (const s of bsisSubjectMeta) {
    if (s.prereq) {
      await prisma.subject.update({
        where: { id: createdIS[s.code].id },
        data: { prerequisiteId: createdIS[s.prereq]?.id || null }
      });
    }
  }

  const bsisSections = [
    { code: 'IS111', name: 'IS111-A', profId: prof1.id, sem: 'first', sched: 'MWF 8:00-9:00 AM' },
    { code: 'IS112', name: 'IS112-A', profId: prof1.id, sem: 'first', sched: 'MWF 9:00-10:00 AM' },
    { code: 'IS121', name: 'IS121-A', profId: prof2.id, sem: 'second', sched: 'TTH 8:00-9:30 AM' },
    { code: 'GE-MATH', name: 'GE-MATH-A', profId: prof3.id, sem: 'second', sched: 'TTH 10:00-11:30 AM' },
    { code: 'IS211', name: 'IS211-A', profId: prof1.id, sem: 'first', sched: 'MWF 10:00-11:00 AM' },
    { code: 'IS212', name: 'IS212-A', profId: prof2.id, sem: 'first', sched: 'MWF 1:00-2:00 PM' },
    { code: 'STAT212', name: 'STAT212-A', profId: prof3.id, sem: 'second', sched: 'TTH 1:00-2:30 PM' },
    { code: 'IS214', name: 'IS214-A', profId: prof2.id, sem: 'second', sched: 'TTH 2:30-4:00 PM' },
    { code: 'IS311', name: 'IS311-A', profId: prof1.id, sem: 'first', sched: 'MWF 2:00-3:00 PM' },
    { code: 'IS312', name: 'IS312-A', profId: prof2.id, sem: 'first', sched: 'MWF 3:00-4:00 PM' },
    { code: 'IS322', name: 'IS322-A', profId: prof1.id, sem: 'second', sched: 'TTH 3:00-4:30 PM' },
    { code: 'IS411', name: 'IS411-A', profId: prof2.id, sem: 'first', sched: 'SAT 9:00-12:00 PM' },
    { code: 'IS422', name: 'IS422-A', profId: prof3.id, sem: 'second', sched: 'SAT 1:00-4:00 PM' },
  ];

  for (const s of bsisSections) {
    await prisma.section.upsert({
      where: { name: s.name },
      update: {},
      create: {
        name: s.name,
        subjectId: createdIS[s.code].id,
        professorId: s.profId,
        maxSlots: 40,
        availableSlots: 40,
        semester: s.sem,
        schoolYear: '2024-2025',
        schedule: s.sched,
        status: 'open'
      }
    });
  }

  console.log('�o. BSIS program, subjects, and sections created');

  // ============================
  // 11. SAMPLE APPLICANTS
  // ============================
  await prisma.applicant.create({
    data: {
      fullName: 'Pedro Penduko',
      email: 'pedro.penduko@gmail.com',
      programId: bscs.id,
      status: 'pending',
      notes: null
    }
  });

  await prisma.applicant.create({
    data: {
      fullName: 'Anna Karenina',
      email: 'anna.k@gmail.com',
      programId: bsit.id,
      status: 'pending',
      notes: null
    }
  });

  console.log('✅ Applicants created');

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📋 Test Accounts:');
  console.log('─────────────────────────────────────────');
  console.log('👤 Admission:  admission@richwell.edu');
  console.log('👤 Registrar:  registrar@richwell.edu');
  console.log('👤 Professor:  prof.santos@richwell.edu');
  console.log('👤 Student 1:  juan.delacruz@student.richwell.edu');
  console.log('👤 Student 2:  maria.santos@student.richwell.edu');
  console.log('🔑 Password (all): password123');
  console.log('─────────────────────────────────────────\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
