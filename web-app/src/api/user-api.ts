import { get, post, put, del } from '@/lib/api-client';
import type { User, CreateUserRequest, UpdateUserRequest } from '@/types/user';

interface UserResponseData {
  user: User;
}

export const UserApi = {
  // 获取所有用户
  getAllUsers: () => get<User[]>('/users'),

  // 获取指定用户
  getUserById: (id: number) => get<UserResponseData>(`/users/${id}`),

  // 创建用户
  createUser: (data: CreateUserRequest) =>
    post<UserResponseData>('/users', data),

  // 更新用户信息
  updateUser: (id: number, data: UpdateUserRequest) =>
    put<UserResponseData>(`/users/${id}`, data),

  // 删除用户
  deleteUser: (id: number) => del<UserResponseData>(`/users/${id}`),
};
