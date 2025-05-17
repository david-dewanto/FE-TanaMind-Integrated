import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Mail, ArrowLeft } from 'lucide-react';
import { auth } from '../api';
import Logo from '../components/Logo';

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
      
      await auth.forgotPassword(email);
      setIsSuccess(true);
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

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex flex-col items-center justify-center mb-8">
          <Logo className="h-12 w-auto" />
          <h1 className="text-[#056526] font-bold text-2xl mt-2">TanaMind</h1>
          <p className="text-gray-600 mt-1">Reset your password</p>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
            {error}
          </div>
        )}
        
        {isSuccess ? (
          <div className="text-center">
            <div className="bg-green-50 text-green-700 p-4 rounded-md mb-6">
              <p className="font-medium">Password Reset Email Sent</p>
              <p className="mt-1">Check your email for instructions to reset your password.</p>
            </div>
            
            <Link 
              to="/login" 
              className="inline-flex items-center text-[#0B9444] hover:text-[#056526] font-medium"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Login
            </Link>
          </div>
        ) : (
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
              {emailError && <p className="mt-1 text-sm text-red-600">{emailError}</p>}
            </div>
            
            <p className="text-sm text-gray-600">
              We'll send you an email with instructions to reset your password.
            </p>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0B9444] hover:bg-[#056526] text-white font-medium py-2 rounded-md flex items-center justify-center transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Reset Link'
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

export default ForgotPassword;