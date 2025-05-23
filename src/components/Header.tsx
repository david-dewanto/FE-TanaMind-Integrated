import React, { useState, useRef, useEffect } from 'react';
import { Menu, User, X, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { useAuth } from '../contexts/AuthContext';
import { NotificationDropdown } from './Notifications';
import { ServerHealthBadge } from './common';

interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, isSidebarOpen }) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleUserMenuToggle = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
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

  const handlePlantClick = (plantId: number) => {
    // Navigate to the plant or dashboard with plant details
    navigate(`/dashboard/plants?plant=${plantId}`);
  };

  const handleViewAllNotifications = () => {
    navigate('/dashboard/notifications');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 w-full z-50">
      <div className="max-w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left side - Sidebar toggle and Logo */}
        <div className="flex items-center min-w-0 flex-1">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0B9444] focus:ring-offset-2 transition-colors mr-3"
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div className="flex items-center min-w-0">
            <Logo className="h-8 sm:h-10" showText={true} linkTo="/dashboard" textClassName="hidden sm:inline-block ml-2 text-[#0B9444] text-xl font-bold" />
          </div>
        </div>

        {/* Right side - AI Status, Notifications and User menu */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <ServerHealthBadge 
            onClick={() => navigate('/dashboard/analytics')}
          />
          
          <NotificationDropdown
            onPlantClick={handlePlantClick}
            onViewAll={handleViewAllNotifications}
          />

          <div className="w-px h-6 bg-gray-300 hidden sm:block"></div>

          <div className="relative" ref={userMenuRef}>
            <button 
              onClick={handleUserMenuToggle}
              className="flex items-center space-x-2 text-[#056526] hover:text-[#0B9444] focus:outline-none focus:ring-2 focus:ring-[#0B9444] focus:ring-offset-2 p-2 rounded-lg hover:bg-[#DFF3E2] transition-colors"
            >
              <div className="w-8 h-8 bg-[#0B9444] rounded-full flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              <span className="text-sm font-medium hidden sm:inline-block max-w-24 truncate">
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