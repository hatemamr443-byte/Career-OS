import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { authAPI, api } from '../services/api';

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { checkAuth(); }, []);

  const checkAuth = async () => {
    try {
      const token = await SecureStore.getItemAsync('access_token');
      if (token) {
        const res = await api.get('/profile');
        setUser(res.data);
      }
    } catch (e) {
      await SecureStore.deleteItemAsync('access_token');
      await SecureStore.deleteItemAsync('refresh_token');
    } finally { setIsLoading(false); }
  };

  const login = async (email: string, password: string) => {
    const res = await authAPI.login({ email, password });
    await SecureStore.setItemAsync('access_token', res.data.access_token);
    await SecureStore.setItemAsync('refresh_token', res.data.refresh_token);
    const profileRes = await api.get('/profile');
    setUser(profileRes.data);
  };

  const register = async (data: any) => {
    const res = await authAPI.register(data);
    await SecureStore.setItemAsync('access_token', res.data.access_token);
    await SecureStore.setItemAsync('refresh_token', res.data.refresh_token);
    setUser(res.data);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('refresh_token');
    setUser(null);
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
