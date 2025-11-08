/**
 * 订单状态类型
 * 对应数据库 ENUM: order_status
 */
export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

/**
 * 订单状态常量
 */
export const ORDER_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

/**
 * 订单类型定义
 */
export interface Order {
  order_id: number;
  user_id: number;
  created_at: string; // ISO 8601 timestamp string
  status: OrderStatus;
  shipping_address: string;
}

/**
 * 创建订单时的请求类型
 */
export interface CreateOrderRequest {
  shipping_address: string;
  status?: OrderStatus;
}

/**
 * 更新订单时的请求类型
 */
export type UpdateOrderRequest = Partial<CreateOrderRequest>;

/**
 * 订单项目类型定义
 */
export interface OrderItem {
  order_item_id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
}

/**
 * 创建订单项目时的请求类型
 */
export type CreateOrderItemRequest = Omit<OrderItem, 'order_item_id'>;

/**
 * 订单详情（包含订单项目）
 */
export interface OrderWithItems extends Order {
  items: OrderItem[];
}

/**
 * 订单项目详情（包含商品信息）
 */
export interface OrderItemWithProduct extends OrderItem {
  product_name?: string;
  product_description?: string;
}
