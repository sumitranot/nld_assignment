import { apiClient, normalizeApiError } from './client';
import { User, UserAccess, UserRole, userSchema } from './types';
import { z } from 'zod';

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

const authResponseSchema = z.object({
  user: userSchema,
  token: z.string(),
});

export const authApi = {
  login: async (data: LoginPayload): Promise<AuthApiResponse> => {
    try {
      const res = await apiClient.post<AuthApiResponse>('/auth/login', data);
      const parsed = authResponseSchema.safeParse(res.data);
      return parsed.success ? parsed.data : res.data;
    } catch (err) {
      throw normalizeApiError(err);
    }
  },

  register: async (data: RegisterPayload): Promise<AuthApiResponse> => {
    try {
      const res = await apiClient.post<AuthApiResponse>('/auth/register', data);
      const parsed = authResponseSchema.safeParse(res.data);
      return parsed.success ? parsed.data : res.data;
    } catch (err) {
      throw normalizeApiError(err);
    }
  },

  getMe: async (): Promise<{ user: User }> => {
    try {
      const res = await apiClient.get<{ user: User }>('/auth/me');
      const parsedUser = userSchema.safeParse(res.data.user);
      return { user: parsedUser.success ? parsedUser.data : res.data.user };
    } catch (err) {
      throw normalizeApiError(err);
    }
  },
};
