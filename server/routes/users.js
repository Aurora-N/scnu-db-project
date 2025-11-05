// 用户路由

import express from 'express';
const router = express.Router();
import userController from '../controllers/usersController.js';
const BASE_URL = '/users';

// 定义路由
router.get(BASE_URL, userController.getAllUsers);
router.get(`${BASE_URL}/:id`, userController.getUserById);
router.post(BASE_URL, userController.createUser);
router.put(`${BASE_URL}/:id`, userController.updateUser);
router.delete(`${BASE_URL}/:id`, userController.deleteUser);

export default router;