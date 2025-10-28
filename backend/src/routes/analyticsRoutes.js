import { Router } from 'express';
import prisma from '../lib/prisma.js';
import asyncHandler from '../utils/asyncHandler.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

router.get('/dean', authenticate, requireRole('DEAN'), asyncHandler(async (_req, res) => {
  const [studentCount, professorCount, programCount, subjectCount] = await Promise.all([
    prisma.student.count(),
    prisma.professor.count(),
    prisma.program.count(),
    prisma.subject.count()
  ]);

  res.json({
    summary: { studentCount, professorCount, programCount, subjectCount }
  });
}));

router.get('/registrar', authenticate, requireRole('REGISTRAR'), asyncHandler(async (_req, res) => {
  const [enrollments, pendingGrades] = await Promise.all([
    prisma.enrollment.count(),
    prisma.grade.count({ where: { approved: false } })
  ]);
  res.json({ summary: { enrollments, pendingGrades } });
}));

router.get('/admission', authenticate, requireRole('ADMISSION'), asyncHandler(async (_req, res) => {
  const [openSections, totalSections] = await Promise.all([
    prisma.section.count({ where: { status: 'OPEN' } }),
    prisma.section.count()
  ]);
  res.json({ summary: { openSections, totalSections } });
}));

export default router;

