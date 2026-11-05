import axios, { AxiosError } from 'axios';
import { ApiErrorResponse, NormalizedApiError } from './types';

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
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      window.dispatchEvent(
        new CustomEvent('auth:unauthorized', {
          detail: { message: 'Your session has expired. Please sign in again.' },
        }),
      );
    }
    return Promise.reject(error);
  },
);

/**
 * Normalizes any API or client error into a consistent { code, message, details, status } shape.
 */
export function normalizeApiError(error: unknown): NormalizedApiError {
  if (axios.isAxiosError(error)) {
    const axiosErr = error as AxiosError<ApiErrorResponse>;
    const data = axiosErr.response?.data;
    if (data?.error) {
      return {
        code: data.error.code || 'API_ERROR',
        message: data.error.message || 'An error occurred while processing your request.',
        details: data.error.details as NormalizedApiError['details'],
        status: axiosErr.response?.status,
      };
    }
    return {
      code: 'NETWORK_ERROR',
      message: axiosErr.message || 'Network communication error.',
      status: axiosErr.response?.status,
    };
  }

  if (error instanceof Error) {
    return {
      code: 'CLIENT_ERROR',
      message: error.message,
    };
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unknown error occurred.',
  };
}

export const getApiErrorMessage = (error: unknown, fallback = 'An unexpected error occurred'): string => {
  return normalizeApiError(error).message || fallback;
};
