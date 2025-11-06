import { pool } from "../db.js";

// 通过用户ID获取购物车信息
export const getCartByUserId = async (userId) => {
  const query = `
    SELECT 
      c."cart_id",
      c."user_id",
      c."updated_at",
      u."username",
      u."phone_number"
    FROM carts c
    LEFT JOIN users u ON c."user_id" = u."user_id"
    WHERE c."user_id" = $1
  `;

  const result = await pool.query(query, [userId]);
  return result.rows[0];
};

// 通过购物车ID获取购物车信息
export const getCartById = async (cartId) => {
  const query = `
    SELECT 
      c."cart_id",
      c."user_id",
      c."updated_at",
      u."username",
      u."phone_number"
    FROM carts c
    LEFT JOIN users u ON c."user_id" = u."user_id"
    WHERE c."cart_id" = $1
  `;

  const result = await pool.query(query, [cartId]);
  return result.rows[0];
};

// 为用户创建购物车
export const createCart = async (userId) => {
  const query = `
    INSERT INTO carts ("user_id")
    VALUES ($1)
    ON CONFLICT ("user_id") DO UPDATE
    SET "updated_at" = CURRENT_TIMESTAMP
    RETURNING "cart_id", "user_id", "updated_at"
  `;

  const result = await pool.query(query, [userId]);
  return result.rows[0];
};

// 更新购物车的更新时间
export const updateCartTimestamp = async (cartId) => {
  const query = `
    UPDATE carts
    SET "updated_at" = CURRENT_TIMESTAMP
    WHERE "cart_id" = $1
    RETURNING "cart_id", "user_id", "updated_at"
  `;

  const result = await pool.query(query, [cartId]);
  return result.rows[0];
};

// 删除购物车（级联删除购物车项目）
export const deleteCart = async (cartId) => {
  const query = `
    DELETE FROM carts
    WHERE "cart_id" = $1
    RETURNING "cart_id", "user_id"
  `;

  const result = await pool.query(query, [cartId]);
  return result.rows[0];
};

// 通过用户ID删除购物车
export const deleteCartByUserId = async (userId) => {
  const query = `
    DELETE FROM carts
    WHERE "user_id" = $1
    RETURNING "cart_id", "user_id"
  `;

  const result = await pool.query(query, [userId]);
  return result.rows[0];
};

// 获取购物车的总金额和商品数量统计
export const getCartSummary = async (cartId) => {
  const query = `
    SELECT 
      c."cart_id",
      c."user_id",
      c."updated_at",
      COUNT(ci."cart_item_id") AS item_count,
      COALESCE(SUM(ci."quantity"), 0) AS total_quantity,
      COALESCE(SUM(ci."quantity" * ci."unit_price"), 0) AS total_amount
    FROM carts c
    LEFT JOIN cart_items ci ON c."cart_id" = ci."cart_id"
    WHERE c."cart_id" = $1
    GROUP BY c."cart_id", c."user_id", c."updated_at"
  `;

  const result = await pool.query(query, [cartId]);
  return result.rows[0];
};

// 通过用户ID获取购物车摘要信息
export const getCartSummaryByUserId = async (userId) => {
  const query = `
    SELECT 
      c."cart_id",
      c."user_id",
      c."updated_at",
      COUNT(ci."cart_item_id") AS item_count,
      COALESCE(SUM(ci."quantity"), 0) AS total_quantity,
      COALESCE(SUM(ci."quantity" * ci."unit_price"), 0) AS total_amount
    FROM carts c
    LEFT JOIN cart_items ci ON c."cart_id" = ci."cart_id"
    WHERE c."user_id" = $1
    GROUP BY c."cart_id", c."user_id", c."updated_at"
  `;

  const result = await pool.query(query, [userId]);
  return result.rows[0];
};

// 清空购物车（删除所有购物车项目）
export const clearCart = async (cartId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 删除所有购物车项目
    await client.query(
      'DELETE FROM cart_items WHERE "cart_id" = $1',
      [cartId]
    );

    // 更新购物车时间戳
    const result = await client.query(
      `UPDATE carts 
       SET "updated_at" = CURRENT_TIMESTAMP 
       WHERE "cart_id" = $1 
       RETURNING "cart_id", "user_id", "updated_at"`,
      [cartId]
    );

    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
