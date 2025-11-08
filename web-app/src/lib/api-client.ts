import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from 'axios';
import { useUserStore } from '@/stores/user-store';
import { toast } from 'sonner';

// 环境配置：优先使用 Vite 环境变量，其次退回到 '/api'
const API_BASE_URL: string =
  (import.meta as unknown as { env: { VITE_API_BASE_URL?: string } }).env
    ?.VITE_API_BASE_URL ?? '/api';

// 统一请求错误结构
export interface ApiError {
  status: number | null;
  code: string;
  message: string;
  details?: unknown;
}

// 后端统一返回响应结构
export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

// 创建 axios 实例
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：注入 Authorization
apiClient.interceptors.request.use((config) => {
  const { token } = useUserStore.getState();
  // token =
  //   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwicGhvbmVfbnVtYmVyIjoiMTIzNDU2Nzg5MDEiLCJpYXQiOjE3NjI2MDg4NTMsImV4cCI6MTc2MjYxNjA1M30.NdPHvuKP_oTyxu3UaXp_sFw59g9CT-6eYOB8VHgVlXE';
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器：统一错误转换；默认直接返回 data
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // 有data就直接返回data，否则返回整个响应
    return response.data ? response.data : response;
  },
  (error: AxiosError) => {
    const transformed: ApiError = normalizeAxiosError(error);
    // 401 处理：清理登录态
    if (transformed.status === 401) {
      const { logout } = useUserStore.getState();
      logout();
    }
    toast.error(transformed.message);
    return Promise.reject(transformed);
  }
);

// 返回规范的错误消息
function normalizeAxiosError(error: AxiosError): ApiError {
  const status: number | null = error.response?.status ?? null;
  // 来自服务端的错误消息
  const serverMessage: unknown = (error.response as { msg: string } | undefined)
    ?.msg;
  const message: string =
    typeof serverMessage === 'string' && serverMessage.length > 0
      ? serverMessage
      : error.message || 'Network Error';
  const code: string = error.code ?? 'REQUEST_ERROR';
  const details: unknown = error.response?.data ?? error.toJSON?.() ?? null;
  return { status, code, message, details };
}

// 基础请求方法，通过T指定返回数据类型；可通过config改写配置
export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.request<T>(config);
  return response.data as T;
}

// 封装HTTP请求方法
export function get<T>(
  url: string,
  config?: Omit<AxiosRequestConfig, 'url' | 'method'>
): Promise<T> {
  return request<T>({ ...config, url, method: 'GET' });
}

export function post<T, B = unknown>(
  url: string,
  body?: B,
  config?: Omit<AxiosRequestConfig<B>, 'url' | 'method' | 'data'>
): Promise<T> {
  return request<T>({ ...config, url, method: 'POST', data: body });
}

export function put<T, B = unknown>(
  url: string,
  body?: B,
  config?: Omit<AxiosRequestConfig<B>, 'url' | 'method' | 'data'>
): Promise<T> {
  return request<T>({ ...config, url, method: 'PUT', data: body });
}

export function del<T>(
  url: string,
  config?: Omit<AxiosRequestConfig, 'url' | 'method'>
): Promise<T> {
  return request<T>({ ...config, url, method: 'DELETE' });
}
