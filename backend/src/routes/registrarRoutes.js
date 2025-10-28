import { Router } from 'express';
import prisma from '../lib/prisma.js';
import asyncHandler from '../utils/asyncHandler.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

// Guard all routes under registrar
router.use(authenticate, requireRole('REGISTRAR'));

// Students list with filters: q, programId, yearLevel, status
router.get('/students', asyncHandler(async (req, res) => {
  const { q, programId, yearLevel, status, page = '1', pageSize = '20' } = req.query;
  const where = {};
  if (programId) where.programId = Number(programId);
  if (yearLevel) where.yearLevel = Number(yearLevel);
  if (status) where.status = String(status);
  if (q) {
    where.OR = [
      { studentNo: { contains: String(q) } },
      { user: { firstName: { contains: String(q) } } },
      { user: { lastName: { contains: String(q) } } },
      { user: { email: { contains: String(q) } } }
    ];
  }
  const skip = (Number(page) - 1) * Number(pageSize);
  const [total, students] = await Promise.all([
    prisma.student.count({ where }),
    prisma.student.findMany({ where, include: { user: true, program: true }, skip, take: Number(pageSize), orderBy: { id: 'asc' } })
  ]);
  res.json({ students, total, page: Number(page), pageSize: Number(pageSize) });
}));

// Professors list for selector (id + user info)
router.get('/professors', asyncHandler(async (_req, res) => {
  const professors = await prisma.professor.findMany({ include: { user: true } });
  res.json({ professors });
}));

// Student details (for modal view)
router.get('/students/:id', asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      user: true,
      program: true,
      enrollments: {
        include: {
          term: true,
          subjects: { include: { subject: true, grade: true, section: true } }
        },
        orderBy: { dateEnrolled: 'desc' }
      }
    }
  });
  if (!student) return res.status(404).json({ message: 'Student not found.' });
  // Placeholder docs/status history
  const documents = [];
  const statusHistory = [];
  const recentLogs = await prisma.activityLog.findMany({ where: { userId: student.userId }, orderBy: { timestamp: 'desc' }, take: 10 });
  res.json({ student, documents, statusHistory, recentLogs });
}));

// Update student status (verify/archive/etc.)
router.patch('/students/:id/status', asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body || {};
  const allowed = ['regular', 'irregular', 'inactive'];
  if (!allowed.includes(String(status))) return res.status(400).json({ message: 'Invalid status.' });
  const updated = await prisma.student.update({ where: { id }, data: { status } });
  await prisma.activityLog.create({ data: { userId: req.user.id, action: 'UPDATE_STUDENT_STATUS', description: `Student ${id} -> ${status}` } });
  res.json({ student: updated });
}));

// Registrar dashboard summary
router.get('/summary', asyncHandler(async (_req, res) => {
  const term = await prisma.academicTerm.findFirst({ where: { isActive: true } });
  let totalEnrolledStudents = 0;
  let trend = [];
  if (term) {
    const confirmed = await prisma.enrollment.findMany({
      where: { termId: term.id, status: 'CONFIRMED' },
      select: { dateEnrolled: true }
    });
    totalEnrolledStudents = confirmed.length;
    const byDay = new Map();
    const cutoff = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000);
    for (const e of confirmed) {
      const d = new Date(e.dateEnrolled);
      if (d < cutoff) continue;
      const key = d.toISOString().slice(0, 10);
      byDay.set(key, (byDay.get(key) || 0) + 1);
    }
    const days = [];
    for (let i = 29; i >= 0; i -= 1) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({ date: key, count: byDay.get(key) || 0 });
    }
    trend = days;
  }
  // Placeholders until docs/certificates exist
  const pendingDocuments = 0;
  const certificatesIssued = 0;
  res.json({ totalEnrolledStudents, pendingDocuments, certificatesIssued, trend, term });
}));

// Registrar analytics
router.get('/analytics', asyncHandler(async (_req, res) => {
  const term = await prisma.academicTerm.findFirst({ where: { isActive: true } });
  // Enrollment by program (active term)
  const enr = term ? await prisma.enrollment.findMany({
    where: { termId: term.id, status: 'CONFIRMED' },
    include: { student: { include: { program: true } } }
  }) : [];
  const byProgram = new Map();
  for (const e of enr) {
    const key = e.student.program.code;
    byProgram.set(key, (byProgram.get(key) || 0) + 1);
  }
  const enrollmentByProgram = Array.from(byProgram.entries()).map(([program, count]) => ({ program, count }));

  // Status breakdown (all students)
  const allStudents = await prisma.student.groupBy({ by: ['status'], _count: { _all: true } });
  const statusBreakdown = allStudents.map((s) => ({ status: s.status, count: s._count._all }));

  // INC students
  const incGrades = await prisma.grade.findMany({
    where: { value: 'INC' },
    include: { enrollmentSubject: { include: { enrollment: { include: { student: { include: { user: true, program: true } } } } } } }
  });
  const incSet = new Map();
  for (const g of incGrades) {
    const st = g.enrollmentSubject.enrollment.student;
    incSet.set(st.id, { id: st.id, name: `${st.user.firstName} ${st.user.lastName}`, program: st.program.code });
  }
  const incStudents = Array.from(incSet.values());

  res.json({ enrollmentByProgram, statusBreakdown, incStudents, term });
}));

// Programs CRUD
router.get('/programs', asyncHandler(async (_req, res) => {
  const programs = await prisma.program.findMany();
  res.json({ programs });
}));

router.post('/programs', asyncHandler(async (req, res) => {
  const { code, name, department, description } = req.body || {};
  const program = await prisma.program.create({ data: { code, name, department, description } });
  res.status(201).json({ program });
}));

router.put('/programs/:id', asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { code, name, department, description } = req.body || {};
  const program = await prisma.program.update({ where: { id }, data: { code, name, department, description } });
  res.json({ program });
}));

router.delete('/programs/:id', asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  await prisma.program.delete({ where: { id } });
  res.status(204).end();
}));

// Subjects CRUD (basic)
router.get('/subjects', asyncHandler(async (_req, res) => {
  const subjects = await prisma.subject.findMany({ include: { prerequisite: true, programs: true } });
  res.json({ subjects });
}));

router.post('/subjects', asyncHandler(async (req, res) => {
  const { code, name, units, subjectType, prerequisiteId } = req.body || {};
  const subject = await prisma.subject.create({ data: { code, name, units, subjectType, prerequisiteId } });
  res.status(201).json({ subject });
}));

router.put('/subjects/:id', asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { code, name, units, subjectType, prerequisiteId } = req.body || {};
  const subject = await prisma.subject.update({ where: { id }, data: { code, name, units, subjectType, prerequisiteId } });
  res.json({ subject });
}));

router.delete('/subjects/:id', asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  await prisma.subject.delete({ where: { id } });
  res.status(204).end();
}));

// Map subject to program with recommendations
router.post('/programs/:programId/subjects/:subjectId', asyncHandler(async (req, res) => {
  const programId = Number(req.params.programId);
  const subjectId = Number(req.params.subjectId);
  const { recommendedYear, recommendedSemester } = req.body || {};
  const mapping = await prisma.programSubject.create({
    data: { programId, subjectId, recommendedYear, recommendedSemester }
  });
  res.status(201).json({ mapping });
}));

router.delete('/programs/:programId/subjects/:subjectId', asyncHandler(async (req, res) => {
  const programId = Number(req.params.programId);
  const subjectId = Number(req.params.subjectId);
  await prisma.programSubject.delete({ where: { programId_subjectId: { programId, subjectId } } });
  res.status(204).end();
}));

// Sections CRUD
router.get('/sections', asyncHandler(async (_req, res) => {
  const sections = await prisma.section.findMany({ include: { subject: true, professor: true } });
  res.json({ sections });
}));

router.post('/sections', asyncHandler(async (req, res) => {
  const { name, subjectId, professorId, maxSlots, semester, academicYear, schedule, status } = req.body || {};
  if (!name || !subjectId || !professorId || !maxSlots || !semester || !academicYear) {
    return res.status(400).json({ message: 'name, subjectId, professorId, maxSlots, semester, academicYear are required.' });
  }
  const subj = await prisma.subject.findUnique({ where: { id: Number(subjectId) } });
  if (!subj) return res.status(400).json({ message: 'Subject not found.' });
  const prof = await prisma.professor.findUnique({ where: { id: Number(professorId) } });
  if (!prof) return res.status(400).json({ message: 'Professor not found.' });
  if (!['FIRST','SECOND','SUMMER'].includes(String(semester))) {
    return res.status(400).json({ message: 'Invalid semester.' });
  }
  const slots = Number(maxSlots);
  if (!Number.isFinite(slots) || slots <= 0) {
    return res.status(400).json({ message: 'maxSlots must be a positive number.' });
  }

  const section = await prisma.section.create({
    data: { name, subjectId: Number(subjectId), professorId: Number(professorId), maxSlots: slots, semester, academicYear, schedule, status: status || 'OPEN' }
  });
  res.status(201).json({ section });
}));

router.put('/sections/:id', asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { name, subjectId, professorId, maxSlots, semester, academicYear, schedule, status } = req.body || {};
  const section = await prisma.section.update({
    where: { id },
    data: { name, subjectId, professorId, maxSlots, semester, academicYear, schedule, status }
  });
  res.json({ section });
}));

router.delete('/sections/:id', asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  await prisma.section.delete({ where: { id } });
  res.status(204).end();
}));

// Academic terms
router.get('/terms', asyncHandler(async (_req, res) => {
  const terms = await prisma.academicTerm.findMany();
  res.json({ terms });
}));

router.post('/terms', asyncHandler(async (req, res) => {
  const { schoolYear, semester, isActive } = req.body || {};
  const term = await prisma.academicTerm.create({ data: { schoolYear, semester, isActive: !!isActive } });
  res.status(201).json({ term });
}));

router.patch('/terms/:id/activate', asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  // Deactivate other terms, then activate this one
  await prisma.$transaction([
    prisma.academicTerm.updateMany({ data: { isActive: false }, where: { isActive: true } }),
    prisma.academicTerm.update({ where: { id }, data: { isActive: true } })
  ]);
  const term = await prisma.academicTerm.findUnique({ where: { id } });
  res.json({ term });
}));

export default router;
