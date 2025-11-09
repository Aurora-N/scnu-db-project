// 认证路由

import express from 'express';
import * as authController from '../controllers/authController.js';

const router = express.Router();

// 登录
router.post('/login', authController.login);
// 注册
router.post('/register', authController.register);

export default router;
