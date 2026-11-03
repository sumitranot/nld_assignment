import { apiClient } from './client';
import { User, UserAccess, UserRole } from './types';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  role: UserRole;
  access?: UserAccess;
}

export interface AuthApiResponse {
  user: User;
  token: string;
}

export const authApi = {
  login: async (data: LoginPayload): Promise<AuthApiResponse> => {
    const res = await apiClient.post<AuthApiResponse>('/auth/login', data);
    return res.data;
  },

  register: async (data: RegisterPayload): Promise<AuthApiResponse> => {
    const res = await apiClient.post<AuthApiResponse>('/auth/register', data);
    return res.data;
  },

  getMe: async (): Promise<{ user: User }> => {
    const res = await apiClient.get<{ user: User }>('/auth/me');
    return res.data;
  },
};

