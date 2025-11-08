import pkg from 'pg';
const { Pool } = pkg;
import { config } from './utils/env.js';

// 创建连接池
export const pool = new Pool({
  user: config.DB_USER, // 用户名
  host: config.DB_HOST, // 主机
  database: config.DB_NAME, // 数据库名
  password: config.DB_PASSWORD, // 密码
  port: config.DB_PORT, // 默认端口
});
