import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/Logo';
import { ErrorMessage, LoadingSpinner } from '../components/common';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { login, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    let isValid = true;
    
    // Clear previous errors
    setEmailError('');
    setPasswordError('');
    clearError();
    
    // Validate email
    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    }
    
    // Validate password
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    }
    
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      // If login succeeds, then the email is verified and we received a token
      // The AuthContext.login function will store the token and set the user
      await login({ username_or_email: email, password });
      
      // Navigate to the dashboard after successful login
      navigate('/');
    } catch (err) {
      // All errors (including verification errors) are handled in the AuthContext
      // and will be displayed via the error state from useAuth()
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex flex-col items-center justify-center mb-8">
          <Logo className="h-12 w-auto" />
          <h1 className="text-[#056526] font-bold text-2xl mt-2">TanaMind</h1>
          <p className="text-gray-600 mt-1">Sign in to manage your plants</p>
        </div>
        
        {error && (
          <ErrorMessage 
            message={error}
            type="error"
            onDismiss={clearError}
            className="mb-4"
          />
        )}
        
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={18} className="text-gray-400" />
              </div>
              <input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`pl-10 pr-3 py-2 w-full border ${emailError ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-[#39B54A] focus:border-transparent`}
                placeholder="your@email.com"
              />
            </div>
            {emailError && <ErrorMessage message={emailError} type="error" minimal className="mt-1" />}
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <Link to="/forgot-password" className="text-sm text-[#0B9444] hover:text-[#056526]">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-400" />
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`pl-10 pr-3 py-2 w-full border ${passwordError ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-[#39B54A] focus:border-transparent`}
                placeholder="••••••••"
              />
            </div>
            {passwordError && <ErrorMessage message={passwordError} type="error" minimal className="mt-1" />}
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#0B9444] hover:bg-[#056526] text-white font-medium py-2 rounded-md flex items-center justify-center transition-colors"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="small" className="mr-2" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn size={18} className="mr-2" />
                Sign In
              </>
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#0B9444] hover:text-[#056526] font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;