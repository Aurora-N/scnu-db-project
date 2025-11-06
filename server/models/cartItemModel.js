import { pool } from "../db.js";

// 获取购物车的所有项目（包含商品详细信息）
export const getCartItemsByCartId = async (cartId) => {
  const query = `
    SELECT 
      ci."cart_item_id",
      ci."cart_id",
      ci."product_id",
      ci."quantity",
      ci."unit_price",
      p."name" AS product_name,
      p."description" AS product_description,
      p."price" AS current_price,
      p."stock_quantity"
    FROM cart_items ci
    LEFT JOIN products p ON ci."product_id" = p."product_id"
    WHERE ci."cart_id" = $1
    ORDER BY ci."cart_item_id"
  `;

  const result = await pool.query(query, [cartId]);
  return result.rows;
};

// 通过用户ID获取购物车项目
export const getCartItemsByUserId = async (userId) => {
  const query = `
    SELECT 
      ci."cart_item_id",
      ci."cart_id",
      ci."product_id",
      ci."quantity",
      ci."unit_price",
      p."name" AS product_name,
      p."description" AS product_description,
      p."price" AS current_price,
      p."stock_quantity"
    FROM cart_items ci
    LEFT JOIN carts c ON ci."cart_id" = c."cart_id"
    LEFT JOIN products p ON ci."product_id" = p."product_id"
    WHERE c."user_id" = $1
    ORDER BY ci."cart_item_id"
  `;

  const result = await pool.query(query, [userId]);
  return result.rows;
};

// 通过购物车项目ID获取单个购物车项目
export const getCartItemById = async (cartItemId) => {
  const query = `
    SELECT 
      ci."cart_item_id",
      ci."cart_id",
      ci."product_id",
      ci."quantity",
      ci."unit_price",
      p."name" AS product_name,
      p."description" AS product_description,
      p."price" AS current_price,
      p."stock_quantity"
    FROM cart_items ci
    LEFT JOIN products p ON ci."product_id" = p."product_id"
    WHERE ci."cart_item_id" = $1
  `;

  const result = await pool.query(query, [cartItemId]);
  return result.rows[0];
};

// 添加商品到购物车
export const addCartItem = async (cartId, productId, quantity, unitPrice) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 检查该商品是否已在购物车中
    const existingItem = await client.query(
      `SELECT * FROM cart_items 
       WHERE "cart_id" = $1 AND "product_id" = $2`,
      [cartId, productId]
    );

    let result;
    if (existingItem.rows.length > 0) {
      // 如果已存在，更新数量
      result = await client.query(
        `UPDATE cart_items 
         SET "quantity" = "quantity" + $1, "unit_price" = $2
         WHERE "cart_id" = $3 AND "product_id" = $4
         RETURNING "cart_item_id", "cart_id", "product_id", "quantity", "unit_price"`,
        [quantity, unitPrice, cartId, productId]
      );
    } else {
      // 如果不存在，插入新记录
      result = await client.query(
        `INSERT INTO cart_items ("cart_id", "product_id", "quantity", "unit_price")
         VALUES ($1, $2, $3, $4)
         RETURNING "cart_item_id", "cart_id", "product_id", "quantity", "unit_price"`,
        [cartId, productId, quantity, unitPrice]
      );
    }

    // 更新购物车时间戳
    await client.query(
      'UPDATE carts SET "updated_at" = CURRENT_TIMESTAMP WHERE "cart_id" = $1',
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

// 更新购物车项目
export const updateCartItem = async (cartItemId, { quantity, unit_price }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

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

    values.push(cartItemId);

    const result = await client.query(
      `UPDATE cart_items 
       SET ${setClauses.join(', ')} 
       WHERE "cart_item_id" = $${paramIndex} 
       RETURNING "cart_item_id", "cart_id", "product_id", "quantity", "unit_price"`,
      values
    );

    if (result.rows.length > 0) {
      // 更新购物车时间戳
      await client.query(
        'UPDATE carts SET "updated_at" = CURRENT_TIMESTAMP WHERE "cart_id" = $1',
        [result.rows[0].cart_id]
      );
    }

    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// 删除购物车项目
export const deleteCartItem = async (cartItemId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const result = await client.query(
      `DELETE FROM cart_items 
       WHERE "cart_item_id" = $1 
       RETURNING "cart_item_id", "cart_id", "product_id"`,
      [cartItemId]
    );

    if (result.rows.length > 0) {
      // 更新购物车时间戳
      await client.query(
        'UPDATE carts SET "updated_at" = CURRENT_TIMESTAMP WHERE "cart_id" = $1',
        [result.rows[0].cart_id]
      );
    }

    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// 通过购物车ID和商品ID删除购物车项目
export const deleteCartItemByProductId = async (cartId, productId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const result = await client.query(
      `DELETE FROM cart_items 
       WHERE "cart_id" = $1 AND "product_id" = $2
       RETURNING "cart_item_id", "cart_id", "product_id"`,
      [cartId, productId]
    );

    if (result.rows.length > 0) {
      // 更新购物车时间戳
      await client.query(
        'UPDATE carts SET "updated_at" = CURRENT_TIMESTAMP WHERE "cart_id" = $1',
        [cartId]
      );
    }

    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// 批量删除购物车项目
export const deleteBatchCartItems = async (cartItemIds) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const placeholders = cartItemIds.map((_, index) => `$${index + 1}`).join(', ');
    const result = await client.query(
      `DELETE FROM cart_items 
       WHERE "cart_item_id" IN (${placeholders})
       RETURNING "cart_item_id", "cart_id", "product_id"`,
      cartItemIds
    );

    if (result.rows.length > 0) {
      // 获取所有受影响的购物车ID并更新时间戳
      const cartIds = [...new Set(result.rows.map(row => row.cart_id))];
      for (const cartId of cartIds) {
        await client.query(
          'UPDATE carts SET "updated_at" = CURRENT_TIMESTAMP WHERE "cart_id" = $1',
          [cartId]
        );
      }
    }

    await client.query('COMMIT');
    return result.rows;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// 检查商品是否在购物车中
export const isProductInCart = async (cartId, productId) => {
  const query = `
    SELECT EXISTS(
      SELECT 1 FROM cart_items 
      WHERE "cart_id" = $1 AND "product_id" = $2
    ) AS exists
  `;

  const result = await pool.query(query, [cartId, productId]);
  return result.rows[0].exists;
};

// 获取购物车项目数量
export const getCartItemCount = async (cartId) => {
  const query = `
    SELECT COUNT(*) AS count
    FROM cart_items
    WHERE "cart_id" = $1
  `;

  const result = await pool.query(query, [cartId]);
  return parseInt(result.rows[0].count);
};
