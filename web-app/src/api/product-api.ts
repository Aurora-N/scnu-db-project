import { get, post, put, del } from '@/lib/api-client';
import type {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
} from '@/types/product';
import type { Category } from '@/types/category';
import type { Order } from '@/types/order';

interface ProductListResponseData {
  products: Product[];
  total: number;
  hasMore?: boolean;
}

interface PaginationParams {
  limit?: number;
  offset?: number;
}

interface BuyProductRequest {
  quantity: number;
  shipping_address: string;
}

export const ProductApi = {
  // 查询所有商品
  getAllProducts: (params?: PaginationParams) => {
    const queryParams = new URLSearchParams();
    if (params?.limit !== undefined)
      queryParams.append('limit', params.limit.toString());
    if (params?.offset !== undefined)
      queryParams.append('offset', params.offset.toString());
    const queryString = queryParams.toString();
    return get<ProductListResponseData>(
      `/products${queryString ? `?${queryString}` : ''}`
    );
  },

  // 通过id获取某个商品信息
  getProductById: (id: number) => get<Product>(`/products/detail/${id}`),

  // 通过名称查询商品
  getProductsByName: (name: string, params?: PaginationParams) => {
    const queryParams = new URLSearchParams();
    if (params?.limit !== undefined)
      queryParams.append('limit', params.limit.toString());
    if (params?.offset !== undefined)
      queryParams.append('offset', params.offset.toString());
    const queryString = queryParams.toString();
    return get<ProductListResponseData>(
      `/products/query/${name}${queryString ? `?${queryString}` : ''}`
    );
  },

  // 通过分类获取商品
  getProductsByCategory: (categoryId: number, params?: PaginationParams) => {
    const queryParams = new URLSearchParams();
    if (params?.limit !== undefined)
      queryParams.append('limit', params.limit.toString());
    if (params?.offset !== undefined)
      queryParams.append('offset', params.offset.toString());
    const queryString = queryParams.toString();
    return get<ProductListResponseData>(
      `/products/category/${categoryId}${queryString ? `?${queryString}` : ''}`
    );
  },

  // 创建商品
  createProduct: (data: CreateProductRequest) =>
    post<Product>('/products', data),

  // 修改商品信息
  updateProduct: (id: number, data: UpdateProductRequest) =>
    put<Product>(`/products/${id}`, data),

  // 删除商品
  deleteProduct: (id: number) => del<{ product: Product }>(`/products/${id}`),

  // 购买商品
  buyProduct: (productId: number, data: BuyProductRequest) =>
    post<{ order: Order }>(`/products/${productId}/buy`, data),

  // 取消购买商品
  cancelProductPurchase: (orderId: number) =>
    post<{ order: Order }>(`/products/order/${orderId}/cancel`, {}),

  // 为商品添加分类
  addCategoryToProduct: (productId: number, categoryId: number) =>
    post<{
      relation: { product_id: number; category_id: number };
    }>(`/products/${productId}/categories`, { categoryId }),

  // 从商品移除分类
  removeCategoryFromProduct: (productId: number, categoryId: number) =>
    del<{
      relation: { product_id: number; category_id: number };
    }>(`/products/${productId}/categories/${categoryId}`),

  // 查询商品的所有分类
  getCategoriesByProduct: (productId: number) =>
    get<{ categories: Category[]; total: number }>(
      `/products/${productId}/categories`
    ),
};
