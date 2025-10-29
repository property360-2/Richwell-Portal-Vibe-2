import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  // Roles
  const roles = ["student", "professor", "registrar", "admission", "dean", "admin"];
  for (const name of roles) {
    await prisma.role.upsert({ where: { name }, update: {}, create: { name } });
  }
  console.log("Roles created");

  // Admin user
  const adminEmail = "admin@richwell.edu";
  const adminPassword = await bcrypt.hash("admin123", 10);
  const adminRole = await prisma.role.findUnique({ where: { name: "admin" } });
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: { email: adminEmail, password: adminPassword, roleId: adminRole.id, status: "active" },
  });
  console.log("Admin account ready: admin@richwell.edu / admin123");

  // Staff users (admission, registrar, dean)
  const [admissionRole, registrarRole, deanRole, professorRole, studentRole] = await Promise.all([
    prisma.role.findUnique({ where: { name: "admission" } }),
    prisma.role.findUnique({ where: { name: "registrar" } }),
    prisma.role.findUnique({ where: { name: "dean" } }),
    prisma.role.findUnique({ where: { name: "professor" } }),
    prisma.role.findUnique({ where: { name: "student" } }),
  ]);

  const [admissionPwd, registrarPwd, deanPwd] = await Promise.all([
    bcrypt.hash("admission123", 10),
    bcrypt.hash("registrar123", 10),
    bcrypt.hash("dean123", 10),
  ]);

  await prisma.user.upsert({
    where: { email: "admission@richwell.edu" },
    update: {},
    create: { email: "admission@richwell.edu", password: admissionPwd, roleId: admissionRole.id, status: "active" },
  });
  await prisma.user.upsert({
    where: { email: "registrar@richwell.edu" },
    update: {},
    create: { email: "registrar@richwell.edu", password: registrarPwd, roleId: registrarRole.id, status: "active" },
  });
  await prisma.user.upsert({
    where: { email: "dean@richwell.edu" },
    update: {},
    create: { email: "dean@richwell.edu", password: deanPwd, roleId: deanRole.id, status: "active" },
  });
  console.log("Staff ready: admission@ / registrar@ / dean@ (use respective *123 passwords)");

  // Lookups: sectors
  const sectorNames = [
    { name: "CHED", description: "Commission on Higher Education" },
    { name: "SHS", description: "Senior High School" },
    { name: "TESDA", description: "Technical Education and Skills Development Authority" },
  ];
  for (const s of sectorNames) {
    await prisma.sector.upsert({ where: { name: s.name }, update: {}, create: s });
  }
  const ched = await prisma.sector.findUnique({ where: { name: "CHED" } });

  // Lookups: departments
  const deptDefs = [
    { name: "College of Information Technology & Engineering", code: "CITE" },
    { name: "College of Engineering", code: "COE" },
    { name: "College of Health Sciences", code: "CHS" },
  ];
  for (const d of deptDefs) {
    await prisma.department.upsert({ where: { name: d.name }, update: { code: d.code }, create: d });
  }
  const cite = await prisma.department.findUnique({ where: { name: "College of Information Technology & Engineering" } });
  const coe = await prisma.department.findUnique({ where: { name: "College of Engineering" } });
  const chs = await prisma.department.findUnique({ where: { name: "College of Health Sciences" } });

  // Programs + auto curriculum
  const programs = [
    { code: "BSIS", name: "Bachelor of Science in Information System", departmentId: cite.id, sectorId: ched.id },
    { code: "BSCE", name: "Bachelor of Science in Civil Engineering", departmentId: coe.id, sectorId: ched.id },
    { code: "BSN", name: "Bachelor of Science in Nursing", departmentId: chs.id, sectorId: ched.id },
  ];

  for (const program of programs) {
    const p = await prisma.program.upsert({
      where: { code: program.code },
      update: { name: program.name, departmentId: program.departmentId, sectorId: program.sectorId },
      create: { code: program.code, name: program.name, departmentId: program.departmentId, sectorId: program.sectorId },
    });
    const existingCurr = await prisma.curriculum.findFirst({ where: { programId: p.id } });
    if (!existingCurr) {
      const year = new Date().getFullYear();
      await prisma.curriculum.create({ data: { programId: p.id, startYear: year, endYear: year + 4 } });
    }
  }
  console.log("Programs and curriculums seeded");

  // Subjects for BSIS
  const bsisProgram = await prisma.program.findUnique({ where: { code: "BSIS" } });
  if (bsisProgram) {
    const subjects = [
      { code: "IT101", name: "Introduction to Computing", units: 3, subjectType: "major", programId: bsisProgram.id, recommendedYear: "1st", recommendedSemester: "first" },
      { code: "IT102", name: "Computer Programming 1", units: 3, subjectType: "major", programId: bsisProgram.id, recommendedYear: "1st", recommendedSemester: "first" },
    ];
    for (const s of subjects) {
      await prisma.subject.upsert({ where: { code: s.code }, update: {}, create: s });
    }
  }
  console.log("Subjects added");

  // Sample professor and section
  const profPassword = await bcrypt.hash("prof123", 10);
  const profRole = await prisma.role.findUnique({ where: { name: "professor" } });
  const profUser = await prisma.user.upsert({ where: { email: "prof.juan@richwell.edu" }, update: {}, create: { email: "prof.juan@richwell.edu", password: profPassword, roleId: profRole.id } });
  const professor = await prisma.professor.upsert({ where: { userId: profUser.id }, update: {}, create: { userId: profUser.id, department: "Information Systems", employmentStatus: "full-time" } });
  // Additional professors
  const [profPwd2, profPwd3] = await Promise.all([bcrypt.hash("prof123", 10), bcrypt.hash("prof123", 10)]);
  const userProf2 = await prisma.user.upsert({ where: { email: "prof.santos@richwell.edu" }, update: {}, create: { email: "prof.santos@richwell.edu", password: profPwd2, roleId: professorRole.id, status: "active" } });
  const userProf3 = await prisma.user.upsert({ where: { email: "prof.maria@richwell.edu" }, update: {}, create: { email: "prof.maria@richwell.edu", password: profPwd3, roleId: professorRole.id, status: "active" } });
  await prisma.professor.upsert({ where: { userId: userProf2.id }, update: {}, create: { userId: userProf2.id, department: "Engineering", employmentStatus: "part-time" } });
  await prisma.professor.upsert({ where: { userId: userProf3.id }, update: {}, create: { userId: userProf3.id, department: "Health Sciences", employmentStatus: "full-time" } });
  const subj = await prisma.subject.findUnique({ where: { code: "IT101" } });
  if (subj) {
    await prisma.section.upsert({
      where: { name: "BSIS-1A" },
      update: {},
      create: { name: "BSIS-1A", subjectId: subj.id, professorId: professor.id, maxSlots: 40, availableSlots: 40, semester: "first", schoolYear: "2025-2026", schedule: "MWF 8:00AM - 10:00AM" },
    });
  }
  console.log("Section BSIS-1A added");

  // Sample students (users + student profiles)
  const [studPwd1, studPwd2, studPwd3] = await Promise.all([
    bcrypt.hash("student123", 10),
    bcrypt.hash("student123", 10),
    bcrypt.hash("student123", 10),
  ]);
  const bsceProgram = await prisma.program.findUnique({ where: { code: "BSCE" } });
  const userStud1 = await prisma.user.upsert({ where: { email: "s.20250001@richwell.edu" }, update: {}, create: { email: "s.20250001@richwell.edu", password: studPwd1, roleId: studentRole.id, status: "active" } });
  const userStud2 = await prisma.user.upsert({ where: { email: "s.20250002@richwell.edu" }, update: {}, create: { email: "s.20250002@richwell.edu", password: studPwd2, roleId: studentRole.id, status: "active" } });
  const userStud3 = await prisma.user.upsert({ where: { email: "s.20250003@richwell.edu" }, update: {}, create: { email: "s.20250003@richwell.edu", password: studPwd3, roleId: studentRole.id, status: "active" } });
  if (bsisProgram) {
    await prisma.student.upsert({ where: { userId: userStud1.id }, update: {}, create: { userId: userStud1.id, studentNo: "2025-0001", programId: bsisProgram.id, yearLevel: 1, status: "regular" } });
  }
  if (bsceProgram) {
    await prisma.student.upsert({ where: { userId: userStud2.id }, update: {}, create: { userId: userStud2.id, studentNo: "2025-0002", programId: bsceProgram.id, yearLevel: 2, status: "regular" } });
  }
  if (bsisProgram) {
    await prisma.student.upsert({ where: { userId: userStud3.id }, update: {}, create: { userId: userStud3.id, studentNo: "2025-0003", programId: bsisProgram.id, yearLevel: 1, status: "regular" } });
  }
  console.log("Sample students added (s.2025000x@ / student123)");

  // Sample applicants for Admission Dashboard/Applicants
  const admissionUser = await prisma.user.findUnique({ where: { email: "admission@richwell.edu" } });
  const bsnProgram = await prisma.program.findUnique({ where: { code: "BSN" } });
  const day = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);
  const applicants = [
    { fullName: "Maria Dela Cruz", email: "maria.delacruz@example.com", programId: bsisProgram?.id, status: "pending", submittedAt: day(1) },
    { fullName: "Juan Dela Cruz", email: "juan.dc@example.com", programId: bsceProgram?.id, status: "accepted", submittedAt: day(3) },
    { fullName: "Ana Santos", email: "ana.santos@example.com", programId: bsnProgram?.id, status: "rejected", submittedAt: day(7) },
    { fullName: "Pedro Reyes", email: "pedro.reyes@example.com", programId: bsisProgram?.id, status: "pending", submittedAt: day(0) },
    { fullName: "Liza Cruz", email: "liza.cruz@example.com", programId: bsceProgram?.id, status: "accepted", submittedAt: day(10) },
  ].filter((a) => a.programId);

  for (const a of applicants) {
    await prisma.applicant.create({
      data: {
        fullName: a.fullName,
        email: a.email,
        programId: a.programId,
        status: a.status,
        submittedAt: a.submittedAt,
        processedById: a.status !== "pending" ? admissionUser?.id : null,
        documents: {
          create: [
            { filename: "Form138.pdf", mimeType: "application/pdf" },
            { filename: "BirthCertificate.jpg", mimeType: "image/jpeg" },
          ],
        },
      },
    });
  }
  console.log("Sample applicants added");

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
