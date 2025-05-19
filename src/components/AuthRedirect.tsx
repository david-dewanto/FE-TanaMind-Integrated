import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Component that redirects based on authentication state
 * - Redirects to /dashboard if user is authenticated
 * - Redirects to /landing if user is not authenticated
 */
const AuthRedirect: React.FC = () => {
  const { user, isLoading } = useAuth();

  // If authentication is still being determined, show a loading spinner
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0B9444]"></div>
      </div>
    );
  }

  // Redirect based on authentication state
  return user 
    ? <Navigate to="/dashboard" replace /> 
    : <Navigate to="/landing" replace />;
};

export default AuthRedirect;