import React, { useState, useRef, useEffect } from 'react';
import { Bell, Menu, User, X, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, isSidebarOpen }) => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

  const handleNotificationToggle = () => {
    setIsNotificationOpen(!isNotificationOpen);
    if (isUserMenuOpen) setIsUserMenuOpen(false);
  };

  const handleUserMenuToggle = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
    if (isNotificationOpen) setIsNotificationOpen(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm z-20 sticky top-0 left-0 right-0 w-full">
      <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between h-[56px]">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="text-gray-700 mr-4 focus:outline-none"
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="flex items-center">
            <Logo className="h-10" showText={true} linkTo="/landing" />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative" ref={notificationRef}>
            <button
              onClick={handleNotificationToggle}
              className="p-2 rounded-full hover:bg-[#DFF3E2] text-[#056526] focus:outline-none"
              aria-label="View notifications"
            >
              <Bell size={20} />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
            </button>

            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <h3 className="text-sm font-medium text-gray-700">Notifications</h3>
                </div>
                <div className="p-6 text-center">
                  <div className="rounded-full bg-[#DFF3E2] p-4 inline-flex mb-3 mx-auto">
                    <Bell size={24} className="text-[#0B9444]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Coming Soon!</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Real-time plant notifications will be available in the next update.
                  </p>
                  <Link 
                    to="/dashboard/notifications" 
                    className="text-sm bg-[#0B9444] text-white px-4 py-2 rounded-lg hover:bg-[#056526] transition-colors inline-block"
                  >
                    Preview Features
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="w-px h-6 bg-gray-200"></div>

          <div className="relative" ref={userMenuRef}>
            <button 
              onClick={handleUserMenuToggle}
              className="flex items-center space-x-2 text-[#056526] hover:text-[#0B9444] focus:outline-none p-2 rounded-full hover:bg-[#DFF3E2]"
            >
              <User size={20} />
              <span className="text-sm font-medium hidden sm:inline-block">
                {user?.username || 'User'}
              </span>
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <LogOut size={16} className="mr-2" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;