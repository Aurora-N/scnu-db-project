import express from "express";
import pkg from "pg";
const { Pool } = pkg;

const app = express();
app.use(express.json());

// 创建连接池
const pool = new Pool({
  user: "postgres",     // 用户名
  host: "localhost",    // 主机
  database: "mydb",     // 数据库名
  password: "123456",   // 密码
  port: 5432,           // 默认端口
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
    const result = await pool.query("SELECT * FROM users");
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