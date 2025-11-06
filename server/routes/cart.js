import express from 'express';
import * as cartController from '../controllers/cartController.js';
import { apiAuthHandler } from '../middlewares/apiAuthHandler.js';

const BASE_URL = '/carts';
const router = express.Router();

// 获取用户的购物车信息（包含商品列表和总价）
router.get(`${BASE_URL}/user/:userId`, apiAuthHandler, cartController.getUserCart);

// 创建购物车
router.post(BASE_URL, apiAuthHandler, cartController.createCart);

// 删除购物车
router.delete(`${BASE_URL}/:cartId`, apiAuthHandler, cartController.deleteCart);

// 删除用户的购物车
router.delete(`${BASE_URL}/user/:userId`, apiAuthHandler, cartController.deleteUserCart);

// 清空购物车（保留购物车但删除所有商品）
router.delete(`${BASE_URL}/:cartId/clear`, apiAuthHandler, cartController.clearCart);

// 获取购物车摘要（总价、商品数量等）
router.get(`${BASE_URL}/:cartId/summary`, apiAuthHandler, cartController.getCartSummary);

// 获取购物车的所有商品
router.get(`${BASE_URL}/:cartId/items`, apiAuthHandler, cartController.getCartItems);

// 添加商品到购物车
router.post(`${BASE_URL}/:cartId/items`, apiAuthHandler, cartController.addItemToCart);

// 更新购物车商品数量
router.put(`${BASE_URL}/items/:cartItemId`, apiAuthHandler, cartController.updateCartItem);

// 从购物车删除商品（通过购物车项目ID）
router.delete(`${BASE_URL}/items/:cartItemId`, apiAuthHandler, cartController.removeItemFromCart);

// 从购物车删除商品（通过商品ID）
router.delete(`${BASE_URL}/:cartId/products/:productId`, apiAuthHandler, cartController.removeProductFromCart);

// 批量删除购物车商品
router.post(`${BASE_URL}/items/batch-delete`, apiAuthHandler, cartController.removeBatchItems);

// 使用购物车商品创建订单
router.post(`${BASE_URL}/:cartId/checkout`, apiAuthHandler, cartController.createOrderFromCart);

export default router;
