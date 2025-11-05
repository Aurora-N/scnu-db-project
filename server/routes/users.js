// 用户路由

import express from 'express';
const router = express.Router();
import * as userController from '../controllers/userController.js';
const BASE_URL = '/users';

// 定义路由
// 获取所有用户
router.get(BASE_URL, userController.getAllUsers);
// 获取指定id用户
router.get(`${BASE_URL}/:id`, userController.getUserById);
// 新建（注册）用户
router.post(BASE_URL, userController.createUser);
// 更新用户信息
router.put(`${BASE_URL}/:id`, userController.updateUser);
// 删除用户
router.delete(`${BASE_URL}/:id`, userController.deleteUser);

export default router;