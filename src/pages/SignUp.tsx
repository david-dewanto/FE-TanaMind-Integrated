import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components/common';

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  agreeToTerms?: string;
  general?: string;
}

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading: authLoading, error: authError, clearError } = useAuth();
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(() => {
    const saved = sessionStorage.getItem('registrationSuccess');
    return saved === 'true';
  });
  const [registeredEmail, setRegisteredEmail] = useState(() => {
    return sessionStorage.getItem('registeredEmail') || '';
  });
  
  // Debug effect to track state changes
  React.useEffect(() => {
    console.log('State update - registrationSuccess:', registrationSuccess, 'registeredEmail:', registeredEmail);
  }, [registrationSuccess, registeredEmail]);

  // Debug effect to track auth context changes
  React.useEffect(() => {
    console.log('Auth context update - isLoading:', authLoading, 'error:', authError);
  }, [authLoading, authError]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error when user types
    if (errors[name as keyof FormErrors]) {
      setErrors({
        ...errors,
        [name]: undefined
      });
    }
    
    // Clear auth error if there is one
    if (authError) {
      clearError();
    }
  };
  
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // Terms agreement
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        setIsLoading(true);
        console.log('Starting registration process...');
        
        // Use the AuthContext register function to create a new account
        const result = await register({
          username: formData.name,
          email: formData.email,
          password: formData.password
        });
        
        console.log('Registration result:', result);
        console.log('Registration completed successfully, showing verification page');
        
        // If registration is successful, show verification success page
        try {
          console.log('Setting registration success state...');
          
          // Save to sessionStorage first to persist across re-renders
          sessionStorage.setItem('registrationSuccess', 'true');
          sessionStorage.setItem('registeredEmail', formData.email);
          
          // Then set component state
          setRegistrationSuccess(true);
          setRegisteredEmail(formData.email);
          console.log('Registration success state set to true');
          
          // Force a small delay to ensure state is set
          await new Promise(resolve => setTimeout(resolve, 100));
          console.log('State setting delay completed');
        } catch (stateError) {
          console.error('Error setting registration success state:', stateError);
        }
      } catch (error) {
        // Error is handled in AuthContext
        console.error('Registration error caught:', error);
        console.log('AuthContext error state:', authError);
        
        // If AuthContext didn't set an error, set a general one
        if (!authError) {
          setErrors({
            general: 'Failed to create account. Please try again.'
          });
        }
      } finally {
        setIsLoading(false);
        console.log('Registration loading state set to false');
      }
    } else {
      console.log('Form validation failed');
    }
  };
  
  
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1">
        <div className="w-full max-w-md mx-auto p-6 flex items-center justify-center">
          <div className="w-full">
            <div className="text-center mb-8">
              <Link to="/landing" className="inline-flex items-center">
                <Logo showText={true} className="h-12" textClassName="ml-2 text-[#0B9444] text-2xl font-bold" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 mt-4">Create an account</h1>
              <p className="text-gray-600 mt-2">Start monitoring your plants</p>
            </div>
            
            {(errors.general || authError) && (
              <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-800 rounded-lg flex items-start">
                <AlertCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
                <span>{errors.general || authError}</span>
              </div>
            )}
            
            {(() => {
              console.log('Render check - registrationSuccess:', registrationSuccess);
              return registrationSuccess;
            })() ? (
              <div className="w-full max-w-lg mx-auto text-center">
                {/* Success Icon */}
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                
                {/* Success Message */}
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Created!</h2>
                <p className="text-gray-600 mb-8">
                  Welcome to <span className="text-[#0B9444] font-semibold">TanaMind</span>
                </p>
                
                {/* Email Verification */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                  <div className="flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900">Verify Your Email</h3>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">
                    We sent a verification link to:
                  </p>
                  <p className="text-sm font-semibold text-blue-700 bg-white px-3 py-2 rounded border mb-4">
                    {registeredEmail}
                  </p>
                  <p className="text-xs text-gray-500">
                    Please check your email and click the link to verify your account before signing in.
                  </p>
                </div>
                
                {/* Action Button */}
                <button
                  onClick={() => {
                    sessionStorage.removeItem('registrationSuccess');
                    sessionStorage.removeItem('registeredEmail');
                    navigate('/signin');
                  }}
                  className="w-full bg-[#0B9444] hover:bg-[#056526] text-white font-medium py-3 px-4 rounded-lg transition-colors mb-4"
                >
                  Continue to Sign In
                </button>
                
                {/* Help Text */}
                <p className="text-xs text-gray-500">
                  Didn't receive the email?{' '}
                  <button 
                    onClick={() => {
                      sessionStorage.removeItem('registrationSuccess');
                      sessionStorage.removeItem('registeredEmail');
                      setRegistrationSuccess(false);
                      setFormData({ name: '', email: registeredEmail, password: '', confirmPassword: '', agreeToTerms: false });
                    }}
                    className="text-[#0B9444] hover:text-[#056526] underline"
                  >
                    Try again
                  </button>
                </p>
              </div>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={18} className="text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-3 py-2 border ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B9444] focus:border-transparent`}
                    placeholder="John Doe"
                  />
                </div>
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
              </div>
              
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
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-3 py-2 border ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B9444] focus:border-transparent`}
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
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
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-10 py-2 border ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B9444] focus:border-transparent`}
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
                {formData.password && formData.password.length < 8 && (
                  <p className="mt-1 text-sm text-red-500">
                    Password must be at least 8 characters
                  </p>
                )}
                {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-10 py-2 border ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B9444] focus:border-transparent`}
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
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">
                    Passwords do not match
                  </p>
                )}
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="agreeToTerms"
                    name="agreeToTerms"
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                    className={`h-4 w-4 text-[#0B9444] focus:ring-[#0B9444] border-gray-300 rounded ${
                      errors.agreeToTerms ? 'border-red-500' : ''
                    }`}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="agreeToTerms" className="font-medium text-gray-700">
                    I agree to the <Link to="/terms-of-service" className="text-[#0B9444]">Terms of Service</Link> and <Link to="/privacy-policy" className="text-[#0B9444]">Privacy Policy</Link>
                  </label>
                  {errors.agreeToTerms && <p className="mt-1 text-sm text-red-500">{errors.agreeToTerms}</p>}
                </div>
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={isLoading || authLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0B9444] hover:bg-[#056526] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0B9444] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading || authLoading ? (
                    <div className="flex items-center justify-center">
                      <LoadingSpinner size="small" />
                      <span className="ml-2">Creating account...</span>
                    </div>
                  ) : (
                    'Create account'
                  )}
                </button>
                </div>
                </form>
                
                <p className="mt-8 text-center text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link to="/signin" className="font-medium text-[#0B9444] hover:text-[#056526]">
                    Sign in
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
        
        <div className="hidden lg:block relative w-0 flex-1">
          <img
            className="absolute inset-0 h-full w-full object-cover"
            src="https://images.pexels.com/photos/1005058/pexels-photo-1005058.jpeg"
            alt="Collection of plants"
          />
        </div>
      </div>
    </div>
  );
};

export default SignUp;