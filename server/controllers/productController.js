import * as ProductModel from '../models/productModel.js';
import * as ProductCategoryModel from '../models/productCategoryModel.js';
import * as OrderModel from '../models/orderModel.js';
import asyncHandler from 'express-async-handler';

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

// 查询所有商品
export const queryAllProduct = asyncHandler(async (req, res) => {
  const products = await ProductModel.queryAllProduct();
  res.json({ products, total: products.length });
});

// 修改商品信息
export const updateProductInfo = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, price, stock_quantity } = req.body;
  const updatedProduct = await ProductModel.updateProductInfo(id, { name, description, price, stock_quantity });
  if (!updatedProduct) return res.status(404).json({ _error: 'Product not found' });
  res.json(updatedProduct);
});

// 通过分类获取商品信息
export const getProductsByCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const products = await ProductCategoryModel.queryProductsByCategory(categoryId);
  res.json({ products, total: products.length });
});

// 购买商品
export const buyProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity, shipping_address } = req.body;
  const userId = req.user.userId; // 从认证中间件获取用户ID

  if (!quantity || quantity <= 0) {
    return res.status(400).json({ _error: 'Invalid quantity' });
  }

  if (!shipping_address) {
    return res.status(400).json({ _error: 'Shipping address is required' });
  }

  // 检查商品是否存在
  const product = await ProductModel.getProductInfoById(productId);
  if (!product) {
    return res.status(404).json({ _error: 'Product not found' });
  }

  // 检查库存
  if (product.stock_quantity < quantity) {
    return res.status(400).json({ _error: 'Insufficient stock' });
  }

  // 创建订单项目
  const items = [{
    product_id: productId,
    quantity,
    unit_price: product.price
  }];

  // 创建订单
  const order = await OrderModel.createOrder(userId, shipping_address, items);

  // 更新库存
  await ProductModel.updateProductInfo(productId, {
    stock_quantity: product.stock_quantity - quantity
  });

  res.status(201).json({ _message: 'Order created successfully', order });
});

// 取消购买商品
export const cancelProductPurchase = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user.userId; // 从认证中间件获取用户ID

  // 获取订单信息
  const order = await OrderModel.getOrderById(orderId);
  if (!order) {
    return res.status(404).json({ _error: 'Order not found' });
  }

  // 验证订单所有权
  if (order.user_id !== userId) {
    return res.status(403).json({ _error: 'Unauthorized to cancel this order' });
  }

  // 检查订单状态
  if (order.status === 'cancelled') {
    return res.status(400).json({ _error: 'Order already cancelled' });
  }

  if (order.status === 'completed') {
    return res.status(400).json({ _error: 'Cannot cancel completed order' });
  }

  // 获取订单所有项目
  const orderItems = await OrderModel.getOrderItemsByOrderId(orderId);

  // 取消订单
  const cancelledOrder = await OrderModel.updateOrderStatus(orderId, 'cancelled');

  // 恢复所有商品的库存
  for (const item of orderItems) {
    const product = await ProductModel.getProductInfoById(item.product_id);
    if (product) {
      await ProductModel.updateProductInfo(item.product_id, {
        stock_quantity: product.stock_quantity + item.quantity
      });
    }
  }

  res.json({ _message: 'Order cancelled successfully', order: cancelledOrder });
});

// 为商品添加分类
export const addCategoryToProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { categoryId } = req.body;

  // 检查商品是否存在
  const product = await ProductModel.getProductInfoById(productId);
  if (!product) {
    return res.status(404).json({ _error: 'Product not found' });
  }

  const relation = await ProductCategoryModel.addCategoryToProduct(productId, categoryId);
  res.status(201).json({ _message: 'Category added to product successfully', relation });
});

// 从商品移除分类
export const removeCategoryFromProduct = asyncHandler(async (req, res) => {
  const { productId, categoryId } = req.params;

  const removed = await ProductCategoryModel.removeCategoryFromProduct(productId, categoryId);
  if (!removed) {
    return res.status(404).json({ _error: 'Product-category relation not found' });
  }

  res.json({ _message: 'Category removed from product successfully', relation: removed });
});

// 查询商品的所有分类
export const queryCategoriesByProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const categories = await ProductCategoryModel.queryCategoriesByProduct(productId);
  res.json({ categories, total: categories.length });
});
