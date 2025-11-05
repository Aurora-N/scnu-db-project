import { pool } from "../db.js";

// 通过id获取商品信息
export const getProductInfoById = async (id) => { 
  const result = await pool.query('SELECT * FROM products WHERE product_id = $1', [id]);
  return result.rows[0];
};

// 通过名称查找商品信息
export const queryProductInfoByName = async (name) => {
  const result = await pool.query('SELECT * FROM products WHERE name ILIKE $1', [`%${name}%`]);
  return result.rows;
};

// 创建商品
export const createProduct = async ({ name, description, price, stock_quantity }) => {
  const result = await pool.query(
    'INSERT INTO products (name, description, price, stock_quantity) VALUES ($1, $2, $3, $4) RETURNING *',
    [name, description, price, stock_quantity]
  );
  return result.rows[0];
};

// 删除商品
export const deleteProductById = async (id) => {
  const result = await pool.query('DELETE FROM products WHERE product_id = $1 RETURNING *', [id]);
  return result.rows[0];
};

// 通过分类获取商品信息
export const getProductsByCategory = async (categoryId) => {
  const result = await pool.query(
    `SELECT p.* FROM products p
     JOIN product_categories pc ON p.product_id = pc.product_id
     WHERE pc.category_id = $1`,
    [categoryId]
  );
  return result.rows;
};

// 购买商品 (使用事务)
export const buyProduct = async (userId, productId, quantity, orderId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. 获取商品信息并锁定行
    const productResult = await client.query(
      'SELECT product_id, name, price, stock_quantity FROM products WHERE product_id = $1 FOR UPDATE',
      [productId]
    );
    const product = productResult.rows[0];

    if (!product) {
      throw new Error('Product not found');
    }
    if (product.stock_quantity < quantity) {
      throw new Error('Insufficient stock');
    }

    // 2. 更新商品库存
    await client.query(
      'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE product_id = $2',
      [quantity, productId]
    );

    // 新建订单
    const orderResult = await client.query(
      'INSERT INTO orders (user_id, status) VALUES ($1, $2) RETURNING order_id',
      [userId, 'pending'] // 初始状态为 'pending'
    );
    const currentOrderId = orderResult.rows[0].order_id;

    // 3. 检查是否有现有订单项目，并更新或插入
    const orderItemResult = await client.query(
      'SELECT order_item_id, quantity FROM order_items WHERE order_id = $1 AND product_id = $2 FOR UPDATE',
      [currentOrderId, productId]
    );
    const orderItem = orderItemResult.rows[0];

    if (orderItem) {
      // 更新现有订单项目的数量
      await client.query(
        'UPDATE order_items SET quantity = quantity + $1 WHERE order_item_id = $2',
        [quantity, orderItem.order_item_id]
      );
    } else {
      // 插入新的订单项目
      await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)',
        [currentOrderId, productId, quantity, product.price]
      );
    }

    await client.query('COMMIT');
    return { success: true, message: 'Product purchased successfully', orderId: currentOrderId };
  } catch (error) {
    await client.query('ROLLBACK');
    console.log(error);
    
    throw error;
  } finally {
    client.release();
  }
};

// 取消购买商品 (使用事务)
export const cancelProductPurchase = async (userId, orderId, productId, quantity) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. 获取订单项目信息并锁定行
    const orderItemResult = await client.query(
      'SELECT order_item_id, quantity FROM order_items WHERE order_id = $1 AND product_id = $2 FOR UPDATE',
      [orderId, productId]
    );
    const orderItem = orderItemResult.rows[0];

    if (!orderItem) {
      throw new Error('Order item not found');
    }
    if (orderItem.quantity < quantity) {
      throw new Error('Cannot cancel more than purchased quantity');
    }

    // 2. 增加商品库存
    await client.query(
      'UPDATE products SET stock_quantity = stock_quantity + $1 WHERE product_id = $2',
      [quantity, productId]
    );

    // 3. 更新或删除订单项目
    if (orderItem.quantity === quantity) {
      // 如果取消全部数量，则删除订单项目
      await client.query('DELETE FROM order_items WHERE order_item_id = $1', [orderItem.order_item_id]);
    } else {
      // 否则，更新订单项目数量
      await client.query(
        'UPDATE order_items SET quantity = quantity - $1 WHERE order_item_id = $2',
        [quantity, orderItem.order_item_id]
      );
    }

    await client.query('COMMIT');
    return { success: true, message: 'Product purchase cancelled successfully' };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
