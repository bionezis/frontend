'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, User } from '../api/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
  }) => Promise<void>;
  registerWithInvitation: (data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
    invitation_code: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user on mount
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      // Check if we're on the client side
      if (typeof window === 'undefined') {
        setLoading(false);
        return;
      }
      
      const token = localStorage.getItem('access_token');
      if (token) {
        const userData = await authApi.getMe();
        setUser(userData);
      }
    } catch (error) {
      console.error('Failed to load user:', error);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', response.access);
        localStorage.setItem('refresh_token', response.refresh);
      }
      setUser(response.user);
    } catch (error: any) {
      // Handle approval pending error
      if (error.response?.status === 403 && error.response?.data?.detail?.includes('pending approval')) {
        throw new Error('Your account is pending approval. Please wait for admin approval.');
      }
      throw error;
    }
  };

  const register = async (data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
  }) => {
    const response = await authApi.register(data);
    // Don't automatically log in after registration - user needs approval
    // localStorage.setItem('access_token', response.access);
    // localStorage.setItem('refresh_token', response.refresh);
    // setUser(response.user);
  };

  const registerWithInvitation = async (data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
    invitation_code: string;
  }) => {
    const response = await authApi.registerWithInvitation(data);
    // Auto-login after invitation registration
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', response.access);
      localStorage.setItem('refresh_token', response.refresh);
    }
    setUser(response.user);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
      setUser(null);
    }
  };

  const refreshUser = async () => {
    await loadUser();
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, registerWithInvitation, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

