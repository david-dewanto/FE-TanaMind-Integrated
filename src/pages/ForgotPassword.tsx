import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import Logo from '../components/Logo';
import { ButtonSpinner } from '../components/common';
import { auth } from '../api';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const validateForm = (): boolean => {
    let isValid = true;
    
    // Clear previous error
    setEmailError('');
    setError(null);
    
    // Validate email
    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email address');
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
      setIsLoading(true);
      setError(null);
      
      // Convert email to lowercase before sending to the backend
      const emailLowercase = email.toLowerCase();
      
      // Call the forgotPassword function from auth
      await auth.forgotPassword(emailLowercase);
      
      // Mark as success to show success message
      setIsSuccess(true);
    } catch (err) {
      // For security reasons, we don't want to reveal whether the email exists,
      // so in a production environment, we might still show success message
      // But for development, we'll show the error
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/landing" className="inline-flex items-center justify-center">
            <Logo showText={true} className="h-12" textClassName="ml-2 text-[#0B9444] text-2xl font-bold" />
          </Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>
        
        {isSuccess ? (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Password reset email sent
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>
                    If an account exists for {email}, you will receive an email with instructions to reset your password.
                  </p>
                </div>
                <div className="mt-4">
                  <Link
                    to="/signin"
                    className="inline-flex items-center text-sm font-medium text-green-700 hover:text-green-600"
                  >
                    <ArrowLeft size={16} className="mr-2" />
                    Return to sign in
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`block w-full pl-10 pr-3 py-2 border ${
                    emailError ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B9444] focus:border-transparent`}
                  placeholder="you@example.com"
                />
              </div>
              {emailError && (
                <div className="mt-2 flex items-center text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                  <span>{emailError}</span>
                </div>
              )}
            </div>
            
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0B9444] hover:bg-[#056526] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0B9444] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <ButtonSpinner text="Sending..." />
                ) : (
                  'Send reset link'
                )}
              </button>
            </div>
            
            <div className="text-center">
              <Link
                to="/signin"
                className="inline-flex items-center font-medium text-[#0B9444] hover:text-[#056526]"
              >
                <ArrowLeft size={16} className="mr-2" />
                Back to sign in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;