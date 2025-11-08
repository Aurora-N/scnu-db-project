import { pool } from '../db.js';
import * as OrderBase from './order/orderBaseModel.js';
import * as OrderItem from './order/orderItemModel.js';

// ============================================
// 订单基础操作（从 orderBaseModel 导出）
// ============================================

export const getOrderById = OrderBase.getOrderById;
export const getAllOrdersByUserId = OrderBase.getAllOrdersByUserId;
export const deleteOrderById = OrderBase.deleteOrderById;
export const updateOrderStatus = OrderBase.updateOrderStatus;
export const updateOrderShippingAddress = OrderBase.updateOrderShippingAddress;
export const getOrderTotalAmount = OrderBase.getOrderTotalAmount;
export const getAllOrders = OrderBase.getAllOrders;
export const getOrdersByStatus = OrderBase.getOrdersByStatus;

// ============================================
// 订单项目操作（从 orderItemModel 导出）
// ============================================

export const getOrderItemsByOrderId = OrderItem.getOrderItemsByOrderId;
export const getOrderItemById = OrderItem.getOrderItemById;
export const addOrderItem = OrderItem.addOrderItem;
export const updateOrderItem = OrderItem.updateOrderItem;
export const deleteOrderItem = OrderItem.deleteOrderItem;
export const deleteAllOrderItems = OrderItem.deleteAllOrderItems;
export const deleteOrderItemByProductId = OrderItem.deleteOrderItemByProductId;
export const isProductInOrder = OrderItem.isProductInOrder;
export const getOrderItemCount = OrderItem.getOrderItemCount;

// ============================================
// 组合操作（需要同时操作订单和订单项目）
// ============================================

// 创建新订单（包含订单项目）
// items: [{ product_id, quantity, unit_price }, ...]
export const createOrder = async (userId, shippingAddress, items) => {
  console.log('创建订单', userId, shippingAddress, items);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 创建订单记录
    const orderResult = await client.query(
      `INSERT INTO orders ("user_id", "shipping_address", "status") 
       VALUES ($1, $2, 'pending') 
       RETURNING "order_id", "user_id", "status", "created_at", "shipping_address"`,
      [userId, shippingAddress]
    );

    const order = orderResult.rows[0];
    const orderId = order.order_id;

    // 批量插入订单项目（在同一事务中）
    if (items && items.length > 0) {
      const orderItemsValues = [];
      const orderItemsParams = [];
      let paramIndex = 1;

      items.forEach((item) => {
        orderItemsValues.push(
          `($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3})`
        );
        orderItemsParams.push(
          orderId,
          item.product_id,
          item.quantity,
          item.unit_price
        );
        paramIndex += 4;
      });

      const itemsQuery = `
        INSERT INTO order_items ("order_id", "product_id", "quantity", "unit_price") 
        VALUES ${orderItemsValues.join(', ')}
        RETURNING "order_item_id", "order_id", "product_id", "quantity", "unit_price"
      `;

      await client.query(itemsQuery, orderItemsParams);
    }

    await client.query('COMMIT');
    return order;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// 通过ID获取订单详细信息（包含订单项目）
export const getOrderInfoById = async (orderId) => {
  const order = await OrderBase.getOrderById(orderId);

  if (!order) {
    return null;
  }

  const items = await OrderItem.getOrderItemsByOrderId(orderId);

  return {
    ...order,
    items,
  };
};

// 向后兼容的别名（保持原有API）
export const getOrderItemByOrderId = getOrderItemsByOrderId;
