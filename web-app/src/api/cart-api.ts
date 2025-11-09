import { get, post, put, del } from '@/lib/api-client';
import type { Cart, CartItem } from '@/types/cart';
import type { Order } from '@/types/order';

interface UserCartResponseData {
  cart_id: number;
  user_id: number;
  updated_at: string;
  items: CartItem[];
  summary: {
    item_count: number;
    total_quantity: number;
    total_amount: number;
  };
}

interface CartSummaryResponseData {
  cart_id: number;
  user_id: number;
  updated_at: string;
  item_count: number;
  total_quantity: number;
  total_amount: number;
}

interface RemoveCartItemResponseData {
  cart_item_id: number;
}

interface DeleteCartResponseData {
  cart_id: number;
}

interface RemoveBatchItemsResponseData {
  deleted_count: number;
  deleted_items: CartItem[];
}

interface CreateCartRequest {
  userId: number;
}

interface AddItemToCartRequest {
  productId: number;
  quantity: number;
}

interface UpdateCartItemRequest {
  quantity: number;
}

interface RemoveBatchItemsRequest {
  cartItemIds: number[];
}

interface CreateOrderFromCartRequest {
  shippingAddress: string;
}

export const CartApi = {
  // 获取用户的购物车信息（包含商品列表和总价）
  getUserCart: (userId: number) =>
    get<UserCartResponseData>(`/carts/user/${userId}`),

  // 创建购物车
  createCart: (data: CreateCartRequest) => post<Cart>('/carts', data),

  // 删除购物车
  deleteCart: (cartId: number) =>
    del<DeleteCartResponseData>(`/carts/${cartId}`),

  // 删除用户的购物车
  deleteUserCart: (userId: number) =>
    del<DeleteCartResponseData>(`/carts/user/${userId}`),

  // 清空购物车（保留购物车但删除所有商品）
  clearCart: (cartId: number) => del<{ cart: Cart }>(`/carts/${cartId}/clear`),

  // 获取购物车摘要（总价、商品数量等）
  getCartSummary: (cartId: number) =>
    get<CartSummaryResponseData>(`/carts/${cartId}/summary`),

  // 获取购物车的所有商品
  getCartItems: (cartId: number) => get<CartItem[]>(`/carts/${cartId}/items`),

  // 添加商品到购物车
  addItemToCart: (cartId: number, data: AddItemToCartRequest) =>
    post<CartItem>(`/carts/${cartId}/items`, data),

  // 更新购物车商品数量
  updateCartItem: (cartItemId: number, data: UpdateCartItemRequest) =>
    put<CartItem>(`/carts/items/${cartItemId}`, data),

  // 从购物车删除商品（通过购物车项目ID）
  removeItemFromCart: (cartItemId: number) =>
    del<RemoveCartItemResponseData>(`/carts/items/${cartItemId}`),

  // 从购物车删除商品（通过商品ID）
  removeProductFromCart: (cartId: number, productId: number) =>
    del<RemoveCartItemResponseData>(`/carts/${cartId}/products/${productId}`),

  // 批量删除购物车商品
  removeBatchItems: (data: RemoveBatchItemsRequest) =>
    post<RemoveBatchItemsResponseData>('/carts/items/batch-delete', data),

  // 使用购物车商品创建订单
  createOrderFromCart: (cartId: number, data: CreateOrderFromCartRequest) =>
    post<{ order: Order }>(`/carts/${cartId}/checkout`, data),
};
