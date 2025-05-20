import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components/common';

interface FormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading: authLoading, error: authError, clearError } = useAuth();
  
  // Get the page the user was trying to access
  const from = location.state?.from?.pathname || "/dashboard";
  
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
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
    
    // Basic email validation
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
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        setIsLoading(true);
        
        // Use the AuthContext login function which interacts with the backend
        await login({ 
          username_or_email: formData.email, 
          password: formData.password,
          rememberMe: formData.rememberMe
        });
        
        // If login is successful, navigate to the originally requested page or dashboard
        // The auth context will handle token storage
        navigate(from);
      } catch (error) {
        // Error is handled in AuthContext
        console.error('Login error:', error);
        
        // If AuthContext didn't set an error, set a general one
        if (!authError) {
          setErrors({
            general: 'Failed to sign in. Please check your credentials and try again.'
          });
        }
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const passwordStrength = () => {
    if (!formData.password) return { text: '', class: '' };
    
    const strength = {
      weak: { text: 'Weak', class: 'text-red-500' },
      medium: { text: 'Medium', class: 'text-yellow-500' },
      strong: { text: 'Strong', class: 'text-green-500' },
    };
    
    if (formData.password.length < 8) return strength.weak;
    
    const hasLower = /[a-z]/.test(formData.password);
    const hasUpper = /[A-Z]/.test(formData.password);
    const hasNumber = /\d/.test(formData.password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password);
    
    const score = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
    
    if (score <= 2) return strength.weak;
    if (score === 3) return strength.medium;
    return strength.strong;
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
              <h1 className="text-2xl font-bold text-gray-900 mt-4">Welcome back</h1>
              <p className="text-gray-600 mt-2">Sign in to your account</p>
            </div>
            
            {(errors.general || authError) && (
              <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-800 rounded-lg flex items-start">
                <AlertCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
                <span>{errors.general || authError}</span>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
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
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-sm font-medium text-[#0B9444] hover:text-[#056526]">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
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
                {formData.password && (
                  <p className={`mt-1 text-sm ${passwordStrength().class}`}>
                    Password strength: {passwordStrength().text}
                  </p>
                )}
                {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
              </div>
              
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-[#0B9444] focus:ring-[#0B9444] border-gray-300 rounded"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
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
                      <span className="ml-2">Signing in...</span>
                    </div>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </div>
            </form>
            
            <p className="mt-8 text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium text-[#0B9444] hover:text-[#056526]">
                Sign up
              </Link>
            </p>
          </div>
        </div>
        
        <div className="hidden lg:block relative w-0 flex-1">
          <img
            className="absolute inset-0 h-full w-full object-cover"
            src="https://images.pexels.com/photos/3076899/pexels-photo-3076899.jpeg"
            alt="Plants in a modern home"
          />
        </div>
      </div>
    </div>
  );
};

export default SignIn;