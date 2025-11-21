import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User, AuthResponse } from '../services/authService';
import { APIError } from '../services/apiClient';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user on mount if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (authService.isAuthenticated()) {
        try {
          const response = await authService.getProfile();
          setUser(response.data.user);
        } catch (err) {
          // Token might be expired, clear it
          authService.logout();
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await authService.login(email, password);
      setUser(response.data.user);
    } catch (err) {
      if (err instanceof APIError) {
        setError(err.message);
      } else {
        setError('An error occurred during login');
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await authService.register(email, password, name);
      setUser(response.data.user);
    } catch (err) {
      if (err instanceof APIError) {
        setError(err.message);
      } else {
        setError('An error occurred during registration');
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setError(null);
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        error,
        clearError,
      }}
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
