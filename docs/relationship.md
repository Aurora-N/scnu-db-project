数据库关系模式

说明：**主键**包裹的为主键（PK），__外键__包裹的为外键（FK）

- 用户(**用户 ID**, 用户名, 手机号, 密码, 注册时间)
- 订单(**订单 ID**, __用户 ID__, 订单状态, 创建时间, 邮寄地址)
- 订单项目(**订单项目 ID**, __订单 ID__, __商品 ID__, 购买数量, 单价)
- 商品(**商品 ID**, 名称, 描述, 价格, 库存)
- 商品分类(**分类 ID**, 名称, 描述)
- 商品-分类关联(**商品 ID**, **分类 ID**)
- 购物车(**购物车 ID**, __用户 ID__, 更新时间)
- 购物车项目(**购物车项目 ID**, __购物车 ID__, __商品 ID__, 购买数量, 单价)


变量名版关系模式描述（与数据库 DDL 一致）：
- users(**user_id**, username, phone_number, password_hash, created_at)
- orders(**order_id**, __user_id__, status, created_at, shipping_address)
- order_items(**order_item_id**, __order_id__, __product_id__, quantity, unit_price)
- products(**product_id**, name, description, price, stock_quantity)
- categories(**category_id**, name, description)
- product_categories(**product_id**, **category_id**)
- carts(**cart_id**, __user_id__, updated_at)
- cart_items(**cart_item_id**, __cart_id__, __product_id__, quantity, unit_price)
