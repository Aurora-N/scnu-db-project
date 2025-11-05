import jwt from 'jsonwebtoken';
import { config } from './env.js';

const JWT_SECRET = config.JWT_SECRET || 'your_secret_key';
const JWT_EXPIRES_IN = config.JWT_EXPIRES_IN || '2h';

export const generateToken = (userId, phone_number) => {
  return jwt.sign({ userId, phone_number }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};