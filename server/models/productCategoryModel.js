import { pool } from '../db.js';

// 将某商品分配到某分类
export const addCategoryToProduct = async (product_id, category_id) => {
  // 尝试插入
  const result = await pool.query(
    `INSERT INTO product_categories (product_id, category_id)
     VALUES ($1, $2)
     ON CONFLICT DO NOTHING
     RETURNING *`,
    [product_id, category_id]
  );

  if (result.rowCount === 0) {
    // 该关联已经存在，返回现有记录
    const existing = await pool.query(
      `SELECT * FROM product_categories
       WHERE product_id = $1 AND category_id = $2`,
      [product_id, category_id]
    );
    return existing.rows[0];
  }

  return result.rows[0];
};

// 移除商品与分类的关联
export const removeCategoryFromProduct = async (product_id, category_id) => {
  const result = await pool.query(
    `DELETE FROM product_categories
     WHERE product_id = $1 AND category_id = $2 RETURNING *`,
    [product_id, category_id]
  );
  return result.rows[0];
};

// 查询某商品的所有分类
export const queryCategoriesByProduct = async (product_id) => {
  const result = await pool.query(
    `SELECT c.*
     FROM categories c
     JOIN product_categories pc ON c.category_id = pc.category_id
     WHERE pc.product_id = $1`,
    [product_id]
  );
  return result.rows;
};

// 查询某分类下的所有商品
export const queryProductsByCategory = async (category_id) => {
  const result = await pool.query(
    `SELECT p.*
     FROM products p
     JOIN product_categories pc ON p.product_id = pc.product_id
     WHERE pc.category_id = $1`,
    [category_id]
  );
  return result.rows;
};
