import { pool } from "../../db.js";

// 获取订单项目（包含商品详细信息）
export const getOrderItemsByOrderId = async (orderId) => {
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

// 通过订单项目ID获取单个订单项目信息
export const getOrderItemById = async (orderItemId) => {
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
    WHERE oi."order_item_id" = $1
  `;

  const result = await pool.query(query, [orderItemId]);
  return result.rows[0];
};

// 批量插入订单项目
export const batchInsertOrderItems = async (orderId, items) => {
  if (!items || items.length === 0) {
    return [];
  }

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

  const query = `
    INSERT INTO order_items ("order_id", "product_id", "quantity", "unit_price") 
    VALUES ${orderItemsValues.join(', ')}
    RETURNING "order_item_id", "order_id", "product_id", "quantity", "unit_price"
  `;

  const result = await pool.query(query, orderItemsParams);
  return result.rows;
};

// 为订单添加新的订单项目
export const addOrderItem = async (orderId, productId, quantity, unitPrice) => {
  const query = `
    INSERT INTO order_items ("order_id", "product_id", "quantity", "unit_price")
    VALUES ($1, $2, $3, $4)
    RETURNING "order_item_id", "order_id", "product_id", "quantity", "unit_price"
  `;

  const result = await pool.query(query, [orderId, productId, quantity, unitPrice]);
  return result.rows[0];
};

// 更新订单项目
export const updateOrderItem = async (orderItemId, { quantity, unit_price }) => {
  const updatableFields = { quantity, unit_price };
  const setClauses = [];
  const values = [];

  let paramIndex = 1;
  for (const [column, value] of Object.entries(updatableFields)) {
    if (value !== undefined) {
      setClauses.push(`"${column}" = $${paramIndex++}`);
      values.push(value);
    }
  }

  if (setClauses.length === 0) {
    throw new Error('No valid fields provided to update');
  }

  values.push(orderItemId);

  const query = `
    UPDATE order_items 
    SET ${setClauses.join(', ')} 
    WHERE "order_item_id" = $${paramIndex} 
    RETURNING "order_item_id", "order_id", "product_id", "quantity", "unit_price"
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
};

// 删除订单项目
export const deleteOrderItem = async (orderItemId) => {
  const query = `
    DELETE FROM order_items 
    WHERE "order_item_id" = $1 
    RETURNING "order_item_id", "order_id"
  `;

  const result = await pool.query(query, [orderItemId]);
  return result.rows[0];
};

// 删除订单的所有项目
export const deleteAllOrderItems = async (orderId) => {
  const query = `
    DELETE FROM order_items 
    WHERE "order_id" = $1 
    RETURNING "order_item_id"
  `;

  const result = await pool.query(query, [orderId]);
  return result.rows;
};

// 通过订单ID和商品ID删除订单项目
export const deleteOrderItemByProductId = async (orderId, productId) => {
  const query = `
    DELETE FROM order_items 
    WHERE "order_id" = $1 AND "product_id" = $2
    RETURNING "order_item_id", "order_id", "product_id"
  `;

  const result = await pool.query(query, [orderId, productId]);
  return result.rows[0];
};

// 检查商品是否在订单中
export const isProductInOrder = async (orderId, productId) => {
  const query = `
    SELECT EXISTS(
      SELECT 1 FROM order_items 
      WHERE "order_id" = $1 AND "product_id" = $2
    ) AS exists
  `;

  const result = await pool.query(query, [orderId, productId]);
  return result.rows[0].exists;
};

// 获取订单项目数量
export const getOrderItemCount = async (orderId) => {
  const query = `
    SELECT COUNT(*) AS count
    FROM order_items
    WHERE "order_id" = $1
  `;

  const result = await pool.query(query, [orderId]);
  return parseInt(result.rows[0].count);
};
