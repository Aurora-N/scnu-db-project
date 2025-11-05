import { pool } from "../db.js";

// 获取所有用户
export const findAllUsers = async () => {
  const result = await pool.query('SELECT * FROM users ORDER BY id');
  return result.rows;
};

// 获取单个用户
export const findUserById = async (id) => { 
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0];
};

// 新建用户
export const createUser = async (name, email) => {
  const result = await pool.query(
    'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
    [name, email]
  );
  return result.rows[0];
};

// 更新用户
export const updateUser = async (id, name, email) => {
  const result = await pool.query(
    'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *',
    [name, email, id]
  );
  return result.rows[0];
};

// 删除用户
export const removeUser = async (id) => {
  const result = await pool.query(
    'DELETE FROM users WHERE id = $1 RETURNING *',
    [id]
  );
  return result.rows[0];
};