import { pool } from "../db.js";

// 创建新订单
export const createOrder = async (userId, shippingAddress, items) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN'); // 开始事务

    // 插入订单
    const orderResult = await client.query(
      'INSERT INTO orders (user_id, shipping_address) VALUES ($1, $2) RETURNING order_id, created_at, status',
      [userId, shippingAddress]
    );
    const orderId = orderResult.rows[0].order_id;

    // 插入订单项目
    for (const item of items) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)',
        [orderId, item.productId, item.quantity, item.unitPrice]
      );
    }

    await client.query('COMMIT'); // 提交事务
    return {
      orderId,
      userId,
      shippingAddress,
      createdAt: orderResult.rows[0].created_at,
      status: orderResult.rows[0].status,
      items
    };
  } catch (error) {
    await client.query('ROLLBACK'); // 回滚事务
    throw error;
  } finally {
    client.release(); // 释放客户端
  }
};

// 通过ID获取订单详细信息
export const getOrderInfoById = async (orderId) => {
  const result = await pool.query(
    `SELECT
      o.order_id,
      o.user_id,
      o.shipping_address,
      o.status,
      o.created_at,
      json_agg(
        json_build_object(
          'orderItemId', oi.order_item_id,
          'productId', oi.product_id,
          'quantity', oi.quantity,
          'unitPrice', oi.unit_price,
          'productName', p.name,
          'productDescription', p.description
        )
      ) AS items
    FROM orders o
    JOIN order_items oi ON o.order_id = oi.order_id
    JOIN products p ON oi.product_id = p.product_id
    WHERE o.order_id = $1
    GROUP BY o.order_id`,
    [orderId]
  );
  return result.rows[0];
};

// 查询用户的所有订单信息
export const getAllOrdersByUserId = async (userId) => {
  const result = await pool.query(
    `SELECT
      o.order_id,
      o.user_id,
      o.shipping_address,
      o.status,
      o.created_at,
      json_agg(
        json_build_object(
          'orderItemId', oi.order_item_id,
          'productId', oi.product_id,
          'quantity', oi.quantity,
          'unitPrice', oi.unit_price,
          'productName', p.name,
          'productDescription', p.description
        )
      ) AS items
    FROM orders o
    JOIN order_items oi ON o.order_id = oi.order_id
    JOIN products p ON oi.product_id = p.product_id
    WHERE o.user_id = $1
    GROUP BY o.order_id
    ORDER BY o.created_at DESC`,
    [userId]
  );
  return result.rows;
};

// 删除订单
export const deleteOrderById = async (orderId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // 先删除订单项目
    await client.query('DELETE FROM order_items WHERE order_id = $1', [orderId]);
    // 再删除订单
    const result = await client.query('DELETE FROM orders WHERE order_id = $1 RETURNING order_id', [orderId]);
    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// 更新订单状态
export const updateOrderStatus = async (orderId, status) => {
  const result = await pool.query(
    'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE order_id = $2 RETURNING order_id, status',
    [status, orderId]
  );
  return result.rows[0];
};

// 获取订单项目
export const getOrderItemByOrderId = async (orderId) => {
  const result = await pool.query(
    `SELECT
      oi.order_item_id,
      oi.product_id,
      oi.quantity,
      oi.unit_price,
      p.name AS product_name,
      p.description AS product_description
    FROM order_items oi
    JOIN products p ON oi.product_id = p.product_id
    WHERE oi.order_id = $1`,
    [orderId]
  );
  return result.rows;
};