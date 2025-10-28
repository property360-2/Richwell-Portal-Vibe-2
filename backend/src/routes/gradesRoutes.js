import { Router } from 'express';
import prisma from '../lib/prisma.js';
import asyncHandler from '../utils/asyncHandler.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { gradeEnumToString, computeGPA } from '../utils/grades.js';

const router = Router();

// Registrar approvals
router.get('/registrar/pending', authenticate, requireRole('REGISTRAR'), asyncHandler(async (_req, res) => {
  const pending = await prisma.grade.findMany({ where: { approved: false }, include: { enrollmentSubject: true } });
  res.json({ pending });
}));

router.post('/registrar/:gradeId/approve', authenticate, requireRole('REGISTRAR'), asyncHandler(async (req, res) => {
  const gradeId = Number(req.params.gradeId);
  const updated = await prisma.grade.update({ where: { id: gradeId }, data: { approved: true } });
  res.json({ grade: updated });
}));

// Student grade views
router.get('/student/me', authenticate, requireRole('STUDENT'), asyncHandler(async (req, res) => {
  const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
  if (!student) return res.status(404).json({ message: 'Student profile not found.' });
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: student.id },
    include: {
      term: true,
      subjects: { include: { grade: true, subject: true, section: true } }
    },
    orderBy: { dateEnrolled: 'desc' }
  });

  const formatted = enrollments.map((enr) => ({
    term: { schoolYear: enr.term.schoolYear, semester: enr.term.semester },
    subjects: enr.subjects.map((s) => ({
      subject: { id: s.subject.id, code: s.subject.code, name: s.subject.name, units: s.subject.units },
      section: { id: s.section.id, name: s.section.name },
      grade: s.grade ? { id: s.grade.id, value: gradeEnumToString(s.grade.value), approved: s.grade.approved, dateEncoded: s.grade.dateEncoded } : null
    }))
  }));

  // Compute GPA over approved numeric grades
  const allGrades = enrollments
    .flatMap((enr) => enr.subjects.map((s) => s.grade))
    .filter((g) => g && g.approved);
  const gpa = computeGPA(allGrades.map((g) => gradeEnumToString(g.value)).filter(Boolean));

  res.json({ enrollments: formatted, gpa });
}));

export default router;
