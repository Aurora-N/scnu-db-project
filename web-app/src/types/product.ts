/**
 * 商品类型定义
 */
export interface Product {
  product_id: number;
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
}

/**
 * 创建商品时的请求类型
 */
export type CreateProductRequest = Omit<Product, 'product_id'>;

/**
 * 更新商品时的请求类型
 */
export type UpdateProductRequest = Partial<CreateProductRequest>;

/**
 * 商品-分类关联类型
 */
export interface ProductCategory {
  product_id: number;
  category_id: number;
}
