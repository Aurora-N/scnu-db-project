// 商品分类路由

import express from 'express';
import * as categoryController from '../controllers/categoryController.js';
import { apiAuthHandler } from '../middlewares/apiAuthHandler.js';

const BASE_URL = '/categories';
const router = express.Router();

// 定义路由
// 获取所有商品分类
router.get(`${BASE_URL}`, apiAuthHandler, categoryController.queryAllCategory);

// 获取指定ID的商品分类
router.get(
  `${BASE_URL}/detail/:id`,
  apiAuthHandler,
  categoryController.queryCategoryById
);

// 获取分类详情（包含商品列表）
router.get(
  `${BASE_URL}/:id/with-products`,
  apiAuthHandler,
  categoryController.getCategoryWithProducts
);

// 获取分类下的所有商品
router.get(
  `${BASE_URL}/:id/products`,
  apiAuthHandler,
  categoryController.getProductsByCategory
);

// 创建商品分类
router.post(`${BASE_URL}`, apiAuthHandler, categoryController.createCategory);

// 更新商品分类
router.put(
  `${BASE_URL}/:id`,
  apiAuthHandler,
  categoryController.updateCategory
);

// 删除商品分类
router.delete(
  `${BASE_URL}/:id`,
  apiAuthHandler,
  categoryController.deleteCategory
);

export default router;
