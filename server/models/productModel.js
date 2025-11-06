import { pool } from "../db.js";

// 通过id获取商品信息
export const getProductInfoById = async (id) => { 
  const result = await pool.query('SELECT * FROM products WHERE product_id = $1', [id]);
  return result.rows[0];
};

// 查询所有商品
export const queryAllProduct = async () => {
  const result = await pool.query('SELECT * FROM products ORDER BY product_id');
  return result.rows;
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

// 修改指定id的商品信息
export const updateProductInfo = async (productId, { name, description, price, stock_quantity }) => {
  const updatableFields = { name, description, price, stock_quantity };
  const setClauses = [];
  const values = [];

  let paramIndex = 1;
  for (const [column, value] of Object.entries(updatableFields)) {
    if (value !== undefined) {
      setClauses.push(`${column} = $${paramIndex++}`);
      values.push(value);
    }
  }

  if (setClauses.length === 0) {
    throw new Error('No valid fields provided to update');
  }

  // product_id 参数：位于最后一个index
  values.push(productId);

  const result = await pool.query(
    `UPDATE products SET ${setClauses.join(', ')} WHERE product_id = $${paramIndex} RETURNING *`,
    values
  );

  return result.rows[0];
}