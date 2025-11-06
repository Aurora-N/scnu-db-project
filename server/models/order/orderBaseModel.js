import { pool } from "../../db.js";

// 通过ID获取订单基本信息（不包含订单项目）
export const getOrderById = async (orderId) => {
  const query = `
    SELECT 
      o."order_id",
      o."user_id",
      o."status",
      o."created_at",
      o."shipping_address",
      u."username",
      u."phone_number"
    FROM orders o
    LEFT JOIN users u ON o."user_id" = u."user_id"
    WHERE o."order_id" = $1
  `;

  const result = await pool.query(query, [orderId]);
  return result.rows[0];
};

// 查询用户的所有订单信息（包含订单项目统计）
export const getAllOrdersByUserId = async (userId) => {
  const query = `
    SELECT 
      o."order_id",
      o."user_id",
      o."status",
      o."created_at",
      o."shipping_address",
      COUNT(oi."order_item_id") AS item_count,
      COALESCE(SUM(oi."quantity" * oi."unit_price"), 0) AS total_amount
    FROM orders o
    LEFT JOIN order_items oi ON o."order_id" = oi."order_id"
    WHERE o."user_id" = $1
    GROUP BY o."order_id", o."user_id", o."status", o."created_at", o."shipping_address"
    ORDER BY o."created_at" DESC
  `;

  const result = await pool.query(query, [userId]);
  return result.rows;
};

// 创建订单（仅创建订单记录，不包含订单项目）
export const createOrderRecord = async (userId, shippingAddress) => {
  const query = `
    INSERT INTO orders ("user_id", "shipping_address", "status") 
    VALUES ($1, $2, 'pending') 
    RETURNING "order_id", "user_id", "status", "created_at", "shipping_address"
  `;

  const result = await pool.query(query, [userId, shippingAddress]);
  return result.rows[0];
};

// 删除订单（级联删除订单项目）
export const deleteOrderById = async (orderId) => {
  const query = `
    DELETE FROM orders 
    WHERE "order_id" = $1 
    RETURNING "order_id"
  `;

  const result = await pool.query(query, [orderId]);
  return result.rows.length > 0 ? result.rows[0] : null;
};

// 更新订单状态
// status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
export const updateOrderStatus = async (orderId, status) => {
  const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
  
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  const query = `
    UPDATE orders 
    SET "status" = $1 
    WHERE "order_id" = $2 
    RETURNING "order_id", "user_id", "status", "created_at", "shipping_address"
  `;

  const result = await pool.query(query, [status, orderId]);
  return result.rows.length > 0 ? result.rows[0] : null;
};

// 更新订单配送地址
export const updateOrderShippingAddress = async (orderId, shippingAddress) => {
  const query = `
    UPDATE orders 
    SET "shipping_address" = $1 
    WHERE "order_id" = $2 
    RETURNING "order_id", "user_id", "status", "created_at", "shipping_address"
  `;

  const result = await pool.query(query, [shippingAddress, orderId]);
  return result.rows.length > 0 ? result.rows[0] : null;
};

// 获取订单的总金额
export const getOrderTotalAmount = async (orderId) => {
  const query = `
    SELECT 
      COALESCE(SUM(oi."quantity" * oi."unit_price"), 0) AS total_amount
    FROM order_items oi
    WHERE oi."order_id" = $1
  `;

  const result = await pool.query(query, [orderId]);
  return result.rows[0];
};

// 获取所有订单（管理员功能）
export const getAllOrders = async (limit = 100, offset = 0) => {
  const query = `
    SELECT 
      o."order_id",
      o."user_id",
      o."status",
      o."created_at",
      o."shipping_address",
      u."username",
      u."phone_number",
      COUNT(oi."order_item_id") AS item_count,
      COALESCE(SUM(oi."quantity" * oi."unit_price"), 0) AS total_amount
    FROM orders o
    LEFT JOIN users u ON o."user_id" = u."user_id"
    LEFT JOIN order_items oi ON o."order_id" = oi."order_id"
    GROUP BY o."order_id", o."user_id", o."status", o."created_at", o."shipping_address", u."username", u."phone_number"
    ORDER BY o."created_at" DESC
    LIMIT $1 OFFSET $2
  `;

  const result = await pool.query(query, [limit, offset]);
  return result.rows;
};

// 按状态查询订单
export const getOrdersByStatus = async (status, limit = 100, offset = 0) => {
  const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
  
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  const query = `
    SELECT 
      o."order_id",
      o."user_id",
      o."status",
      o."created_at",
      o."shipping_address",
      u."username",
      u."phone_number",
      COUNT(oi."order_item_id") AS item_count,
      COALESCE(SUM(oi."quantity" * oi."unit_price"), 0) AS total_amount
    FROM orders o
    LEFT JOIN users u ON o."user_id" = u."user_id"
    LEFT JOIN order_items oi ON o."order_id" = oi."order_id"
    WHERE o."status" = $1
    GROUP BY o."order_id", o."user_id", o."status", o."created_at", o."shipping_address", u."username", u."phone_number"
    ORDER BY o."created_at" DESC
    LIMIT $2 OFFSET $3
  `;

  const result = await pool.query(query, [status, limit, offset]);
  return result.rows;
};
