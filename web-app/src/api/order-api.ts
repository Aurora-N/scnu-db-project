import { get, post, put, del } from '@/lib/api-client';
import type {
  MergedOrderItem,
  Order,
  OrderStatus,
  OrderWithItems,
} from '@/types/order';

interface CreateOrderApiRequest {
  userId: number;
  shippingAddress: string;
  items: {
    productId: number;
    quantity: number;
    unitPrice: number;
  }[];
}

export const OrderApi = {
  // 创建新订单
  createOrder: (data: CreateOrderApiRequest) => post<Order>('/orders', data),

  // 通过ID获取订单详细信息
  getOrderById: (id: number) => get<OrderWithItems>(`/orders/${id}`),

  // 查询用户的所有订单信息
  getOrdersByUserId: (userId: number) => get<Order[]>(`/orders/user/${userId}`),

  // 删除订单
  deleteOrder: (id: number) =>
    del<{ message: string; orderId: number }>(`/orders/${id}`),

  // 更新订单状态
  updateOrderStatus: (
    id: number,
    data: {
      status: OrderStatus;
    }
  ) => put<{ message: string; order: Order }>(`/orders/${id}/status`, data),

  // 获取订单项目
  getOrderItems: (id: number) => get<MergedOrderItem[]>(`/orders/${id}/items`),
};
