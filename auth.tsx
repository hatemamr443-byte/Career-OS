"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { api, authAPI } from './api';

interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  role: string;
  ai_requests_used: number;
  ai_requests_limit: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get('access_token');
    if (token) {
      api.get('/profile').then((res) => {
        setUser(res.data);
      }).catch(() => {
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
      }).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authAPI.login({ email, password });
    Cookies.set('access_token', response.data.access_token);
    Cookies.set('refresh_token', response.data.refresh_token);
    const profileRes = await api.get('/profile');
    setUser(profileRes.data);
  };

  const register = async (data: any) => {
    const response = await authAPI.register(data);
    Cookies.set('access_token', response.data.access_token);
    Cookies.set('refresh_token', response.data.refresh_token);
    setUser(response.data);
  };

  const logout = () => {
    authAPI.logout();
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
