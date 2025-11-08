/**
 * 购物车类型定义
 */
export interface Cart {
  cart_id: number;
  user_id: number;
  updated_at: string; // ISO 8601 timestamp string
}

/**
 * 购物车项目类型定义
 */
export interface CartItem {
  cart_item_id: number;
  cart_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
}

/**
 * 创建购物车项目时的请求类型
 */
export type CreateCartItemRequest = Omit<CartItem, 'cart_item_id'>;

/**
 * 更新购物车项目时的请求类型
 */
export type UpdateCartItemRequest = Partial<CartItem>;

/**
 * 购物车详情（包含商品信息）
 */
export interface CartItemWithProduct extends CartItem {
  product_name?: string;
  product_description?: string | null;
  product_stock?: number;
}
