import { post } from '@/lib/api-client';

export interface AuthResponseData {
  token: string;
  userId: number;
}

export const AuthApi = {
  // 登录
  login: (phone_number: string, password: string) =>
    post<AuthResponseData>('/login', { phone_number, password }),

  // 注册
  register: (username: string, phone_number: string, password: string) =>
    post<AuthResponseData>('/register', { username, phone_number, password }),
};
