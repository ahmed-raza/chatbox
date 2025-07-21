"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Types
export interface User {
  id: number;
  email: string;
  name?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface AuthContextType {
  user: User | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  signup: (email: string, name: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  refreshToken: () => Promise<boolean>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!tokens;

  // Load tokens from localStorage on mount
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const storedTokens = localStorage.getItem('auth_tokens');
        if (storedTokens) {
          const parsedTokens: AuthTokens = JSON.parse(storedTokens);
          setTokens(parsedTokens);
          
          // Verify token and get user info
          const userInfo = await getCurrentUser(parsedTokens.access_token);
          if (userInfo) {
            setUser(userInfo);
          } else {
            // Token might be expired, try to refresh
            const refreshed = await refreshTokens(parsedTokens.refresh_token);
            if (!refreshed) {
              // Refresh failed, clear stored tokens
              localStorage.removeItem('auth_tokens');
              setTokens(null);
            }
          }
        }
      } catch (error) {
        console.error('Error loading stored auth:', error);
        localStorage.removeItem('auth_tokens');
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredAuth();
  }, []);

  // Save tokens to localStorage whenever they change
  useEffect(() => {
    if (tokens) {
      localStorage.setItem('auth_tokens', JSON.stringify(tokens));
    } else {
      localStorage.removeItem('auth_tokens');
    }
  }, [tokens]);

  // API helper function
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'An error occurred' }));
      throw new Error(errorData.detail || 'An error occurred');
    }

    return response.json();
  };

  // Get current user info
  const getCurrentUser = async (accessToken: string): Promise<User | null> => {
    try {
      const userData = await apiCall('/auth/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return userData;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  };

  // Refresh tokens
  const refreshTokens = async (refreshToken: string): Promise<boolean> => {
    try {
      const response = await apiCall('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      setTokens(response);
      
      // Get updated user info
      const userInfo = await getCurrentUser(response.access_token);
      if (userInfo) {
        setUser(userInfo);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const response = await apiCall('/auth/signin', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      setUser(response.user);
      setTokens(response.tokens);

      return { success: true, message: 'Login successful' };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Login failed' };
    }
  };

  // Signup function
  const signup = async (email: string, name: string, password: string) => {
    try {
      const response = await apiCall('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, name, password }),
      });

      setUser(response.user);
      setTokens(response.tokens);

      return { success: true, message: 'Account created successfully' };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Signup failed' };
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setTokens(null);
    localStorage.removeItem('auth_tokens');
  };

  // Forgot password function
  const forgotPassword = async (email: string) => {
    try {
      const response = await apiCall('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      return { success: true, message: response.message };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Failed to send reset email' };
    }
  };

  // Reset password function
  const resetPassword = async (token: string, newPassword: string) => {
    try {
      const response = await apiCall('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, new_password: newPassword }),
      });

      return { success: true, message: response.message };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Failed to reset password' };
    }
  };

  // Change password function
  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      if (!tokens) {
        throw new Error('Not authenticated');
      }

      const response = await apiCall('/auth/change-password', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });

      return { success: true, message: response.message };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Failed to change password' };
    }
  };

  // Refresh token function
  const refreshToken = async (): Promise<boolean> => {
    if (!tokens) return false;
    return refreshTokens(tokens.refresh_token);
  };

  const value: AuthContextType = {
    user,
    tokens,
    isLoading,
    isAuthenticated,
    login,
    signup,
    logout,
    forgotPassword,
    resetPassword,
    changePassword,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
