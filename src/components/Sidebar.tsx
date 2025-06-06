import React from 'react';
import { 
  Home, 
  FlowerIcon, 
  BarChart2, 
  Droplets, 
  Bell, 
  BookOpen,
  X
} from 'lucide-react';
import Logo from './Logo';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  
  const navItems = [
    { name: 'Dashboard', icon: <Home size={20} />, path: '/dashboard' },
    { name: 'My Plants', icon: <FlowerIcon size={20} />, path: '/dashboard/plants' },
    { name: 'Watering Schedule', icon: <Droplets size={20} />, path: '/dashboard/schedule' },
    { name: 'AI Analytics', icon: <BarChart2 size={20} />, path: '/dashboard/analytics' },
    { name: 'Notifications', icon: <Bell size={20} />, path: '/dashboard/notifications' },
    { name: 'Articles', icon: <BookOpen size={20} />, path: '/dashboard/articles' },
  ];

  return (
    <aside 
      className={`fixed top-0 bottom-0 left-0 z-30 w-64 bg-white shadow-lg transform pt-16 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out`}
    >
      {/* Hidden logo - removed to prevent duplicate logos */}

      <div className="p-5">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-[#056526]">Menu</h2>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center px-3 py-3 rounded-md text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? 'bg-[#DFF3E2] text-[#056526]' 
                  : 'text-gray-600 hover:bg-[#DFF3E2] hover:text-[#056526]'
              }`}
            >
              <span className={location.pathname === item.path ? 'text-[#0B9444]' : 'text-gray-500'}>
                {item.icon}
              </span>
              <span className="ml-3">{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
        <div className="bg-[#DFF3E2] rounded-lg p-4">
          <p className="text-[#056526] text-sm font-medium">Need help with your plants?</p>
          <p className="text-[#4D4D4D] text-xs mt-1">Explore our plant articles for tips and tricks.</p>
          <Link
            to="/dashboard/articles"
            className="mt-3 block w-full bg-[#0B9444] text-white text-center text-xs font-medium py-2 rounded-md hover:bg-[#056526] transition-colors"
          >
            Read Articles
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;