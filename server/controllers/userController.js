// 用户控制器，会暴露用户敏感信息，测试用
import * as UserModel from '../models/userModel.js';
import asyncHandler from 'express-async-handler';

// 获取所有用户
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await UserModel.findAllUsers();
  res.json(users);
});

// 获取单个用户
export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await UserModel.findUserById(id);
  if (!user) return res.status(404).json({ _error: 'User not found' });
  res.json({ user, _message: "User founded" });
});

// 添加用户
export const createUser = asyncHandler(async (req, res) => {
  console.log('User create request:', req.body);
  const { username, phone_number, password } = req.body;
  const newUser = await UserModel.createUser(username, phone_number, password);
  res.status(201).json({ user: newUser, _message: 'User created' });
});

// 更新用户
export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { username, phone_number, password_hash } = req.body;
  const updatedUser = await UserModel.updateUser(id, username, phone_number, password_hash);
  if (!updatedUser) return res.status(404).json({ _error: 'User not found' });
  res.json({ user: updatedUser, _message: 'User updated' });
});

// 删除用户
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deletedUser = await UserModel.removeUser(id);
  if (!deletedUser) return res.status(404).json({ _error: 'User not found' });
  res.json({ _message: 'User deleted', user: deletedUser });
});