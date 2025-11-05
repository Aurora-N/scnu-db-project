// 商品路由

import express from 'express';
import * as productController from '../controllers/productController.js';
import { apiAuthHandler } from '../middlewares/apiAuthHandler.js';

const BASE_URL = '/products';
const router = express.Router();


// 定义路由
// 通过id获取某个商品信息
router.get(`${BASE_URL}/detail/:id`, apiAuthHandler, productController.getProductInfoById);
// 通过名称查询这个名称的所有商品
router.get(`${BASE_URL}/query/:name`, apiAuthHandler, productController.queryProductInfoByName);

// 创建商品
router.post(`${BASE_URL}`, apiAuthHandler, productController.createProduct);
// 通过id删除某个商品
router.delete(`${BASE_URL}/:id`, apiAuthHandler, productController.deleteProductById);
// 通过分类获取商品
router.get(`${BASE_URL}/category/:categoryId`, apiAuthHandler, productController.getProductsByCategory);

// 购买商品
router.post(`${BASE_URL}/buy`, apiAuthHandler, productController.buyProduct);
// 取消购买商品
router.post(`${BASE_URL}/cancel`, apiAuthHandler, productController.cancelProductPurchase);

export default router;