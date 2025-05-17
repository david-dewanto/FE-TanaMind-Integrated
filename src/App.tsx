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
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import PrivateRoute from './components/PrivateRoute';
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
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Protected App Routes */}
          <Route 
            path="/*" 
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
                            {/* Special route for analytics - completely isolated from context */}
                            <Route path="/analytics" element={<Analytics />} />
                            <Route path="/notifications" element={<Notifications />} />
                            <Route path="/articles" element={<Help />} />
                            <Route path="/articles/:slug" element={<ArticleDetail />} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                          </Routes>
                        </main>
                      </div>
                    </div>
                  </SensorProvider>
                </PlantProvider>
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;