/**
 * 用户类型定义
 */
export interface User {
  user_id: number;
  username: string;
  phone_number: string;
  created_at: string; // ISO 8601 timestamp string
}

/**
 * 创建用户时的请求类型（不包含自动生成的字段）
 */
export interface CreateUserRequest {
  username: string;
  phone_number: string;
  password_hash: string;
}

/**
 * 更新用户时的请求类型（所有字段可选）
 */
export type UpdateUserRequest = Partial<CreateUserRequest>;
