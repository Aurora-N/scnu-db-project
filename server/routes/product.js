// 商品路由

import express from 'express';
import * as productController from '../controllers/productController.js';
import { apiAuthHandler } from '../middlewares/apiAuthHandler.js';

const BASE_URL = '/products';
const router = express.Router();

// 定义路由
// 查询所有商品
router.get(`${BASE_URL}`, productController.queryAllProduct);
// 通过id获取某个商品信息
router.get(
  `${BASE_URL}/detail/:id`,
  apiAuthHandler,
  productController.getProductInfoById
);
// 通过名称查询这个名称的所有商品
router.get(`${BASE_URL}/query/:name`, productController.queryProductInfoByName);
// 通过分类获取商品
router.get(
  `${BASE_URL}/category/:categoryId`,
  productController.getProductsByCategory
);

// 创建商品
router.post(`${BASE_URL}`, apiAuthHandler, productController.createProduct);
// 修改商品信息
router.put(
  `${BASE_URL}/:id`,
  apiAuthHandler,
  productController.updateProductInfo
);
// 通过id删除某个商品
router.delete(
  `${BASE_URL}/:id`,
  apiAuthHandler,
  productController.deleteProductById
);

// 购买商品
router.post(
  `${BASE_URL}/:productId/buy`,
  apiAuthHandler,
  productController.buyProduct
);
// 取消购买商品
router.post(
  `${BASE_URL}/order/:orderId/cancel`,
  apiAuthHandler,
  productController.cancelProductPurchase
);

// 为商品添加分类
router.post(
  `${BASE_URL}/:productId/categories`,
  apiAuthHandler,
  productController.addCategoryToProduct
);
// 从商品移除分类
router.delete(
  `${BASE_URL}/:productId/categories/:categoryId`,
  apiAuthHandler,
  productController.removeCategoryFromProduct
);
// 查询商品的所有分类
router.get(
  `${BASE_URL}/:productId/categories`,
  productController.queryCategoriesByProduct
);

export default router;
