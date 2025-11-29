// frontend/src/context/AuthContext.tsx

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { apiLogin, apiRegister, apiFetchCurrentUser, UserProfile } from '@/lib/api';
import { saveToken, getToken, removeToken } from '@/lib/auth';

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
  login: (credentials: {username: string, password: string}) => Promise<void>;
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
  const [token, setToken] = useState<string | null>(getToken());
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const verifyUser = async () => {
      const currentToken = getToken();
      if (currentToken) {
        try {
          const { user } = await apiFetchCurrentUser();
          setUser(user);
          setToken(currentToken);
        } catch (error) {
          console.error("Session expired or token is invalid. Logging out.", error);
          removeToken();
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };
    verifyUser();
  }, []);

  const login = async (credentials: {username: string, password: string}) => {
    setLoading(true);
    try {
      const { token, user } = await apiLogin(credentials);
      setUser(user);
      setToken(token);
      saveToken(token);
      router.push('/dashboard'); // Redirect to dashboard on successful login
    } catch (error) {
        console.error('Login failed:', error);
        throw error; // Re-throw to be handled by the form
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setLoading(true);
    try {
        // apiRegister is designed to log the user in directly
      const { token, user } = await apiRegister(userData);
      setUser(user);
      setToken(token);
      saveToken(token);
      router.push('/dashboard'); // Redirect to dashboard on successful registration
    } catch (error) {
        console.error('Registration failed:', error);
        throw error; // Re-throw to be handled by the form
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    removeToken();
    router.push('/login'); // Redirect to login page on logout
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
      {!loading && children}
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
