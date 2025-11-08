import jwt from 'jsonwebtoken';
import { config } from '../utils/env.js';

const JWT_SECRET = config.JWT_SECRET || 'your_secret_key';

export const apiAuthHandler = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <TOKEN_STRING>

  if (!token) return res.status(401).json({ _error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET); // 验证token，解码用户信息
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ _error: 'Invalid token' });
  }
};
