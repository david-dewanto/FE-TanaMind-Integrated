import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, ArrowLeft, CheckCircle } from 'lucide-react';
import { auth } from '../api';
import { ButtonSpinner } from '../components/common';
import Logo from '../components/Logo';

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract token from URL
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get('token');

  const validateForm = (): boolean => {
    let isValid = true;
    
    // Clear previous errors
    setPasswordError('');
    setConfirmPasswordError('');
    setError(null);
    
    // Check if token exists
    if (!token) {
      setError('Invalid or missing reset token');
      isValid = false;
    }
    
    // Validate password
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      isValid = false;
    }
    
    // Validate confirm password
    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    }
    
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !token) {
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      await auth.resetPassword(token, password);
      setIsSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md text-center">
          <div className="mb-4 text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Invalid Reset Link</h2>
          <p className="text-gray-600 mb-6">The password reset link is invalid or has expired.</p>
          <Link 
            to="/forgot-password" 
            className="bg-[#0B9444] hover:bg-[#056526] text-white font-medium py-2 px-4 rounded-md transition-colors inline-block"
          >
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex flex-col items-center justify-center mb-8">
          <Logo className="h-12 w-auto" />
          <h1 className="text-[#056526] font-bold text-2xl mt-2">TanaMind</h1>
          <p className="text-gray-600 mt-1">Create a new password</p>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
            {error}
          </div>
        )}
        
        {isSuccess ? (
          <div className="text-center">
            <div className="mb-4 text-[#0B9444]">
              <CheckCircle size={48} className="mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Password Updated Successfully</h2>
            <p className="text-gray-600 mb-6">Your password has been reset. You'll be redirected to the login page shortly.</p>
            <Link 
              to="/login" 
              className="bg-[#0B9444] hover:bg-[#056526] text-white font-medium py-2 px-4 rounded-md transition-colors inline-block"
            >
              Go to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
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
                />
              </div>
              {passwordError && <p className="mt-1 text-sm text-red-600">{passwordError}</p>}
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`pl-10 pr-3 py-2 w-full border ${confirmPasswordError ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-[#39B54A] focus:border-transparent`}
                />
              </div>
              {confirmPasswordError && <p className="mt-1 text-sm text-red-600">{confirmPasswordError}</p>}
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0B9444] hover:bg-[#056526] text-white font-medium py-2 rounded-md flex items-center justify-center transition-colors"
            >
              {isLoading ? (
                <ButtonSpinner text="Updating Password..." />
              ) : (
                'Reset Password'
              )}
            </button>
            
            <div className="mt-4 text-center">
              <Link 
                to="/login" 
                className="inline-flex items-center text-[#0B9444] hover:text-[#056526] font-medium"
              >
                <ArrowLeft size={16} className="mr-2" />
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;