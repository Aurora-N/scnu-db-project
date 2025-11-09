import { pool } from '../db.js';

// 新建商品分类
export const createCategory = async (name, description) => {
  const result = await pool.query(
    `INSERT INTO categories (name, description)
        VALUES ($1, $2) RETURNING *`,
    [name, description]
  );
  return result.rows[0];
};

// 获取所有商品分类
export const queryAllCategory = async () => {
  const result = await pool.query(
    'SELECT * FROM categories ORDER BY category_id'
  );
  return result.rows;
};

// 获取指定id的商品分类
export const queryCategoryById = async (id) => {
  const result = await pool.query(
    'SELECT * FROM categories WHERE category_id = $1',
    [id]
  );
  return result.rows[0];
};

// 获取指定id的商品分类
export const updateCategory = async (id, { name, description }) => {
  const result = await pool.query(
    `UPDATE categories
     SET name = $1, description = $2
     WHERE category_id = $3 RETURNING *`,
    [name, description, id]
  );
  return result.rows[0];
};

// 删除指定id的商品分类
export const deleteCategory = async (id) => {
  const result = await pool.query(
    'DELETE FROM categories WHERE category_id = $1 RETURNING *',
    [id]
  );
  return result.rows[0];
};
