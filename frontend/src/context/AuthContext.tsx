import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { User } from '../api/types';
import { authApi, LoginPayload, RegisterPayload } from '../api/auth.api';
import { TOKEN_STORAGE_KEY } from '../api/client';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  canCreate: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
  }, []);

  // Initialize and re-verify session on mount
  useEffect(() => {
    const initAuth = async (): Promise<void> => {
      const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const { user: profile } = await authApi.getMe();
        setUser(profile);
        setToken(storedToken);
      } catch {
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    void initAuth();

    // Listen for 401 interceptor events
    const handleUnauthorized = (): void => {
      logout();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [logout]);

  const login = async (payload: LoginPayload): Promise<void> => {
    setIsLoading(true);
    try {
      const res = await authApi.login(payload);
      localStorage.setItem(TOKEN_STORAGE_KEY, res.token);
      setToken(res.token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload): Promise<void> => {
    setIsLoading(true);
    try {
      const res = await authApi.register(payload);
      localStorage.setItem(TOKEN_STORAGE_KEY, res.token);
      setToken(res.token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const isAuthenticated = useMemo(() => Boolean(token && user), [token, user]);
  const isAdmin = useMemo(() => user?.role === 'ADMIN', [user]);
  // Design Decision: ADMIN has full creation permissions; USER needs access === 'CREATE'
  const canCreate = useMemo(() => {
    if (!user) return false;
    return user.role === 'ADMIN' || user.access === 'CREATE';
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated,
      isAdmin,
      canCreate,
      isLoading,
      login,
      register,
      logout,
    }),
    [user, token, isAuthenticated, isAdmin, canCreate, isLoading, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
