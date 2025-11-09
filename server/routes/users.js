// 用户路由

import express from 'express';
import * as userController from '../controllers/userController.js';
import { apiAuthHandler } from '../middlewares/apiAuthHandler.js';

const BASE_URL = '/users';
const router = express.Router();

// 定义路由
// 获取所有用户
router.get(BASE_URL, apiAuthHandler, userController.getAllUsers);
// 获取指定id用户
router.get(`${BASE_URL}/:id`, apiAuthHandler, userController.getUserById);
// 新建（注册）用户
router.post(BASE_URL, apiAuthHandler, userController.createUser);
// 更新用户信息
router.put(`${BASE_URL}/:id`, apiAuthHandler, userController.updateUser);
// 删除用户
router.delete(`${BASE_URL}/:id`, apiAuthHandler, userController.deleteUser);

export default router;
