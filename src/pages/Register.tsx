import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/Logo';
import { ErrorMessage, LoadingSpinner, ButtonSpinner } from '../components/common';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { register, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();


  const validateForm = (): boolean => {
    let isValid = true;
    
    // Clear previous errors
    setUsernameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    clearError();
    
    // Validate username
    if (!username.trim()) {
      setUsernameError('Username is required');
      isValid = false;
    } else if (username.length < 3) {
      setUsernameError('Username must be at least 3 characters long');
      isValid = false;
    }
    
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
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      isValid = false;
    }
    
    // Validate confirm password
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    }
    
    return isValid;
  };

  // State to track if registration was successful and verification is needed
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  // State to store the registered email for resending verification
  const [registeredEmail, setRegisteredEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      // Convert email to lowercase before sending to the backend
      const emailLowercase = email.toLowerCase();
      
      await register({ username, email: emailLowercase, password });
      // After successful registration, show verification message
      setRegistrationSuccess(true);
      
      // Save the email for potential resend verification
      setRegisteredEmail(emailLowercase);
      
      // Clear form for security
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      
      // Don't navigate - user needs to verify email
    } catch (err) {
      // Error is handled in the AuthContext
      console.error('Registration failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex flex-col items-center justify-center mb-8">
          <Logo className="h-12" showText={true} textClassName="text-[#056526] font-bold text-2xl ml-3" linkTo="/" />
          <p className="text-gray-600 mt-3">Create a new account</p>
        </div>
        
        {error && (
          <ErrorMessage 
            message={error}
            type="error"
            onDismiss={clearError}
            className="mb-4"
          />
        )}
        
        {registrationSuccess ? (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Check Your Email</h2>
            <p className="text-gray-600 mb-6">
              We've sent a verification link to <strong>{registeredEmail}</strong>. 
              Please check your inbox and click the link to verify your account before signing in.
            </p>
            
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <strong>Important:</strong> You must verify your email address before you can sign in to your account.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-[#0B9444] hover:bg-[#056526] text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Continue to Sign In
              </button>
              
              <p className="text-sm text-gray-500">
                Didn't receive the email? Check your spam folder or{' '}
                <button 
                  onClick={() => {
                    setRegistrationSuccess(false);
                    setEmail(registeredEmail);
                    setUsername('');
                    setPassword('');
                    setConfirmPassword('');
                  }}
                  className="text-[#0B9444] hover:text-[#056526] font-medium"
                >
                  try again
                </button>
              </p>
            </div>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={18} className="text-gray-400" />
                  </div>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`pl-10 pr-3 py-2 w-full border ${usernameError ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-[#39B54A] focus:border-transparent`}
                    placeholder="your_username"
                  />
                </div>
                {usernameError && <ErrorMessage message={usernameError} type="error" minimal className="mt-1" />}
              </div>
              
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
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`pl-10 pr-10 py-2 w-full border ${passwordError ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-[#39B54A] focus:border-transparent`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff size={18} className="text-gray-400 hover:text-gray-500" />
                    ) : (
                      <Eye size={18} className="text-gray-400 hover:text-gray-500" />
                    )}
                  </button>
                </div>
                {password && password.length < 8 && (
                  <p className="mt-1 text-sm text-red-500">
                    Password must be at least 8 characters
                  </p>
                )}
                {passwordError && <ErrorMessage message={passwordError} type="error" minimal className="mt-1" />}
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`pl-10 pr-10 py-2 w-full border ${confirmPasswordError ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-[#39B54A] focus:border-transparent`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} className="text-gray-400 hover:text-gray-500" />
                    ) : (
                      <Eye size={18} className="text-gray-400 hover:text-gray-500" />
                    )}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">
                    Passwords do not match
                  </p>
                )}
                {confirmPasswordError && <ErrorMessage message={confirmPasswordError} type="error" minimal className="mt-1" />}
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#0B9444] hover:bg-[#056526] text-white font-medium py-2 rounded-md flex items-center justify-center transition-colors"
              >
                {isLoading ? (
                  <ButtonSpinner text="Creating Account..." />
                ) : (
                  'Create Account'
                )}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-[#0B9444] hover:text-[#056526] font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Register;