import { pool } from "../db.js";

// 创建新订单
// items: [{ product_id, quantity, unit_price }, ...]
export const createOrder = async (userId, shippingAddress, items) => {
  console.log('createOrder:', userId, shippingAddress, items);
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 插入订单记录
    const orderResult = await client.query(
      `INSERT INTO orders ("user_id", "shipping_address", "status") 
       VALUES ($1, $2, 'pending') 
       RETURNING "order_id", "user_id", "status", "created_at", "shipping_address"`,
      [userId, shippingAddress]
    );

    const order = orderResult.rows[0];
    const orderId = order.order_id;

    // 批量插入订单项目
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

      await client.query(
        `INSERT INTO order_items ("order_id", "product_id", "quantity", "unit_price") 
         VALUES ${orderItemsValues.join(', ')}`,
        orderItemsParams
      );
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

// 通过ID获取订单详细信息
export const getOrderInfoById = async (orderId) => {
  const orderQuery = `
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

  const itemsQuery = `
    SELECT 
      oi."order_item_id",
      oi."product_id",
      oi."quantity",
      oi."unit_price",
      p."name" AS product_name,
      p."description" AS product_description
    FROM order_items oi
    LEFT JOIN products p ON oi."product_id" = p."product_id"
    WHERE oi."order_id" = $1
  `;

  const orderResult = await pool.query(orderQuery, [orderId]);
  
  if (orderResult.rows.length === 0) {
    return null;
  }

  const order = orderResult.rows[0];
  const itemsResult = await pool.query(itemsQuery, [orderId]);
  
  return {
    ...order,
    items: itemsResult.rows
  };
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

// 获取订单项目（包含商品详细信息）
export const getOrderItemByOrderId = async (orderId) => {
  const query = `
    SELECT 
      oi."order_item_id",
      oi."order_id",
      oi."product_id",
      oi."quantity",
      oi."unit_price",
      p."name" AS product_name,
      p."description" AS product_description,
      p."price" AS current_price,
      p."stock_quantity"
    FROM order_items oi
    LEFT JOIN products p ON oi."product_id" = p."product_id"
    WHERE oi."order_id" = $1
    ORDER BY oi."order_item_id"
  `;

  const result = await pool.query(query, [orderId]);
  return result.rows;
};