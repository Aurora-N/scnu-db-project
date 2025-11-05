// 用户控制器
import * as User from '../models/userModel.js';
import asyncHandler from 'express-async-handler';

// 获取所有用户
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.findAllUsers();
  res.json(users);
});

// 获取单个用户
export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findUserById(id);
  if (!user) return res.status(404).json({ _error: 'User not found' });
  res.json({ user, _message: "User founded" });
});

// 添加用户
export const createUser = asyncHandler(async (req, res) => {
  console.log('User create request:', req.body);
  const { username, phone_number, password } = req.body;
  const newUser = await User.createUser(username, phone_number, password);
  res.status(201).json(newUser);
});

// 更新用户
export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { username, phone_number, password_hash } = req.body;
  const updatedUser = await User.updateUser(id, username, phone_number, password_hash);
  if (!updatedUser) return res.status(404).json({ _error: 'User not found' });
  res.json(updatedUser);
});

// 删除用户
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deletedUser = await User.removeUser(id);
  if (!deletedUser) return res.status(404).json({ error: 'User not found' });
  res.json({ message: 'User deleted', user: deletedUser });
});