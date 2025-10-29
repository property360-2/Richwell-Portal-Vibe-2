import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// =============================
// Enrollment (legacy example)
// =============================
export const createStudentEnrollment = async (req, res) => {
  try {
    const { studentNo, programId, yearLevel, termId } = req.body;

    const student = await prisma.student.create({
      data: {
        studentNo,
        programId,
        yearLevel,
        user: {
          create: {
            email: `${studentNo}@richwell.edu`,
            password: "changeme123",
            role: { connect: { name: "student" } },
          },
        },
      },
    });

    await prisma.enrollment.create({
      data: {
        studentId: student.id,
        termId,
        status: "pending",
      },
    });

    res.status(201).json({ message: "Student enrolled successfully", student });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =============================
// Applicants CRUD
// =============================
export const createApplicant = async (req, res) => {
  try {
    const { fullName, email, programId, documents, details } = req.body;
    if (!fullName || !email || !programId)
      return res.status(400).json({ success: false, message: "fullName, email, programId required" });

    const app = await prisma.applicant.create({
      data: {
        fullName,
        email,
        programId: Number(programId),
        notes: details ? JSON.stringify(details) : undefined,
        documents: documents?.length
          ? {
              createMany: {
                data: documents.map((d) => ({ filename: d.filename, mimeType: d.mimeType || null, url: d.url || null })),
              },
            }
          : undefined,
      },
      include: { program: true, documents: true },
    });
    return res.status(201).json({ success: true, data: app });
  } catch (err) {
    console.error("createApplicant error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const listApplicants = async (req, res) => {
  try {
    const { q, status, programId, page = "1", size = "20" } = req.query;
    const where = {
      AND: [
        q
          ? {
              OR: [
                { fullName: { contains: String(q), mode: "insensitive" } },
                { email: { contains: String(q), mode: "insensitive" } },
              ],
            }
          : {},
        status ? { status: String(status) } : {},
        programId ? { programId: Number(programId) } : {},
      ],
    };
    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const sizeNum = Math.max(1, Math.min(100, parseInt(String(size), 10) || 20));
    const skip = (pageNum - 1) * sizeNum;
    const take = sizeNum;
    const [total, rows] = await Promise.all([
      prisma.applicant.count({ where }),
      prisma.applicant.findMany({ where, orderBy: { submittedAt: "desc" }, include: { program: true, documents: true }, skip, take }),
    ]);
    return res.json({ success: true, data: rows, pagination: { total, page: pageNum, size: sizeNum } });
  } catch (err) {
    console.error("listApplicants error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getApplicant = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const row = await prisma.applicant.findUnique({ where: { id }, include: { program: true, documents: true, processedBy: true } });
    if (!row) return res.status(404).json({ success: false, message: "Applicant not found" });
    return res.json({ success: true, data: row });
  } catch (err) {
    console.error("getApplicant error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateApplicant = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { fullName, email, programId, status, notes } = req.body;
    const row = await prisma.applicant.update({
      where: { id },
      data: {
        fullName,
        email,
        programId: programId ? Number(programId) : undefined,
        status,
        notes,
        processedById: status && status !== "pending" ? req.user?.id : undefined,
      },
      include: { program: true, documents: true },
    });
    return res.json({ success: true, data: row });
  } catch (err) {
    console.error("updateApplicant error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteApplicant = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.applicant.delete({ where: { id } });
    return res.json({ success: true });
  } catch (err) {
    console.error("deleteApplicant error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// =============================
// Enrollment Advising + Submission (Unified Flow)
// =============================

const SEM_KEYS = {
  "1": "first",
  "1st": "first",
  "first": "first",
  "2": "second",
  "2nd": "second",
  "second": "second",
  "summer": "summer",
};

const toSemKey = (s) => {
  if (!s) return "first";
  const k = String(s).trim().toLowerCase();
  return SEM_KEYS[k] || (k.includes("1") ? "first" : k.includes("2") ? "second" : "first");
};

async function getActiveTerm() {
  const term = await prisma.academicTerm.findFirst({ where: { isActive: true } });
  return term || null;
}

async function getPassedSubjectIds(studentId) {
  // Consider any grade not in failing/INC/DRP as passed
  const grades = await prisma.grade.findMany({
    where: { enrollmentSubject: { enrollment: { studentId } } },
    include: { enrollmentSubject: true },
  });
  const passed = new Set();
  for (const g of grades) {
    const v = g.gradeValue;
    if (v !== "FOUR_ZERO" && v !== "FIVE_ZERO" && v !== "INC" && v !== "DRP") {
      passed.add(g.enrollmentSubject.subjectId);
    }
  }
  return passed;
}

async function hasBlockingINC(studentId, subjectId) {
  // Block if there's an INC grade for this subject without an approved resolution
  const inc = await prisma.grade.findFirst({
    where: {
      gradeValue: "INC",
      enrollmentSubject: { subjectId, enrollment: { studentId } },
    },
  });
  if (!inc) return false;
  const resolved = await prisma.incResolution.findFirst({
    where: { studentId, subjectId, approvedByRegistrar: true },
  });
  return !resolved;
}

async function repeatNotYetEligible(studentId, subjectId) {
  // If latest grade has future repeatEligibleDate, block
  const last = await prisma.grade.findFirst({
    where: { enrollmentSubject: { subjectId, enrollment: { studentId } } },
    orderBy: { dateEncoded: "desc" },
  });
  if (!last || !last.repeatEligibleDate) return false;
  return last.repeatEligibleDate > new Date();
}

export const searchStudents = async (req, res) => {
  try {
    const q = String(req.query.q || "").trim();
    if (!q) return res.json({ success: true, data: [] });
    const rows = await prisma.student.findMany({
      where: {
        OR: [
          { studentNo: { contains: q } },
          { user: { email: { contains: q, mode: "insensitive" } } },
        ],
      },
      include: { user: true, program: true },
      take: 20,
    });
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error("searchStudents error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const adviseEnrollment = async (req, res) => {
  try {
    const { studentId, programId, yearLevel, semester } = req.query;
    const semKey = toSemKey(semester || "first");
    let progId = Number(programId) || null;
    let yLevel = yearLevel ? String(yearLevel) : null;

    let passed = new Set();
    if (studentId) {
      const student = await prisma.student.findUnique({ where: { id: Number(studentId) } });
      if (!student) return res.status(404).json({ success: false, message: "Student not found" });
      progId = progId || student.programId;
      yLevel = yLevel || String(student.yearLevel);
      passed = await getPassedSubjectIds(student.id);
    }

    if (!progId) return res.status(400).json({ success: false, message: "programId required" });

    const subjects = await prisma.subject.findMany({
      where: {
        programId: Number(progId),
        OR: [
          { recommendedSemester: semKey },
          { recommendedSemester: null },
        ],
      },
      orderBy: { code: "asc" },
    });

    const result = [];
    for (const s of subjects) {
      // prerequisite check for continuing student only
      if (studentId && s.prerequisiteId && !passed.has(s.prerequisiteId)) continue;
      if (studentId && (await hasBlockingINC(Number(studentId), s.id))) continue;
      if (studentId && (await repeatNotYetEligible(Number(studentId), s.id))) continue;

      const sections = await prisma.section.findMany({
        where: { subjectId: s.id, semester: semKey, availableSlots: { gt: 0 } },
        orderBy: { name: "asc" },
      });
      if (sections.length === 0) continue;
      result.push({ subject: s, sections, units: s.units });
    }

    return res.json({ success: true, data: { subjects: result, maxUnits: 30 } });
  } catch (err) {
    console.error("adviseEnrollment error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const submitEnrollment = async (req, res) => {
  try {
    const { mode, newStudent, studentId, selections, termId } = req.body;
    if (!Array.isArray(selections) || selections.length === 0) return res.status(400).json({ success: false, message: "No sections selected" });

    let term = termId ? await prisma.academicTerm.findUnique({ where: { id: Number(termId) } }) : await getActiveTerm();
    if (!term) {
      const year = new Date().getFullYear();
      const sy = `${year}-${year + 1}`;
      term = await prisma.academicTerm.create({ data: { schoolYear: sy, semester: "first", isActive: true } });
    }

    // fetch sections and subjects
    const sectionIds = selections.map((s) => Number(s.sectionId));
    const sections = await prisma.section.findMany({ where: { id: { in: sectionIds } }, include: { subject: true } });
    if (sections.length !== sectionIds.length) return res.status(400).json({ success: false, message: "Invalid sections" });

    const totalUnits = sections.reduce((sum, sec) => sum + (sec.subject?.units || 0), 0);
    if (totalUnits > 30) return res.status(400).json({ success: false, message: "Unit limit exceeded (max 30)" });

    let sid = Number(studentId) || null;
    if (mode === "new") {
      if (!newStudent?.email || !newStudent?.programId) return res.status(400).json({ success: false, message: "newStudent.email and programId required" });
      const user = await prisma.user.create({ data: { email: newStudent.email, password: "changeme123", role: { connect: { name: "student" } } } });
      const student = await prisma.student.create({ data: { userId: user.id, programId: Number(newStudent.programId), yearLevel: Number(newStudent.yearLevel) || 1, studentNo: `S-${Date.now()}`, status: "regular" } });
      sid = student.id;
    }
    if (!sid) return res.status(400).json({ success: false, message: "studentId required" });

    // prerequisite check for continuing
    if (mode !== "new") {
      const passed = await getPassedSubjectIds(sid);
      for (const sec of sections) {
        const subj = sec.subject;
        if (subj.prerequisiteId && !passed.has(subj.prerequisiteId)) {
          return res.status(400).json({ success: false, message: `Prerequisite not satisfied for ${subj.code}` });
        }
        if (await hasBlockingINC(sid, subj.id)) {
          return res.status(400).json({ success: false, message: `Unresolved INC blocks ${subj.code}` });
        }
        if (await repeatNotYetEligible(sid, subj.id)) {
          return res.status(400).json({ success: false, message: `Repeat not yet eligible for ${subj.code}` });
        }
      }
    }

    // transaction: create enrollment + subjects + decrement slots
    const result = await prisma.$transaction(async (db) => {
      const enrollment = await db.enrollment.create({ data: { studentId: sid, termId: term.id, status: "confirmed", totalUnits: totalUnits } });
      for (const sec of sections) {
        if (sec.availableSlots <= 0) throw new Error(`Section ${sec.name} full`);
        await db.enrollmentSubject.create({ data: { enrollmentId: enrollment.id, sectionId: sec.id, subjectId: sec.subjectId, units: sec.subject.units } });
        await db.section.update({ where: { id: sec.id }, data: { availableSlots: { decrement: 1 } } });
      }
      return enrollment;
    });

    return res.status(201).json({ success: true, data: { enrollmentId: result.id, studentId: sid, totalUnits } });
  } catch (err) {
    console.error("submitEnrollment error:", err);
    return res.status(500).json({ success: false, message: err.message || "Server error" });
  }
};

export const setApplicantStatus = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body; // accepted | rejected | pending
    if (!status) return res.status(400).json({ success: false, message: "status required" });
    const row = await prisma.applicant.update({ where: { id }, data: { status, processedById: req.user?.id }, include: { program: true } });
    return res.json({ success: true, data: row });
  } catch (err) {
    console.error("setApplicantStatus error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const createStudentFromApplicant = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const app = await prisma.applicant.findUnique({ where: { id }, include: { program: true } });
    if (!app) return res.status(404).json({ success: false, message: "Applicant not found" });
    if (app.status !== "accepted") return res.status(400).json({ success: false, message: "Only accepted applicants can be created as students" });

    // create user + student
    const user = await prisma.user.create({
      data: {
        email: app.email,
        password: "changeme123",
        role: { connect: { name: "student" } },
      },
    });

    const student = await prisma.student.create({
      data: {
        userId: user.id,
        programId: app.programId,
        yearLevel: 1,
        studentNo: `S-${Date.now()}`,
        status: "regular",
      },
    });

    await prisma.applicant.update({ where: { id: app.id }, data: { processedById: req.user?.id } });

    return res.status(201).json({ success: true, data: { userId: user.id, studentId: student.id } });
  } catch (err) {
    console.error("createStudentFromApplicant error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// =============================
// Dashboard + Analytics
// =============================
export const getAdmissionDashboard = async (req, res) => {
  try {
    // Enrollment-based dashboard
    const [totalRes, pendingRes, confirmedRes, cancelledRes] = await Promise.all([
      prisma.$queryRaw`SELECT COUNT(*) AS count FROM enrollments`,
      prisma.$queryRaw`SELECT COUNT(*) AS count FROM enrollments WHERE status = 'pending'`,
      prisma.$queryRaw`SELECT COUNT(*) AS count FROM enrollments WHERE status = 'confirmed'`,
      prisma.$queryRaw`SELECT COUNT(*) AS count FROM enrollments WHERE status = 'cancelled'`,
    ]);

    const total = Number(totalRes?.[0]?.count ?? 0);
    const pending = Number(pendingRes?.[0]?.count ?? 0);
    const confirmed = Number(confirmedRes?.[0]?.count ?? 0);
    const cancelled = Number(cancelledRes?.[0]?.count ?? 0);

    // simple time-series: count per day for last 14 days
    const days = Math.max(1, Math.min(365, parseInt(String(req.query.days || 14), 10) || 14));
    const since = new Date();
    since.setDate(since.getDate() - (days - 1));
    const rawSeries = await prisma.$queryRaw`SELECT DATE(dateEnrolled) as day, COUNT(*) as count
       FROM enrollments
       WHERE dateEnrolled >= ${since}
       GROUP BY DATE(dateEnrolled)
       ORDER BY day ASC`;

    const series = (rawSeries || []).map((row) => ({
      day: row?.day instanceof Date ? row.day.toISOString().slice(0, 10) : String(row?.day ?? ""),
      count: Number(row?.count ?? 0),
    }));

    return res.json({ success: true, data: { total, pending, confirmed, cancelled, series, range: { days } } });
  } catch (err) {
    console.error("getAdmissionDashboard error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
