import { pool } from '../db.js';

// 获取所有用户（不包含密码）
export const findAllUsers = async () => {
  const result = await pool.query(
    'SELECT user_id, username, phone_number, created_at FROM users ORDER BY user_id'
  );
  return result.rows;
};

// 通过id获取单个用户（不包含密码）
export const findUserById = async (id) => {
  const result = await pool.query(
    'SELECT user_id, username, phone_number, created_at FROM users WHERE user_id = $1',
    [id]
  );
  return result.rows[0];
};

// 通过phone_number获取单个用户
export const findUserByPhoneNumber = async (phone_number) => {
  const result = await pool.query(
    'SELECT * FROM users WHERE phone_number = $1',
    [phone_number]
  );
  return result.rows[0];
};

// 新建用户（不包含密码）
export const createUser = async (username, phone_number, password_hash) => {
  const result = await pool.query(
    'INSERT INTO users (username, phone_number, password_hash) VALUES ($1, $2, $3) RETURNING user_id, username, phone_number, created_at',
    [username, phone_number, password_hash]
  );
  return result.rows[0];
};

// 更新用户（返回时不包含密码）
export const updateUser = async (id, username, phone_number, password_hash) => {
  const result = await pool.query(
    'UPDATE users SET username = $1, phone_number = $2, password_hash = $3 WHERE user_id = $4 RETURNING user_id, username, phone_number, created_at',
    [username, phone_number, password_hash, id]
  );
  return result.rows[0];
};

// 删除用户（返回时不包含密码）
export const removeUser = async (id) => {
  const result = await pool.query(
    'DELETE FROM users WHERE user_id = $1 RETURNING user_id, username, phone_number, created_at',
    [id]
  );
  return result.rows[0];
};
