import * as UserModel from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import asyncHandler from 'express-async-handler';
import { generateToken } from '../utils/token.js';

// 用户注册
export const register = asyncHandler(async (req, res) => {
  const { username, phone_number, password } = req.body;

  // 检查电话号码是否已注册
  const existsUser = await UserModel.findUserByPhoneNumber(phone_number);
  if (existsUser) {
    return res.status(400).json({ _message: 'Phone number already exists' });
  }

  // 加密密码
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await UserModel.createUser(
    username,
    phone_number,
    hashedPassword
  );

  // 生成 JWT
  const token = generateToken(newUser.user_id, newUser.phone_number);

  res.status(201).json({
    token,
    userId: newUser.user_id,
    _message: 'User created successfully',
  });
});

// 用户登录
export const login = asyncHandler(async (req, res) => {
  const { phone_number, password } = req.body;

  const user = await UserModel.findUserByPhoneNumber(phone_number);
  if (!user) return res.status(400).json({ _message: 'User not found' });

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch)
    return res.status(400).json({ _message: 'Invalid credentials' });

  // 生成 JWT
  const token = generateToken(user.user_id, user.phone_number);

  res.json({ token, userId: user.user_id, _message: 'Login successful' });
});
