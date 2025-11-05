1. 启动psql

2. 新建用户
```sql
CREATE USER ecom_admin WITH PASSWORD 'super_secret_123';
```

3. 新建数据库
```sql
CREATE DATABASE ecom_database;
```

4. 切换到新数据库
```sql
\c ecom_database;
```

5. 为用户分配数据库权限
```sql
GRANT CREATE ON SCHEMA public TO ecom_admin; -- 允许用户在public模式下创建表
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ecom_admin; -- 允许用户对public模式下现有的所有表执行所有操作
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ecom_admin; -- 允许用户在public模式下对未来新创建的表也有权限
```

6. 执行npm初始化脚本
```bash
cd server
npm run init:db
```