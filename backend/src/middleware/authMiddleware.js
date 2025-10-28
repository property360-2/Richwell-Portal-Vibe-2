import jwt from 'jsonwebtoken';

import prisma from '../lib/prisma.js';
import { hashToken } from '../utils/token.js';
import { JWT_SECRET } from '../utils/env.js';

export async function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const [, token] = header.match(/^Bearer\s+(.+)/i) || [];

  if (!token) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const tokenHash = hashToken(token);

    const session = await prisma.session.findUnique({ where: { tokenHash } });

    if (!session || session.revokedAt) {
      return res.status(401).json({ message: 'Session has expired.' });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });

    if (!user) {
      return res.status(401).json({ message: 'User no longer exists.' });
    }

    req.user = user;
    req.token = token;

    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}
