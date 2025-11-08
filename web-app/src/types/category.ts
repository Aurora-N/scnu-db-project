/**
 * 商品分类类型定义
 * 对应数据库表: categories
 */
export interface Category {
  category_id: number;
  name: string;
  description: string;
}

/**
 * 创建分类时的请求类型
 */
export type CreateCategoryRequest = Omit<Category, 'category_id'>;

/**
 * 更新分类时的请求类型
 */
export type UpdateCategoryRequest = Partial<CreateCategoryRequest>;
