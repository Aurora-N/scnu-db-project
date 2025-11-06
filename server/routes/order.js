import express from 'express';
import * as orderController from '../controllers/orderController.js';
import { apiAuthHandler } from '../middlewares/apiAuthHandler.js';

const BASE_URL = '/orders';
const router = express.Router();

// 创建新订单
router.post(BASE_URL, apiAuthHandler, orderController.createOrder);

// 通过ID获取订单详细信息
router.get(`${BASE_URL}/:id`, apiAuthHandler, orderController.getOrderInfoById);

// 查询用户的所有订单信息
router.get(`${BASE_URL}/user/:userId`, apiAuthHandler, orderController.getAllOrdersByUserId);

// 删除订单
router.delete(`${BASE_URL}/:id`, apiAuthHandler, orderController.deleteOrderById);

// 更新订单状态
router.put(`${BASE_URL}/:id/status`, apiAuthHandler, orderController.updateOrderStatus);

// 获取订单项目
router.get(`${BASE_URL}/:id/items`, apiAuthHandler, orderController.getOrderItemByOrderId);

export default router;
