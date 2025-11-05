// 用户控制器
import User from '../models/userModel.js';

// 获取所有用户
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAllUsers();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// 获取单个用户
export const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findUserById(id);
    if (!user) return res.status(404).send('User not found');
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// 添加用户
export const createUser = async (req, res) => {
  const { name, email } = req.body;
  try {
    const newUser = await User.createUser(name, email);
    res.status(201).json(newUser);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// 更新用户
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  try {
    const updatedUser = await User.updateUser(id, name, email);
    if (!updatedUser) return res.status(404).send('User not found');
    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// 删除用户
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedUser = await User.removeUser(id);
    if (!deletedUser) return res.status(404).send('User not found');
    res.json({ message: 'User deleted', user: deletedUser });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};