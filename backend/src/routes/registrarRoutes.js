import { Router } from 'express';
import prisma from '../lib/prisma.js';
import asyncHandler from '../utils/asyncHandler.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

// Guard all routes under registrar
router.use(authenticate, requireRole('REGISTRAR'));

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
  const section = await prisma.section.create({
    data: { name, subjectId, professorId, maxSlots, semester, academicYear, schedule, status }
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

