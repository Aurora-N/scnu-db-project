// 导入 'pg' 库的 Client
import { Client } from "pg";
import { config } from "../utils/env.js";

// SQL DDL 语句
const sqlScript = `
    -- 命名规范与说明：
    -- 1) 表名统一为小写 + 下划线 + 复数形式
    -- 2) 显式命名索引：<table>_<column>_idx

    -- 开启一个事务
    BEGIN;

    -- 0. 清理：按依赖顺序删除旧表与类型
    DROP TABLE IF EXISTS order_items CASCADE;
    DROP TABLE IF EXISTS orders CASCADE;
    DROP TYPE IF EXISTS order_status; -- 删除自定义的 ENUM 类型（若存在）
    DROP TABLE IF EXISTS cart_items CASCADE;
    DROP TABLE IF EXISTS carts CASCADE;
    DROP TABLE IF EXISTS product_categories CASCADE;
    DROP TABLE IF EXISTS products CASCADE;
    DROP TABLE IF EXISTS categories CASCADE;
    DROP TABLE IF EXISTS users CASCADE;

    -- 1. 用户 (users)
    CREATE TABLE users (
        "user_id" BIGSERIAL PRIMARY KEY,
        "username" VARCHAR(100) NOT NULL,
        "phone_number" VARCHAR(20) NOT NULL,
        "password_hash" VARCHAR(255) NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- 2. 商品分类 (categories)
    CREATE TABLE categories (
        "category_id" BIGSERIAL PRIMARY KEY,
        "name" VARCHAR(100) NOT NULL,
        "description" TEXT
    );

    -- 3. 商品 (products)
    CREATE TABLE products (
        "product_id" BIGSERIAL PRIMARY KEY,
        "name" VARCHAR(255) NOT NULL,
        "description" TEXT,
        "price" NUMERIC(10, 2) NOT NULL CHECK ("price" >= 0),
        "stock_quantity" INTEGER NOT NULL DEFAULT 0 CHECK ("stock_quantity" >= 0)
    );

    -- 4. 商品-分类关联 (product_categories)
    CREATE TABLE product_categories (
        "product_id" BIGINT NOT NULL,
        "category_id" BIGINT NOT NULL,
        PRIMARY KEY ("product_id", "category_id"),
        FOREIGN KEY ("category_id") REFERENCES categories("category_id") ON DELETE CASCADE,
        FOREIGN KEY ("product_id") REFERENCES products("product_id") ON DELETE CASCADE
    );

    -- 5. 购物车 (carts)
    CREATE TABLE carts (
        "cart_id" BIGSERIAL PRIMARY KEY,
        "user_id" BIGINT NOT NULL UNIQUE, -- 1:1 用户与购物车关系
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("user_id") REFERENCES users("user_id") ON DELETE CASCADE
    );

    -- 6. 购物车项目 (cart_items)
    CREATE TABLE cart_items (
        "cart_item_id" BIGSERIAL PRIMARY KEY,
        "cart_id" BIGINT NOT NULL,
        "product_id" BIGINT NOT NULL,
        "quantity" INTEGER NOT NULL CHECK ("quantity" > 0),
        "unit_price" NUMERIC(10, 2) NOT NULL CHECK ("unit_price" >= 0),
        FOREIGN KEY ("cart_id") REFERENCES carts("cart_id") ON DELETE CASCADE,
        FOREIGN KEY ("product_id") REFERENCES products("product_id") ON DELETE CASCADE,
        UNIQUE ("cart_id", "product_id")
    );

    -- 7. 订单 (orders)
    CREATE TYPE order_status AS ENUM ('pending', 'paid', 'shipped', 'delivered', 'cancelled');
    CREATE TABLE orders (
        "order_id" BIGSERIAL PRIMARY KEY,
        "user_id" BIGINT NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "status" order_status NOT NULL DEFAULT 'pending',
        "shipping_address" VARCHAR(255) NOT NULL,
        FOREIGN KEY ("user_id") REFERENCES users("user_id") ON DELETE RESTRICT
    );

    -- 8. 订单项目 (order_items)
    CREATE TABLE order_items (
        "order_item_id" BIGSERIAL PRIMARY KEY,
        "order_id" BIGINT NOT NULL,
        "product_id" BIGINT NOT NULL,
        "quantity" INTEGER NOT NULL CHECK ("quantity" > 0),
        "unit_price" NUMERIC(10, 2) NOT NULL CHECK ("unit_price" >= 0),
        FOREIGN KEY ("order_id") REFERENCES orders("order_id") ON DELETE CASCADE,
        FOREIGN KEY ("product_id") REFERENCES products("product_id") ON DELETE RESTRICT
    );

    -- 9. 显式命名索引 (Indexes)
    CREATE INDEX users_username_idx ON users ("username");
    CREATE INDEX users_phone_number_idx ON users ("phone_number");
    CREATE INDEX categories_name_idx ON categories ("name");
    CREATE INDEX products_name_idx ON products ("name");
    CREATE INDEX product_categories_product_id_idx ON product_categories ("product_id");
    CREATE INDEX carts_user_id_idx ON carts ("user_id");
    CREATE INDEX cart_items_cart_id_idx ON cart_items ("cart_id");
    CREATE INDEX cart_items_product_id_idx ON cart_items ("product_id");
    CREATE INDEX orders_user_id_idx ON orders ("user_id");
    CREATE INDEX orders_status_idx ON orders ("status");
    CREATE INDEX order_items_order_id_idx ON order_items ("order_id");
    CREATE INDEX order_items_product_id_idx ON order_items ("product_id");

    -- 提交事务
    COMMIT;
`;

async function initializeDatabase() {
  // 创建一个新的数据库 Client 实例
  const client = new Client({
    host: config.DB_HOST,
    port: config.DB_PORT,
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_NAME,
  });

  try {
    // 连接数据库
    await client.connect();
    console.log("🔌 正在连接到数据库...");

    // 执行 SQL 脚本
    console.log("🚀 正在运行数据库初始化脚本...");
    await client.query(sqlScript);

    console.log("✅ 数据库初始化成功！所有表已创建。");
  } catch (error) {
    // 捕获并打印错误
    console.error("❌ 数据库初始化失败:");
    console.error(error.message);
  } finally {
    // 无论成功还是失败，最后都关闭连接
    await client.end();
    console.log("🔌 数据库连接已关闭。");
  }
}

await initializeDatabase();