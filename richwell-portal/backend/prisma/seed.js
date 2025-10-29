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

  // Applicants removed: automated enrollment only (Admission-driven)

  // =============================
  // Enrollment Advising Test Setup
  // =============================
  console.log("Setting up advising test data...");

  // Academic Terms
  const termFirst = await prisma.academicTerm.findFirst({ where: { schoolYear: "2025-2026", semester: "first" } });
  if (!termFirst) {
    await prisma.academicTerm.createMany({
      data: [
        { schoolYear: "2025-2026", semester: "first", isActive: true },
        { schoolYear: "2025-2026", semester: "second", isActive: false },
      ],
    });
  }
  const activeTerm = await prisma.academicTerm.findFirst({ where: { schoolYear: "2025-2026", semester: "first" } });

  // Department IT
  await prisma.department.upsert({ where: { code: "IT" }, update: { name: "Information Technology" }, create: { name: "Information Technology", code: "IT" } });
  const itDept = await prisma.department.findUnique({ where: { code: "IT" } });
  const chedSector = await prisma.sector.findUnique({ where: { name: "CHED" } });

  // Program BSIS (ensure set)
  const bsis = await prisma.program.upsert({
    where: { code: "BSIS" },
    update: { description: "Bachelor of Science in Information System", departmentId: itDept?.id || undefined, sectorId: chedSector?.id || undefined },
    create: { name: "BS Information System", code: "BSIS", description: "Bachelor of Science in Information System", departmentId: itDept.id, sectorId: chedSector.id },
  });

  // Subjects IS101..IS202
  const subjDefs = [
    { code: "IS101", name: "Intro to IS", units: 3, subjectType: "minor", programId: bsis.id, recommendedSemester: "first" },
    { code: "IS102", name: "Programming 1", units: 3, subjectType: "major", programId: bsis.id, recommendedSemester: "first" },
    { code: "IS103", name: "Computer Fundamentals", units: 3, subjectType: "minor", programId: bsis.id, recommendedSemester: "first" },
    { code: "IS201", name: "Programming 2", units: 3, subjectType: "major", programId: bsis.id, recommendedSemester: "first" },
    { code: "IS202", name: "Database Management", units: 3, subjectType: "major", programId: bsis.id, recommendedSemester: "first" },
  ];
  for (const s of subjDefs) {
    await prisma.subject.upsert({ where: { code: s.code }, update: { name: s.name, units: s.units, subjectType: s.subjectType, programId: s.programId, recommendedSemester: s.recommendedSemester }, create: s });
  }
  const sIS102 = await prisma.subject.findUnique({ where: { code: "IS102" } });
  const sIS201 = await prisma.subject.findUnique({ where: { code: "IS201" } });
  const sIS202 = await prisma.subject.findUnique({ where: { code: "IS202" } });
  if (sIS201 && sIS102 && sIS201.prerequisiteId !== sIS102.id) await prisma.subject.update({ where: { id: sIS201.id }, data: { prerequisiteId: sIS102.id } });
  if (sIS202 && sIS102 && sIS202.prerequisiteId !== sIS102.id) await prisma.subject.update({ where: { id: sIS202.id }, data: { prerequisiteId: sIS102.id } });

  // Professor user + record
  const profPwd = await bcrypt.hash("professor123", 10);
  const userProf = await prisma.user.upsert({ where: { email: "professor@richwell.edu" }, update: {}, create: { email: "professor@richwell.edu", password: profPwd, roleId: professorRole.id, status: "active" } });
  const professorMain = await prisma.professor.upsert({ where: { userId: userProf.id }, update: { department: "IT Department", employmentStatus: "Full-time" }, create: { userId: userProf.id, department: "IT Department", employmentStatus: "Full-time" } });

  // Sections
  const secIS101 = await prisma.section.upsert({ where: { name: "BSIS-IS101-A" }, update: { subjectId: (await prisma.subject.findUnique({ where: { code: "IS101" } })).id, professorId: professorMain.id, maxSlots: 30, availableSlots: 30, semester: "first", schoolYear: "2025-2026" }, create: { name: "BSIS-IS101-A", subjectId: (await prisma.subject.findUnique({ where: { code: "IS101" } })).id, professorId: professorMain.id, maxSlots: 30, availableSlots: 30, semester: "first", schoolYear: "2025-2026" } });
  const secIS102 = await prisma.section.upsert({ where: { name: "BSIS-1B" }, update: { subjectId: (await prisma.subject.findUnique({ where: { code: "IS102" } })).id, professorId: professorMain.id, maxSlots: 25, availableSlots: 25, semester: "first", schoolYear: "2025-2026" }, create: { name: "BSIS-1B", subjectId: (await prisma.subject.findUnique({ where: { code: "IS102" } })).id, professorId: professorMain.id, maxSlots: 25, availableSlots: 25, semester: "first", schoolYear: "2025-2026" } });

  // Students (current + new)
  const studPwd = await bcrypt.hash("student123", 10);
  const userJuan = await prisma.user.upsert({ where: { email: "juan@richwell.edu" }, update: {}, create: { email: "juan@richwell.edu", password: studPwd, roleId: studentRole.id, status: "active" } });
  const juan = await prisma.student.upsert({ where: { userId: userJuan.id }, update: {}, create: { userId: userJuan.id, studentNo: "2025-001", programId: bsis.id, yearLevel: 2, hasInc: true, status: "regular" } });
  const userAna = await prisma.user.upsert({ where: { email: "ana@richwell.edu" }, update: {}, create: { email: "ana@richwell.edu", password: studPwd, roleId: studentRole.id, status: "active" } });
  await prisma.student.upsert({ where: { userId: userAna.id }, update: {}, create: { userId: userAna.id, studentNo: "2025-002", programId: bsis.id, yearLevel: 1, status: "regular" } });

  // Grade INC for Juan on IS102
  if (sIS102 && activeTerm && secIS102) {
    const profForGrade = (typeof professorMain !== 'undefined' && professorMain) || await prisma.professor.findFirst();
    await prisma.grade.create({
      data: {
        gradeValue: "INC",
        remarks: "Incomplete",
        encodedById: profForGrade?.id || (await prisma.professor.create({ data: { userId: userProf.id, department: "IT Department", employmentStatus: "Full-time" } })).id,
        enrollmentSubject: {
          create: {
            enrollment: { create: { studentId: juan.id, termId: activeTerm.id, totalUnits: 3, status: "confirmed" } },
            subjectId: sIS102.id,
            sectionId: secIS102.id,
            units: 3,
          },
        },
      },
    });
  }
  console.log("Advising test data ready");

  // Enrollment records to exercise dashboard counts and series
  // Confirmed enrollment for Ana in IS101 (if not exists)
  const anaStudent = await prisma.student.findFirst({ where: { user: { email: "ana@richwell.edu" } } });
  if (anaStudent && activeTerm && secIS101) {
    const exists = await prisma.enrollment.findUnique({ where: { studentId_termId: { studentId: anaStudent.id, termId: activeTerm.id } } });
    if (!exists) {
      const e = await prisma.enrollment.create({ data: { studentId: anaStudent.id, termId: activeTerm.id, totalUnits: 3, status: "confirmed" } });
      const subjIS101 = await prisma.subject.findUnique({ where: { code: "IS101" } });
      await prisma.enrollmentSubject.create({ data: { enrollmentId: e.id, sectionId: secIS101.id, subjectId: subjIS101.id, units: 3 } });
    }
  }

  // Pending enrollment for Ben
  const benPwd = await bcrypt.hash("student123", 10);
  const userBen = await prisma.user.upsert({ where: { email: "ben@richwell.edu" }, update: {}, create: { email: "ben@richwell.edu", password: benPwd, roleId: studentRole.id, status: "active" } });
  const ben = await prisma.student.upsert({ where: { userId: userBen.id }, update: {}, create: { userId: userBen.id, studentNo: "2025-003", programId: bsis.id, yearLevel: 1, status: "regular" } });
  const benEnroll = await prisma.enrollment.findUnique({ where: { studentId_termId: { studentId: ben.id, termId: activeTerm.id } } });
  if (!benEnroll) {
    await prisma.enrollment.create({ data: { studentId: ben.id, termId: activeTerm.id, totalUnits: 0, status: "pending" } });
  }

  // Cancelled enrollment for Cara in IS101
  const caraPwd = await bcrypt.hash("student123", 10);
  const userCara = await prisma.user.upsert({ where: { email: "cara@richwell.edu" }, update: {}, create: { email: "cara@richwell.edu", password: caraPwd, roleId: studentRole.id, status: "active" } });
  const cara = await prisma.student.upsert({ where: { userId: userCara.id }, update: {}, create: { userId: userCara.id, studentNo: "2025-004", programId: bsis.id, yearLevel: 1, status: "regular" } });
  const caraEnroll = await prisma.enrollment.findUnique({ where: { studentId_termId: { studentId: cara.id, termId: activeTerm.id } } });
  if (!caraEnroll && secIS101) {
    const e = await prisma.enrollment.create({ data: { studentId: cara.id, termId: activeTerm.id, totalUnits: 3, status: "cancelled" } });
    const subjIS101 = await prisma.subject.findUnique({ where: { code: "IS101" } });
    await prisma.enrollmentSubject.create({ data: { enrollmentId: e.id, sectionId: secIS101.id, subjectId: subjIS101.id, units: 3 } });
  }

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
