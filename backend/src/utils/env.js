import dotenv from 'dotenv';

dotenv.config();

function getNumberFromEnv(key, defaultValue) {
  const raw = process.env[key];
  if (!raw) return defaultValue;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : defaultValue;
}

export const ACCESS_TOKEN_TTL_MINUTES = getNumberFromEnv('ACCESS_TOKEN_TTL_MINUTES', 60);
export const RESET_TOKEN_TTL_MINUTES = getNumberFromEnv('RESET_TOKEN_TTL_MINUTES', 30);
export const JWT_SECRET = process.env.JWT_SECRET || 'development-secret';
