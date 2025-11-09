import * as OrderModel from '../models/orderModel.js';
import asyncHandler from 'express-async-handler';

// 创建新订单
export const createOrder = asyncHandler(async (req, res) => {
  const { userId, shippingAddress, items } = req.body;

  // 验证输入
  if (
    !userId ||
    !shippingAddress ||
    !items ||
    !Array.isArray(items) ||
    items.length === 0
  ) {
    res.status(400).json({
      _error:
        'Invalid order data. userId, shippingAddress, and items are required.',
    });
    return;
  }

  try {
    // 转换字段名：驼峰命名 -> 下划线命名
    const formattedItems = items.map((item) => ({
      product_id: item.productId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
    }));

    const newOrder = await OrderModel.createOrder(
      userId,
      shippingAddress,
      formattedItems
    );
    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ _error: 'Failed to create order.' });
  }
});

// 通过id获取订单详细信息
export const getOrderInfoById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const order = await OrderModel.getOrderInfoById(id);
  if (!order) return res.status(404).json({ _error: 'Order not found' });
  res.json(order);
});

// 查询用户的所有订单信息
export const getAllOrdersByUserId = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const orders = await OrderModel.getAllOrdersByUserId(userId);
  res.json(orders);
});

// 删除订单
export const deleteOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const deletedOrder = await OrderModel.deleteOrderById(id);
    if (!deletedOrder)
      return res.status(404).json({ _error: 'Order not found' });
    res.status(200).json({
      message: 'Order deleted successfully',
      orderId: deletedOrder.order_id,
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ _error: 'Failed to delete order.' });
  }
});

// 更新订单状态
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    res.status(400).json({ _error: 'Order status is required.' });
    return;
  }

  // 验证状态是否有效，需要与数据库中的 ENUM 类型一致
  const validStatuses = [
    'pending',
    'paid',
    'shipped',
    'delivered',
    'cancelled',
  ];
  if (!validStatuses.includes(status)) {
    res.status(400).json({
      _error: `Invalid order status: ${status}. Valid statuses are: ${validStatuses.join(', ')}`,
    });
    return;
  }

  try {
    const updatedOrder = await OrderModel.updateOrderStatus(id, status);
    if (!updatedOrder)
      return res.status(404).json({ _error: 'Order not found' });
    res.status(200).json({
      message: 'Order status updated successfully',
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ _error: 'Failed to update order status.' });
  }
});

// 获取订单项目
export const getOrderItemByOrderId = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const orderItems = await OrderModel.getOrderItemByOrderId(id);
  if (!orderItems) return res.status(404).json({ _error: 'Order not found' });
  res.json(orderItems);
});
