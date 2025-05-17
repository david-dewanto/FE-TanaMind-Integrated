import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '../api';
import { User } from '../api/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: auth.LoginRequest) => Promise<void>;
  register: (userData: auth.RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

// Create the auth context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  clearError: () => {},
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Clear any error message
  const clearError = () => setError(null);

  // Function to get the current user
  const loadUser = async () => {
    if (!auth.isAuthenticated()) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const currentUser = await auth.getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      setError('Session expired. Please login again.');
      // Clear token if unable to get current user
      localStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (credentials: auth.LoginRequest) => {
    try {
      setIsLoading(true);
      clearError();
      const user = await auth.login(credentials);
      setUser(user);
    } catch (err) {
      // Handle specific error cases
      if (err instanceof Error) {
        // Set the error message to be displayed
        setError(err.message);
      } else {
        setError('An unknown error occurred during login');
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData: auth.RegisterRequest) => {
    try {
      setIsLoading(true);
      clearError();
      await auth.register(userData);
      // After successful registration, show success message to user
      // User needs to verify email before login
      // We'll return here and let the UI handle the notification
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred during registration');
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      clearError();
      await auth.logout();
      setUser(null);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred during logout');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Load user on mount and when token changes
  useEffect(() => {
    loadUser();
  }, []);

  // The context value
  const value = {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};