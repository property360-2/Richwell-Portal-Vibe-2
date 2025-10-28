import { Router } from 'express';

import {
  login,
  logout,
  me,
  requestPasswordReset,
  resetPassword
} from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();

router.post('/login', asyncHandler(login));
router.post('/logout', authenticate, asyncHandler(logout));
router.get('/me', authenticate, asyncHandler(me));
router.post('/request-reset', asyncHandler(requestPasswordReset));
router.post('/reset', asyncHandler(resetPassword));

export default router;
