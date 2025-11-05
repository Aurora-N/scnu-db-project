import * as ProductModel from '../models/productModel.js';
import asyncHandler from 'express-async-handler';
import { v4 as uuidv4 } from 'uuid'; // 导入 uuid

// 通过id获取商品信息
export const getProductInfoById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const products = await ProductModel.getProductInfoById(id);
  if (!products) return res.status(404).json({ _error: 'Product not found' });
  res.json(products);
});

// 通过名称查找商品信息
export const queryProductInfoByName = asyncHandler(async (req, res) => {
  const { name } = req.params;
  const products = await ProductModel.queryProductInfoByName(name) || [];
  res.json({ products, total: products.length });
});

// 创建商品
export const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, stock_quantity } = req.body;
  const newProduct = await ProductModel.createProduct({ name, description, price, stock_quantity });
  res.status(201).json(newProduct);
});

// 删除商品
export const deleteProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deletedProduct = await ProductModel.deleteProductById(id);
  if (!deletedProduct) return res.status(404).json({ _error: 'Product not found' });
  res.json({ _message: 'Product deleted successfully', product: deletedProduct });
});

// 通过分类获取商品信息
export const getProductsByCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const products = await ProductModel.getProductsByCategory(categoryId);
  res.json({ products, total: products.length });
});

// 购买商品
export const buyProduct = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user.userId; // 从认证中间件获取用户ID
  const orderId = uuidv4(); // 生成一个临时订单ID
  try {
    console.log('Buy: ', userId, productId, quantity, orderId)
    const result = await ProductModel.buyProduct(userId, productId, quantity, orderId);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ _error: error.message });
  }
});

// 取消购买商品
export const cancelProductPurchase = asyncHandler(async (req, res) => {
  const { orderId, productId, quantity } = req.body;
  const userId = req.user.userId; // 从认证中间件获取用户ID
  try {
    const result = await ProductModel.cancelProductPurchase(userId, orderId, productId, quantity);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ _error: error.message });
  }
});
