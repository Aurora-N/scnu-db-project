import { get, post, put, del } from '@/lib/api-client';
import type {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '@/types/category';
import type { Product } from '@/types/product';

interface CategoryListResponseData {
  categories: Category[];
  total: number;
}

interface CategoryWithProductsResponseData extends Category {
  products: Product[];
  product_count: number;
}

interface ProductsByCategoryResponseData {
  category: Category;
  products: Product[];
  total: number;
}

export const CategoryApi = {
  // 获取所有商品分类
  getAllCategories: () => get<CategoryListResponseData>('/categories'),

  // 获取指定ID的商品分类
  getCategoryById: (id: number) => get<Category>(`/categories/detail/${id}`),

  // 获取分类详情（包含商品列表）
  getCategoryWithProducts: (id: number) =>
    get<CategoryWithProductsResponseData>(`/categories/${id}/with-products`),

  // 获取分类下的所有商品
  getProductsByCategory: (id: number) =>
    get<ProductsByCategoryResponseData>(`/categories/${id}/products`),

  // 创建商品分类
  createCategory: (data: CreateCategoryRequest) =>
    post<Category>('/categories', data),

  // 更新商品分类
  updateCategory: (id: number, data: UpdateCategoryRequest) =>
    put<Category>(`/categories/${id}`, data),

  // 删除商品分类
  deleteCategory: (id: number) =>
    del<{ category: Category }>(`/categories/${id}`),
};
