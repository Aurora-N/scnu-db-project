import dotenv from "dotenv";

// 加载环境变量
dotenv.config();

// 导出配置
export const config = {
  // 服务器配置
  PORT: process.env.PORT || "3000",
  NODE_ENV: process.env.NODE_ENV || "development",

  // 数据库配置
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
};
