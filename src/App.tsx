import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Plants from './pages/Plants';
import Schedule from './pages/Schedule';
import Analytics from './pages/Analytics';
import Notifications from './pages/Notifications';
import Help from './pages/Help';
import ArticleDetail from './pages/ArticleDetail';
import Login from './pages/Login';
import SignIn from './pages/SignIn';
import Register from './pages/Register';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import LandingPage from './pages/LandingPage';
import ComingSoon from './pages/ComingSoon';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import AuthRedirect from './components/AuthRedirect';
import { AuthProvider } from './contexts/AuthContext';
import { PlantProvider } from './contexts/PlantContext';
import { SensorProvider } from './contexts/SensorContext';

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Root route - redirects based on authentication state */}
          <Route path="/" element={
            <AuthRedirect />
          } />
          <Route 
            path="/landing" 
            element={
              <PublicRoute>
                <LandingPage />
              </PublicRoute>
            } 
          />
          
          {/* Auth Routes - New UI */}
          <Route 
            path="/signin" 
            element={
              <PublicRoute>
                <SignIn />
              </PublicRoute>
            } 
          />
          <Route 
            path="/signup" 
            element={
              <PublicRoute>
                <SignUp />
              </PublicRoute>
            } 
          />
          
          {/* Auth Routes - Legacy paths redirected to new UI */}
          <Route path="/login" element={<Navigate to="/signin" replace />} />
          <Route path="/register" element={<Navigate to="/signup" replace />} />
          <Route 
            path="/forgot-password" 
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            } 
          />
          <Route 
            path="/reset-password" 
            element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            } 
          />
          
          {/* Coming Soon Pages - show to unauthenticated users only */}
          <Route path="/about-us" element={<PublicRoute><ComingSoon /></PublicRoute>} />
          <Route path="/blog" element={<PublicRoute><ComingSoon /></PublicRoute>} />
          <Route path="/contact" element={<PublicRoute><ComingSoon /></PublicRoute>} />
          <Route path="/privacy-policy" element={<PublicRoute><ComingSoon /></PublicRoute>} />
          <Route path="/terms-of-service" element={<PublicRoute><ComingSoon /></PublicRoute>} />
          <Route path="/help-center" element={<PublicRoute><ComingSoon /></PublicRoute>} />
          
          {/* Protected App Routes */}
          <Route 
            path="/dashboard/*" 
            element={
              <PrivateRoute>
                <PlantProvider>
                  <SensorProvider>
                    <div className="min-h-screen bg-gray-100 flex flex-col">
                      <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
                      
                      <div className="flex flex-1 relative">
                        {/* Overlay that appears when sidebar is open */}
                        {isSidebarOpen && (
                          <div 
                            className="fixed inset-0 bg-black bg-opacity-25 z-40 transition-opacity duration-300"
                            onClick={toggleSidebar}
                          ></div>
                        )}
                        
                        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
                        
                        <main className="flex-1 transition-all duration-300">
                          <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/plants" element={<Plants />} />
                            <Route path="/schedule" element={<Schedule />} />
                            <Route path="/analytics" element={<Analytics />} />
                            <Route path="/notifications" element={<Notifications />} />
                            <Route path="/articles" element={<Help />} />
                            <Route path="/articles/:slug" element={<ArticleDetail />} />
                            <Route path="*" element={<Navigate to="/dashboard" replace />} />
                          </Routes>
                        </main>
                      </div>
                    </div>
                  </SensorProvider>
                </PlantProvider>
              </PrivateRoute>
            }
          />
          
          {/* Catch-all route - redirect users based on authentication state */}
          <Route path="*" element={<AuthRedirect />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;