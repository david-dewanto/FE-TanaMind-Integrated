/**
 * Authentication service for user login, registration, and session management
 */
import { get, post } from './client';

// Types
export interface User {
  email: string;
  username: string;
  is_verified: boolean;
}

export interface LoginRequest {
  username_or_email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  email: string;
  username: string;
  is_verified: boolean;
}

/**
 * Login a user with username/email and password
 */
export const login = async (credentials: LoginRequest): Promise<User> => {
  try {
    console.log('Login attempt with:', JSON.stringify(credentials));
    const response = await post<LoginResponse>('/auth/login', credentials, undefined, false);
    
    // Store the token in localStorage for future authenticated requests
    if (response && response.access_token) {
      console.log('Login successful, storing token');
      localStorage.setItem('token', response.access_token);
      
      // Now fetch the user profile with the token
      try {
        // Use get directly instead of getCurrentUser to avoid circular dependency
        const user = await get<User>('/auth/me');
        return user;
      } catch (profileError) {
        console.error('Error fetching user profile after login:', profileError);
        // Return a minimal user object if we can't get the profile
        // This is a fallback to allow login to succeed even if profile fetch fails
        return {
          username: credentials.username_or_email.includes('@') ? 
                    credentials.username_or_email.split('@')[0] : 
                    credentials.username_or_email,
          email: credentials.username_or_email.includes('@') ? 
                 credentials.username_or_email : 
                 `${credentials.username_or_email}@example.com`,
          is_verified: false
        };
      }
    } else {
      console.error('Login failed: No token in response', response);
      throw new Error('Invalid response from server');
    }
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

/**
 * Register a new user account
 */
export const register = async (userData: RegisterRequest): Promise<RegisterResponse> => {
  try {
    const response = await post<RegisterResponse>('/auth/register', userData, undefined, false);
    console.log('Registration successful, returning response', response);
    return response;
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
};

/**
 * Logout the current user
 */
export const logout = async (): Promise<void> => {
  try {
    await post<void>('/auth/logout');
    localStorage.removeItem('token');
  } catch (error) {
    console.error('Logout failed:', error);
    // Still remove the token even if the API call fails
    localStorage.removeItem('token');
  }
};

/**
 * Get the current logged-in user's profile
 */
export const getCurrentUser = async (): Promise<User> => {
  try {
    return await get<User>('/auth/me');
  } catch (error) {
    console.error('Failed to get current user:', error);
    throw error;
  }
};

/**
 * Request a password reset for a user
 */
export const forgotPassword = async (usernameOrEmail: string): Promise<void> => {
  try {
    await post<void>('/auth/forgot-password', { username_or_email: usernameOrEmail }, undefined, false);
  } catch (error) {
    console.error('Password reset request failed:', error);
    throw error;
  }
};

/**
 * Reset a user's password with a reset token
 */
export const resetPassword = async (token: string, password: string): Promise<void> => {
  try {
    await post<void>('/auth/reset-password', { token, password }, undefined, false);
  } catch (error) {
    console.error('Password reset failed:', error);
    throw error;
  }
};

/**
 * Check if a user is currently logged in
 */
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  
  // Here you could also add JWT token expiration check if needed
  try {
    // Simple check that the token looks like a JWT
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('Invalid token format, logging out');
      localStorage.removeItem('token');
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error checking authentication token:', error);
    localStorage.removeItem('token');
    return false;
  }
};

/**
 * Check if current user's email is verified
 * This should be used after getCurrentUser to get the actual user object
 */
export const isEmailVerified = (user: User | null): boolean => {
  return !!user?.is_verified;
};