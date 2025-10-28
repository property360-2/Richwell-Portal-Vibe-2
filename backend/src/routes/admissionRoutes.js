import { Router } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';
import asyncHandler from '../utils/asyncHandler.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { recommendSubjectsForStudent, getActiveTerm } from '../services/recommendation.js';
import { createToken as cryptoRandomToken, hashToken as cryptoHash } from '../utils/token.js';

const router = Router();

router.use(authenticate, requireRole('ADMISSION'));

// Create a new student + user in one flow
router.post('/students', asyncHandler(async (req, res) => {
  const { email, firstName, lastName, programId, yearLevel, studentNo } = req.body || {};

  if (!email || !firstName || !lastName || !programId || !yearLevel) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  const tempPassword = Math.random().toString(36).slice(2, 10) + 'A1!';
  const passwordHash = await bcrypt.hash(tempPassword, 10);

  const student = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { email, passwordHash, role: 'STUDENT', firstName, lastName }
    });

    const created = await tx.student.create({
      data: {
        userId: user.id,
        studentNo: studentNo || `S${Date.now()}`,
        programId: Number(programId),
        yearLevel: Number(yearLevel)
      }
    });
    return { created, user };
  });

  // Create a password reset token for the new user to set password
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
  const plainToken = cryptoRandomToken();
  const tokenHash = cryptoHash(plainToken);
  await prisma.passwordResetToken.create({ data: { tokenHash, userId: student.user.id, expiresAt } });

  res.status(201).json({ student: student.created, passwordSetupToken: plainToken });
}));

// Search students by keyword
router.get('/students', asyncHandler(async (req, res) => {
  const { q } = req.query;
  const students = await prisma.student.findMany({
    where: q ? {
      OR: [
        { studentNo: { contains: String(q) } },
        { user: { firstName: { contains: String(q) } } },
        { user: { lastName: { contains: String(q) } } },
        { user: { email: { contains: String(q) } } }
      ]
    } : {},
    include: { user: true, program: true }
  });
  res.json({ students });
}));

// Get recommendations for a student
router.get('/recommendations/:studentId', asyncHandler(async (req, res) => {
  const studentId = Number(req.params.studentId);
  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) return res.status(404).json({ message: 'Student not found.' });
  const result = await recommendSubjectsForStudent(student);
  res.json(result);
}));

// Enroll a student into sections for active term
router.post('/enroll', asyncHandler(async (req, res) => {
  const { studentId, sectionIds } = req.body || {};
  if (!studentId || !Array.isArray(sectionIds) || sectionIds.length === 0) {
    return res.status(400).json({ message: 'studentId and sectionIds are required.' });
  }
  const active = await getActiveTerm();
  if (!active) return res.status(400).json({ message: 'No active term set.' });

  const sections = await prisma.section.findMany({ where: { id: { in: sectionIds.map(Number) } } });
  if (sections.length !== sectionIds.length) return res.status(400).json({ message: 'One or more sections not found.' });

  // Check slot availability
  const occupancy = await prisma.enrollmentSubject.groupBy({
    by: ['sectionId'],
    where: { enrollment: { termId: active.id } },
    _count: { sectionId: true }
  });
  const occMap = new Map(occupancy.map((o) => [o.sectionId, o._count.sectionId]));
  for (const s of sections) {
    const taken = occMap.get(s.id) || 0;
    if (taken >= s.maxSlots) {
      return res.status(400).json({ message: `Section ${s.name} is full.` });
    }
  }

  // Create enrollment and enrollment_subjects
  const enrollment = await prisma.$transaction(async (tx) => {
    const enr = await tx.enrollment.create({ data: { studentId: Number(studentId), termId: active.id, status: 'CONFIRMED' } });
    for (const s of sections) {
      // use subject.units for units
      const subj = await tx.subject.findUnique({ where: { id: s.subjectId } });
      // eslint-disable-next-line no-await-in-loop
      await tx.enrollmentSubject.create({
        data: {
          enrollmentId: enr.id,
          sectionId: s.id,
          subjectId: s.subjectId,
          units: subj.units
        }
      });
    }
    return enr;
  });

  res.status(201).json({ enrollment });
}));

export default router;
