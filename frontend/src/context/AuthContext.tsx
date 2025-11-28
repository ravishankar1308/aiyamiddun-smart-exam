
// context/AuthContext.tsx

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiLogin, apiRegister, UserProfile } from '@/lib/api';

// Define a type for the registration data
interface RegisterData {
    name: string;
    username: string;
    password: string;
    role: 'student' | 'teacher' | 'admin' | 'owner';
}

// Define the context value
interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define the props for the provider
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // Initially true to check for stored user

  useEffect(() => {
    // On component mount, try to load user and token from local storage
    try {
      const storedUser = localStorage.getItem('aiyamiddun_user');
      const storedToken = localStorage.getItem('aiyamiddun_token');
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      }
    } catch (error) {
      console.error("Failed to parse user from local storage", error);
      localStorage.removeItem('aiyamiddun_user'); // Clear corrupted data
      localStorage.removeItem('aiyamiddun_token');
    }
    setLoading(false); // Done checking
  }, []);

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      const { token, user } = await apiLogin(username, password);
      setUser(user);
      setToken(token);
      localStorage.setItem('aiyamiddun_user', JSON.stringify(user));
      localStorage.setItem('aiyamiddun_token', token);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setLoading(true);
    try {
      await apiRegister(userData);
      await login(userData.username, userData.password);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('aiyamiddun_user');
    localStorage.removeItem('aiyamiddun_token');
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
