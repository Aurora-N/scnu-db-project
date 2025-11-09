// 导入 'pg' 库的 Client
import { Client } from 'pg';
import { config } from '../utils/env.js';
import { faker } from '@faker-js/faker/locale/zh_CN';
import bcrypt from 'bcryptjs';

// 配置数据量分配 (总计约100,000条记录)
const DATA_CONFIG = {
  users: 1000, // 用户数量
  categories: 20, // 分类数量
  products: 30000, // 商品数量 (占大部分)
  productCategories: 35000, // 商品-分类关联
  carts: 800, // 购物车数量 (80%的用户有购物车)
  cartItems: 25000, // 购物车项目 (占大部分)
  orders: 8000, // 订单数量 (占大部分)
  orderItems: 35000, // 订单项目 (占大部分)
};

// 订单状态枚举
const ORDER_STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

// 商品分类数据
const CATEGORY_NAMES = [
  '电子产品',
  '服装鞋帽',
  '食品饮料',
  '家居用品',
  '图书音像',
  '运动户外',
  '美妆个护',
  '母婴用品',
  '玩具乐器',
  '汽车用品',
  '办公用品',
  '珠宝首饰',
  '医药保健',
  '宠物用品',
  '数码配件',
  '家用电器',
  '箱包皮具',
  '钟表眼镜',
  '生鲜水果',
  '酒类茶饮',
];

// 生成随机日期（最近一年内）
function randomDate(daysBack = 365) {
  const now = new Date();
  const pastDate = new Date(
    now.getTime() - Math.random() * daysBack * 24 * 60 * 60 * 1000
  );
  return pastDate.toISOString();
}

// 生成随机价格
function randomPrice(min = 10, max = 5000) {
  return (Math.random() * (max - min) + min).toFixed(2);
}

// 生成随机库存
function randomStock(min = 0, max = 1000) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 生成随机数量
function randomQuantity(min = 1, max = 10) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 批量插入函数
async function batchInsert(
  client,
  tableName,
  columns,
  values,
  batchSize = 1000
) {
  const totalBatches = Math.ceil(values.length / batchSize);
  console.log(
    `📦 开始批量插入 ${tableName}，共 ${values.length} 条记录，分 ${totalBatches} 批...`
  );

  for (let i = 0; i < values.length; i += batchSize) {
    const batch = values.slice(i, i + batchSize);
    const placeholders = batch
      .map((_, idx) => {
        const offset = idx * columns.length;
        return `(${columns.map((_, colIdx) => `$${offset + colIdx + 1}`).join(', ')})`;
      })
      .join(', ');

    const flatValues = batch.flat();
    const sql = `INSERT INTO ${tableName} (${columns.map((c) => `"${c}"`).join(', ')}) VALUES ${placeholders}`;

    await client.query(sql, flatValues);
    console.log(
      `   ✓ 已插入 ${Math.min(i + batchSize, values.length)}/${values.length} 条记录`
    );
  }

  console.log(`✅ ${tableName} 插入完成！\n`);
}

async function insertMockData() {
  const client = new Client({
    host: config.DB_HOST,
    port: config.DB_PORT,
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_NAME,
  });

  try {
    await client.connect();
    console.log('🔌 已连接到数据库\n');
    console.log('🚀 开始生成并插入 Mock 数据...\n');

    const startTime = Date.now();

    // 1. 插入用户数据
    console.log('👤 生成用户数据...');
    console.log('🔐 正在加密密码（统一密码: 123456）...');
    // 使用与 authController 一致的加密方式：bcrypt.hash(password, 10)
    const hashedPassword = await bcrypt.hash('123456', 10);
    console.log(`   ✓ 密码加密完成: ${hashedPassword.substring(0, 20)}...`);

    const userValues = [];
    for (let i = 0; i < DATA_CONFIG.users; i++) {
      userValues.push([
        faker.person.fullName(),
        faker.phone.number({ style: 'international' }).slice(3), // 去除+86
        hashedPassword, // 使用加密后的密码
        randomDate(730), // 最近两年内注册
      ]);
    }
    await batchInsert(
      client,
      'users',
      ['username', 'phone_number', 'password_hash', 'created_at'],
      userValues
    );

    // 2. 插入分类数据
    console.log('📂 生成分类数据...');
    const categoryValues = CATEGORY_NAMES.map((name) => [
      name,
      faker.commerce.productDescription(),
    ]);
    await batchInsert(
      client,
      'categories',
      ['name', 'description'],
      categoryValues
    );

    // 3. 插入商品数据
    console.log('🛍️  生成商品数据...');
    const productValues = [];
    for (let i = 0; i < DATA_CONFIG.products; i++) {
      productValues.push([
        faker.commerce.productName(),
        faker.commerce.productDescription(),
        randomPrice(10, 5000),
        randomStock(0, 1000),
      ]);
    }
    await batchInsert(
      client,
      'products',
      ['name', 'description', 'price', 'stock_quantity'],
      productValues
    );

    // 4. 插入商品-分类关联
    console.log('🔗 生成商品-分类关联数据...');
    const productCategoryValues = [];
    const usedPairs = new Set();

    for (let i = 0; i < DATA_CONFIG.productCategories; i++) {
      let productId, categoryId, pairKey;
      do {
        productId = Math.floor(Math.random() * DATA_CONFIG.products) + 1;
        categoryId = Math.floor(Math.random() * CATEGORY_NAMES.length) + 1;
        pairKey = `${productId}-${categoryId}`;
      } while (usedPairs.has(pairKey));

      usedPairs.add(pairKey);
      productCategoryValues.push([productId, categoryId]);
    }
    await batchInsert(
      client,
      'product_categories',
      ['product_id', 'category_id'],
      productCategoryValues
    );

    // 5. 插入购物车数据
    console.log('🛒 生成购物车数据...');
    const cartValues = [];
    const usedUserIds = new Set();

    for (let i = 0; i < DATA_CONFIG.carts; i++) {
      let userId;
      do {
        userId = Math.floor(Math.random() * DATA_CONFIG.users) + 1;
      } while (usedUserIds.has(userId));

      usedUserIds.add(userId);
      cartValues.push([
        userId,
        randomDate(30), // 最近30天内更新
      ]);
    }
    await batchInsert(client, 'carts', ['user_id', 'updated_at'], cartValues);

    // 6. 插入购物车项目
    console.log('🛒 生成购物车项目数据...');
    const cartItemValues = [];
    const cartItemPairs = new Set();

    for (let i = 0; i < DATA_CONFIG.cartItems; i++) {
      let cartId, productId, pairKey;
      do {
        cartId = Math.floor(Math.random() * DATA_CONFIG.carts) + 1;
        productId = Math.floor(Math.random() * DATA_CONFIG.products) + 1;
        pairKey = `${cartId}-${productId}`;
      } while (cartItemPairs.has(pairKey));

      cartItemPairs.add(pairKey);
      cartItemValues.push([
        cartId,
        productId,
        randomQuantity(1, 10),
        randomPrice(10, 5000),
      ]);
    }
    await batchInsert(
      client,
      'cart_items',
      ['cart_id', 'product_id', 'quantity', 'unit_price'],
      cartItemValues
    );

    // 7. 插入订单数据
    console.log('📦 生成订单数据...');
    const orderValues = [];
    for (let i = 0; i < DATA_CONFIG.orders; i++) {
      orderValues.push([
        Math.floor(Math.random() * DATA_CONFIG.users) + 1, // user_id
        randomDate(180), // 最近半年内的订单
        ORDER_STATUSES[Math.floor(Math.random() * ORDER_STATUSES.length)],
        faker.location.streetAddress({ useFullAddress: true }),
      ]);
    }
    await batchInsert(
      client,
      'orders',
      ['user_id', 'created_at', 'status', 'shipping_address'],
      orderValues
    );

    // 8. 插入订单项目
    console.log('📦 生成订单项目数据...');
    const orderItemValues = [];

    for (let i = 0; i < DATA_CONFIG.orderItems; i++) {
      orderItemValues.push([
        Math.floor(Math.random() * DATA_CONFIG.orders) + 1, // order_id
        Math.floor(Math.random() * DATA_CONFIG.products) + 1, // product_id
        randomQuantity(1, 20),
        randomPrice(10, 5000),
      ]);
    }
    await batchInsert(
      client,
      'order_items',
      ['order_id', 'product_id', 'quantity', 'unit_price'],
      orderItemValues
    );

    // 计算总记录数
    const totalRecords =
      DATA_CONFIG.users +
      CATEGORY_NAMES.length +
      DATA_CONFIG.products +
      DATA_CONFIG.productCategories +
      DATA_CONFIG.carts +
      DATA_CONFIG.cartItems +
      DATA_CONFIG.orders +
      DATA_CONFIG.orderItems;

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ Mock 数据插入完成！');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`📊 数据统计：`);
    console.log(`   • 用户: ${DATA_CONFIG.users.toLocaleString()} 条`);
    console.log(`   • 分类: ${CATEGORY_NAMES.length} 条`);
    console.log(`   • 商品: ${DATA_CONFIG.products.toLocaleString()} 条`);
    console.log(
      `   • 商品-分类关联: ${DATA_CONFIG.productCategories.toLocaleString()} 条`
    );
    console.log(`   • 购物车: ${DATA_CONFIG.carts.toLocaleString()} 条`);
    console.log(
      `   • 购物车项目: ${DATA_CONFIG.cartItems.toLocaleString()} 条`
    );
    console.log(`   • 订单: ${DATA_CONFIG.orders.toLocaleString()} 条`);
    console.log(`   • 订单项目: ${DATA_CONFIG.orderItems.toLocaleString()} 条`);
    console.log(`   ─────────────────────────────────────────────────────`);
    console.log(`   📈 总计: ${totalRecords.toLocaleString()} 条记录`);
    console.log(`   ⏱️  耗时: ${duration} 秒`);
    console.log('═══════════════════════════════════════════════════════\n');
  } catch (error) {
    console.error('❌ Mock 数据插入失败:');
    console.error(error.message);
    console.error(error.stack);
  } finally {
    await client.end();
    console.log('🔌 数据库连接已关闭。');
  }
}

insertMockData();
