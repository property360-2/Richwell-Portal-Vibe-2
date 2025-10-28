import { Router } from 'express';

import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

router.get('/student', authenticate, requireRole('STUDENT'), (_req, res) => {
  res.json({
    message: 'Student dashboard access granted.',
    allowedSections: ['enrollment', 'grades', 'profile']
  });
});

router.get('/professor', authenticate, requireRole('PROFESSOR'), (_req, res) => {
  res.json({
    message: 'Professor tools available.',
    allowedSections: ['grade-entry', 'section-rosters']
  });
});

router.get('/registrar', authenticate, requireRole('REGISTRAR'), (_req, res) => {
  res.json({
    message: 'Registrar control center unlocked.',
    allowedSections: ['enrollment-approvals', 'records-maintenance']
  });
});

router.get('/admission', authenticate, requireRole('ADMISSION'), (_req, res) => {
  res.json({
    message: 'Admission workflows ready.',
    allowedSections: ['applications', 'enrollment-triage']
  });
});

router.get('/dean', authenticate, requireRole('DEAN'), (_req, res) => {
  res.json({
    message: 'Dean analytics accessible.',
    allowedSections: ['professor-assignments', 'program-analytics']
  });
});

export default router;
