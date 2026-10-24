# SCNU 数据库课程项目

一个前后端分离的电商课程项目，包含：
- `server`：基于 Express + PostgreSQL 的后端 API
- `web-app`：基于 React + TypeScript + Vite 的前端应用
- `docs`：数据库初始化与关系模型文档

## 项目结构分析

```text
scnu-db-project/
├── server/                  # 后端服务（Node.js + Express）
│   ├── controllers/         # 控制器（业务流程入口）
│   ├── models/              # 数据访问层（SQL/数据模型）
│   ├── routes/              # 路由层（按资源划分）
│   ├── middlewares/         # 中间件（鉴权、统一响应、错误处理）
│   ├── scripts/             # 数据库初始化、Mock 数据、Token 工具
│   ├── test/*.rest          # REST Client 接口测试样例
│   ├── db.js                # PostgreSQL 连接池配置
│   └── index.js             # 后端入口
├── web-app/                 # 前端应用（React + Vite）
│   ├── src/api/             # API 调用封装
│   ├── src/components/      # 业务组件与通用 UI 组件
│   ├── src/pages/           # 页面级组件
│   ├── src/router/          # 前端路由
│   ├── src/stores/          # Zustand 状态管理
│   └── src/types/           # TypeScript 类型定义
├── docs/
│   ├── initDatabase.md      # PostgreSQL 初始化步骤
│   └── relationship.md      # 数据库关系模式说明
├── package.json             # Monorepo workspace 管理与根命令
└── LINTING.md               # ESLint / Prettier 规范说明
```

## 核心功能模块

### 后端 API 模块
- 认证：`/login`、`/register`
- 用户：`/users`
- 商品：`/products`
- 分类：`/categories`
- 订单：`/orders`
- 购物车：`/carts`

后端采用分层结构：
- `routes` 定义接口
- `controllers` 处理业务逻辑
- `models` 负责数据库读写
- `middlewares` 处理鉴权与异常

### 前端页面模块
- 首页：`/`
- 购物车：`/cart`
- 订单列表：`/orders`
- 商品详情：`/product/:id`
- 订单详情：`/order/:id`

前端通过 `src/lib/api-client.ts` 统一封装请求与错误处理，使用 Zustand 管理用户态与搜索态。

## 技术栈

- 后端：Node.js、Express、PostgreSQL、JWT、bcrypt
- 前端：React 19、TypeScript、Vite、React Router、Zustand、Axios、Tailwind CSS
- 工具链：ESLint、Prettier、npm workspaces

## 快速开始

> 需要先安装 Node.js（建议 18+）和 PostgreSQL。

### 1) 安装依赖

在仓库根目录执行：

```bash
npm run install:all
```

### 2) 配置后端环境变量

在 `server/.env` 中配置（至少包含）：
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`

### 3) 初始化数据库

参考 `docs/initDatabase.md` 创建数据库与用户后，执行：

```bash
npm run init:db -w @aurora-db-lab/server
```

可选：插入 Mock 数据

```bash
npm run generate-mock-data -w @aurora-db-lab/server
```

### 4) 启动开发环境

在仓库根目录执行：

```bash
npm run dev:all
```

默认情况下：
- 后端运行在 `http://localhost:3000`
- 前端由 Vite 启动（终端会显示具体端口）

## 常用命令

根目录：

```bash
npm run dev:all          # 同时启动前后端
npm run dev:server       # 仅启动后端
npm run dev:web          # 仅启动前端
npm run build:web        # 构建前端
npm run lint             # ESLint 检查
npm run lint:fix         # ESLint 自动修复
npm run format           # Prettier 格式化
npm run format:check     # Prettier 检查
```

后端目录（`server`）：

```bash
npm run dev
npm run init:db
npm run generate-token
npm run generate-mock-data
```

## 数据库模型概览

项目主要实体：
- users
- products
- categories
- product_categories
- carts
- cart_items
- orders
- order_items

详见 `docs/relationship.md`。

## 课程项目建议阅读顺序

1. `docs/relationship.md`（先理解数据模型）
2. `server/routes`（看接口划分）
3. `server/controllers` 与 `server/models`（看业务与数据流）
4. `web-app/src/router` 与 `web-app/src/pages`（看前端页面流）
5. `web-app/src/api`（看前后端交互）
