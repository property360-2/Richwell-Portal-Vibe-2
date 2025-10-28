import { Router } from 'express';
import prisma from '../lib/prisma.js';
import asyncHandler from '../utils/asyncHandler.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { AllowedGrades, gradeStringToEnumValue, repeatEligibilityDate } from '../utils/grades.js';

const router = Router();

router.use(authenticate, requireRole('PROFESSOR'));

// Debug: list registered professor routes (non-production aid)
router.get('/_debug/routes', (req, res) => {
  const stack = req.app?._router?.stack || [];
  const routes = [];
  for (const layer of stack) {
    if (!layer.route && layer.handle && layer.handle.stack) {
      // Nested router
      for (const l2 of layer.handle.stack || []) {
        if (l2.route) {
          routes.push({ base: layer.regexp?.toString(), path: Object.keys(l2.route.methods).map((m)=>m.toUpperCase()+" "+ (l2.route.path || '')) });
        }
      }
    } else if (layer.route) {
      routes.push({ base: '', path: Object.keys(layer.route.methods).map((m)=>m.toUpperCase()+" "+ (layer.route.path || '')) });
    }
  }
  res.json({ routes });
});

// List assigned sections
router.get('/sections', asyncHandler(async (req, res) => {
  const professor = await prisma.professor.findUnique({ where: { userId: req.user.id } });
  if (!professor) return res.status(404).json({ message: 'Professor profile not found.' });
  const sections = await prisma.section.findMany({
    where: { professorId: professor.id },
    include: { subject: true }
  });
  res.json({ sections });
}));

// Class roster for a section (active term only)
router.get('/sections/:sectionId/roster', asyncHandler(async (req, res) => {
  const sectionId = Number(req.params.sectionId);
  const professor = await prisma.professor.findUnique({ where: { userId: req.user.id } });
  if (!professor) return res.status(404).json({ message: 'Professor profile not found.' });

  const section = await prisma.section.findUnique({ where: { id: sectionId } });
  if (!section || section.professorId !== professor.id) {
    return res.status(403).json({ message: 'You are not assigned to this section.' });
  }

  const activeTerm = await prisma.academicTerm.findFirst({ where: { isActive: true } });

  const roster = await prisma.enrollmentSubject.findMany({
    where: {
      sectionId,
      ...(activeTerm ? { enrollment: { termId: activeTerm.id } } : {})
    },
    include: {
      grade: true,
      subject: true,
      enrollment: { include: { student: { include: { user: true } } } }
    }
  });

  const data = roster.map((r) => ({
    enrollmentSubjectId: r.id,
    student: {
      id: r.enrollment.student.id,
      firstName: r.enrollment.student.user.firstName,
      lastName: r.enrollment.student.user.lastName,
      email: r.enrollment.student.user.email
    },
    subject: { id: r.subject.id, code: r.subject.code, name: r.subject.name },
    grade: r.grade ? { id: r.grade.id, value: r.grade.value, approved: r.grade.approved } : null
  }));

  res.json({ roster: data });
}));

// Encode grades for a section
// body: { grades: [{ enrollmentSubjectId, value, remarks }] }
router.post('/sections/:sectionId/grades', asyncHandler(async (req, res) => {
  const sectionId = Number(req.params.sectionId);
  const professor = await prisma.professor.findUnique({ where: { userId: req.user.id } });
  if (!professor) return res.status(404).json({ message: 'Professor profile not found.' });

  const section = await prisma.section.findUnique({ where: { id: sectionId } });
  if (!section || section.professorId !== professor.id) {
    return res.status(403).json({ message: 'You are not assigned to this section.' });
  }

  const { grades } = req.body || {};
  if (!Array.isArray(grades) || grades.length === 0) {
    return res.status(400).json({ message: 'Grades payload is required.' });
  }

  // Fetch subject to determine type (for eligibility date)
  const subject = await prisma.subject.findUnique({ where: { id: section.subjectId } });

  await prisma.$transaction(async (tx) => {
    for (const g of grades) {
      const { enrollmentSubjectId, value, remarks } = g;
      if (!AllowedGrades.includes(value)) {
        throw new Error(`Invalid grade value: ${value}`);
      }
      const enumVal = gradeStringToEnumValue(value);
      if (!enumVal) throw new Error(`Unsupported grade value: ${value}`);

      // eslint-disable-next-line no-await-in-loop
      await tx.grade.upsert({
        where: { enrollmentSubjectId },
        create: {
          enrollmentSubjectId,
          value: enumVal,
          remarks,
          encodedByProfessorId: professor.id,
          approved: false,
          repeatEligibleDate: value === '5.0' || value === 'INC' ? repeatEligibilityDate(subject.subjectType, new Date()) : null
        },
        update: {
          value: enumVal,
          remarks,
          encodedByProfessorId: professor.id,
          dateEncoded: new Date(),
          approved: false,
          repeatEligibleDate: value === '5.0' || value === 'INC' ? repeatEligibilityDate(subject.subjectType, new Date()) : null
        }
      });
    }
  });

  res.json({ message: 'Grades submitted for approval.' });
}));

export default router;
