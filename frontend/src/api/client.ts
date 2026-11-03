import axios, { AxiosError } from 'axios';
import { ApiErrorResponse } from './types';

export const TOKEN_STORAGE_KEY = 'nld_auth_token';

export const apiClient = axios.create({
  baseURL: '/',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.status === 401) {
      // Clear token and trigger custom auth event for AuthContext listener
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return Promise.reject(error);
  },
);

export const getApiErrorMessage = (error: unknown, fallback = 'An unexpected error occurred'): string => {
  if (axios.isAxiosError(error)) {
    const axiosErr = error as AxiosError<ApiErrorResponse>;
    if (axiosErr.response?.data?.error?.message) {
      return axiosErr.response.data.error.message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
};

