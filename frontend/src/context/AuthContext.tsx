
// context/AuthContext.tsx

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiLogin, apiRegister } from '@/lib/api';

// Define the shape of the user profile
interface UserProfile {
  id: number;
  name: string;
  username: string;
  role: 'student' | 'teacher' | 'admin' | 'owner';
  disabled: boolean;
}

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
  const [loading, setLoading] = useState(true); // Initially true to check for stored user

  useEffect(() => {
    // On component mount, try to load user from local storage
    try {
      const storedUser = localStorage.getItem('aiyamiddun_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from local storage", error);
      localStorage.removeItem('aiyamiddun_user'); // Clear corrupted data
    }
    setLoading(false); // Done checking
  }, []);

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      const userData = await apiLogin(username, password);
      setUser(userData);
      localStorage.setItem('aiyamiddun_user', JSON.stringify(userData));
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setLoading(true);
    try {
      const newUser = await apiRegister(userData);
      setUser(newUser);
      localStorage.setItem('aiyamiddun_user', JSON.stringify(newUser));
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('aiyamiddun_user');
  };

  const value = {
    user,
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
