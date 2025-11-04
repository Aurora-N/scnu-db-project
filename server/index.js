import express from "express";
import pkg from "pg";
const { Pool } = pkg;
import { config } from "./utils/env.js";

const app = express();
app.use(express.json());

// import { initializeDatabase } from "./utils/init-db.js";
// initializeDatabase();

// 创建连接池
const pool = new Pool({
  user: config.DB_USER, // 用户名
  host: config.DB_HOST, // 主机
  database: config.DB_NAME, // 数据库名
  password: config.DB_PASSWORD, // 密码
  port: config.DB_PORT, // 默认端口
});

// 测试连接
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ time: result.rows[0].now });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "数据库连接失败" });
  }
});

// 查询数据示例
app.get("/users", async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM "User"`);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "查询失败" });
  }
});

// 启动服务
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
