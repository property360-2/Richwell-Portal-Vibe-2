import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import prisma from '../lib/prisma.js';
import { createToken, hashToken } from '../utils/token.js';
import {
  ACCESS_TOKEN_TTL_MINUTES,
  RESET_TOKEN_TTL_MINUTES,
  JWT_SECRET
} from '../utils/env.js';

function sanitizeUser(user) {
  if (!user) return null;
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

function signAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: `${ACCESS_TOKEN_TTL_MINUTES}m` }
  );
}

export async function login(req, res) {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);

  if (!isValidPassword) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  const token = signAccessToken(user);
  const tokenHash = hashToken(token);

  await prisma.session.create({
    data: {
      tokenHash,
      userId: user.id
    }
  });

  return res.json({
    token,
    user: sanitizeUser(user)
  });
}

export async function logout(req, res) {
  if (!req.token) {
    return res.status(400).json({ message: 'No active session found.' });
  }

  const tokenHash = hashToken(req.token);

  await prisma.session.updateMany({
    where: {
      tokenHash,
      revokedAt: null
    },
    data: {
      revokedAt: new Date()
    }
  });

  return res.json({ message: 'Logged out successfully.' });
}

export async function me(req, res) {
  return res.json({ user: sanitizeUser(req.user) });
}

export async function requestPasswordReset(req, res) {
  const { email } = req.body || {};

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return res.json({ message: 'If the email exists, a reset link has been generated.' });
  }

  const plainToken = createToken();
  const tokenHash = hashToken(plainToken);
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: {
      tokenHash,
      userId: user.id,
      expiresAt
    }
  });

  return res.json({
    message: 'Password reset token generated.',
    resetToken: plainToken
  });
}

export async function resetPassword(req, res) {
  const { token, password } = req.body || {};

  if (!token || !password) {
    return res.status(400).json({ message: 'Token and new password are required.' });
  }

  if (password.length < 8) {
    return res
      .status(400)
      .json({ message: 'Password must be at least 8 characters long.' });
  }

  const tokenHash = hashToken(token);

  const storedToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash }
  });

  if (!storedToken || storedToken.usedAt) {
    return res.status(400).json({ message: 'Invalid or expired reset token.' });
  }

  if (storedToken.expiresAt < new Date()) {
    return res.status(400).json({ message: 'Invalid or expired reset token.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: storedToken.userId },
      data: { passwordHash }
    }),
    prisma.passwordResetToken.update({
      where: { tokenHash },
      data: { usedAt: new Date() }
    }),
    prisma.session.updateMany({
      where: { userId: storedToken.userId, revokedAt: null },
      data: { revokedAt: new Date() }
    })
  ]);

  return res.json({ message: 'Password updated successfully.' });
}
