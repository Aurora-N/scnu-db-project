// 导入 'pg' 库的 Client
import { Client } from "pg";
import { config } from "./env.js";

// 您的 SQL DDL 语句 (来自上一步)
// 使用模板字符串 (反引号 ``) 来包含多行 SQL
const sqlScript = `
    -- 开启一个事务
    BEGIN;

    -- 0. 清理：如果表已存在，则删除它们
    DROP TABLE IF EXISTS "OrderItem" CASCADE;
    DROP TABLE IF EXISTS "Order" CASCADE;
    DROP TYPE IF EXISTS order_status; -- 删除自定义的 ENUM 类型
    DROP TABLE IF EXISTS "CartItem" CASCADE;
    DROP TABLE IF EXISTS "Cart" CASCADE;
    DROP TABLE IF EXISTS "ProductCategory" CASCADE;
    DROP TABLE IF EXISTS "Product" CASCADE;
    DROP TABLE IF EXISTS "Category" CASCADE;
    DROP TABLE IF EXISTS "User" CASCADE;

    -- 1. 用户 (User)
    CREATE TABLE "User" (
        "user_id" BIGSERIAL PRIMARY KEY,
        "username" VARCHAR(100) NOT NULL,
        "email" VARCHAR(255) NOT NULL UNIQUE,
        "password_hash" VARCHAR(255) NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- 2. 商品分类 (Category)
    CREATE TABLE "Category" (
        "category_id" BIGSERIAL PRIMARY KEY,
        "name" VARCHAR(100) NOT NULL UNIQUE
    );

    -- 3. 商品 (Product)
    CREATE TABLE "Product" (
        "product_id" BIGSERIAL PRIMARY KEY,
        "name" VARCHAR(255) NOT NULL,
        "description" TEXT,
        "price" NUMERIC(10, 2) NOT NULL CHECK ("price" >= 0),
        "stock_quantity" INTEGER NOT NULL DEFAULT 0 CHECK ("stock_quantity" >= 0)
    );

    -- 4. 商品分类关联表 (ProductCategory)
    CREATE TABLE "ProductCategory" (
        "category_id" BIGINT NOT NULL,
        "product_id" BIGINT NOT NULL,
        PRIMARY KEY ("category_id", "product_id"),
        FOREIGN KEY ("category_id") REFERENCES "Category"("category_id") ON DELETE CASCADE,
        FOREIGN KEY ("product_id") REFERENCES "Product"("product_id") ON DELETE CASCADE
    );

    -- 5. 购物车 (Cart)
    CREATE TABLE "Cart" (
        "cart_id" BIGSERIAL PRIMARY KEY,
        "user_id" BIGINT NOT NULL UNIQUE, -- 确保 1:1
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE
    );

    -- 6. 购物车项目 (CartItem)
    CREATE TABLE "CartItem" (
        "cart_item_id" BIGSERIAL PRIMARY KEY,
        "cart_id" BIGINT NOT NULL,
        "product_id" BIGINT NOT NULL,
        "quantity" INTEGER NOT NULL CHECK ("quantity" > 0),
        FOREIGN KEY ("cart_id") REFERENCES "Cart"("cart_id") ON DELETE CASCADE,
        FOREIGN KEY ("product_id") REFERENCES "Product"("product_id") ON DELETE CASCADE,
        UNIQUE ("cart_id", "product_id")
    );

    -- 7. 订单 (Order)
    CREATE TYPE order_status AS ENUM ('pending', 'paid', 'shipped', 'delivered', 'cancelled');
    CREATE TABLE "Order" (
        "order_id" BIGSERIAL PRIMARY KEY,
        "user_id" BIGINT NOT NULL,
        "order_date" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "total_amount" NUMERIC(12, 2) NOT NULL CHECK ("total_amount" >= 0),
        "status" order_status NOT NULL DEFAULT 'pending',
        FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT
    );

    -- 8. 订单项目 (OrderItem)
    CREATE TABLE "OrderItem" (
        "order_item_id" BIGSERIAL PRIMARY KEY,
        "order_id" BIGINT NOT NULL,
        "product_id" BIGINT NOT NULL,
        "quantity" INTEGER NOT NULL CHECK ("quantity" > 0),
        "price_at_purchase" NUMERIC(10, 2) NOT NULL CHECK ("price_at_purchase" >= 0),
        FOREIGN KEY ("order_id") REFERENCES "Order"("order_id") ON DELETE CASCADE,
        FOREIGN KEY ("product_id") REFERENCES "Product"("product_id") ON DELETE RESTRICT
    );

    -- 9. 索引 (Indexes)
    CREATE INDEX ON "User" ("username");
    CREATE INDEX ON "Product" ("name");
    CREATE INDEX ON "ProductCategory" ("product_id");
    CREATE INDEX ON "CartItem" ("cart_id");
    CREATE INDEX ON "CartItem" ("product_id");
    CREATE INDEX ON "Order" ("user_id");
    CREATE INDEX ON "Order" ("status");
    CREATE INDEX ON "OrderItem" ("order_id");
    CREATE INDEX ON "OrderItem" ("product_id");

    -- 提交事务
    COMMIT;
`;

export async function initializeDatabase() {
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
