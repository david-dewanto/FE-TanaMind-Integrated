import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Clock, Droplets, BarChart3, Wifi } from 'lucide-react';
import Logo from '../components/Logo';

const ComingSoon: React.FC = () => {
  const location = useLocation();
  
  // Extract the page name from the URL path
  const getPageName = () => {
    // Remove leading and trailing slashes, then get the last segment
    const pathSegments = location.pathname.replace(/^\/|\/$/g, '').split('/');
    const pageName = pathSegments[pathSegments.length - 1];
    
    // Convert kebab-case or snake_case to Title Case with spaces
    return pageName
      .replace(/-|_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white bg-opacity-90 text-gray-800 shadow-sm fixed top-0 left-0 right-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <nav className="flex justify-between items-center">
            <div className="flex items-center">
              <a href="/landing" onClick={(e) => { window.location.href = '/landing'; e.preventDefault(); }}>
                <Logo showText={true} className="h-10" textClassName="ml-2 text-[#0B9444] text-xl font-bold" />
              </a>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <a href="/landing#features" onClick={(e) => { window.location.href = '/landing#features'; e.preventDefault(); }} className="hover:text-[#0B9444] transition-colors">Features</a>
              <a href="/landing#how-it-works" onClick={(e) => { window.location.href = '/landing#how-it-works'; e.preventDefault(); }} className="hover:text-[#0B9444] transition-colors">How It Works</a>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/signin" onClick={(e) => { window.location.href = '/signin'; e.preventDefault(); }} className="text-gray-700 hover:text-[#0B9444] transition-colors">Sign In</a>
              <a href="/signup" onClick={(e) => { window.location.href = '/signup'; e.preventDefault(); }} className="bg-[#0B9444] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#056526] transition-colors">
                Sign Up
              </a>
            </div>
          </nav>
        </div>
      </header>
      
      {/* Spacer for fixed header */}
      <div className="h-20"></div>

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-[#0B9444] to-[#42B883] text-white py-32">
          <div className="container mx-auto px-6">
            <div className="flex flex-col items-center text-center">
              <div className="mb-12">
                <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                  {getPageName()} Coming Soon
                </h1>
                <p className="text-xl mb-8 text-green-100 max-w-2xl mx-auto">
                  We're working hard to bring you an amazing {getPageName().toLowerCase()} experience. 
                  This page is currently under construction and will be available soon.
                </p>
                <div className="flex justify-center">
                  <a href="/landing" onClick={(e) => { window.location.href = '/landing'; e.preventDefault(); }} className="bg-white text-[#0B9444] px-6 py-3 rounded-lg font-semibold text-center hover:bg-green-100 transition-colors">
                    Return to Home
                  </a>
                </div>
              </div>
              <div className="relative">
                <div className="bg-white p-6 rounded-xl shadow-lg flex items-center max-w-md mx-auto">
                  <div className="bg-[#E7F7EF] rounded-full h-16 w-16 flex items-center justify-center mr-6">
                    <Clock size={36} className="text-[#0B9444]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">Stay Tuned</h3>
                    <p className="text-gray-600">We'll be launching this page very soon!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Preview Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">What to Expect</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-[#E7F7EF] p-6 rounded-xl">
                <div className="bg-[#0B9444] inline-block p-3 rounded-lg text-white mb-4">
                  <BarChart3 size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Enhanced Features</h3>
                <p className="text-gray-600">
                  We're building something special with advanced features to enhance your plant care experience.
                </p>
              </div>
              
              <div className="bg-[#E7F7EF] p-6 rounded-xl">
                <div className="bg-[#0B9444] inline-block p-3 rounded-lg text-white mb-4">
                  <Wifi size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Seamless Integration</h3>
                <p className="text-gray-600">
                  Connect with your existing TanaMind ecosystem for a unified experience.
                </p>
              </div>
              
              <div className="bg-[#E7F7EF] p-6 rounded-xl">
                <div className="bg-[#0B9444] inline-block p-3 rounded-lg text-white mb-4">
                  <Droplets size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">User-Focused Design</h3>
                <p className="text-gray-600">
                  Designed with you in mind, focusing on usability and accessibility.
                </p>
              </div>
            </div>
          </div>
        </section>
        
      </main>
      
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between mb-8">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center mb-4">
                <Logo showText={true} className="h-9" textClassName="ml-2 text-white text-lg font-bold" />
              </div>
              <p className="text-gray-400 max-w-xs">
                Smart plant monitoring system for the modern plant enthusiast.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Product</h3>
                <div className="flex flex-col space-y-2 text-gray-400">
                  <a href="/landing#features" onClick={(e) => { window.location.href = '/landing#features'; e.preventDefault(); }} className="hover:text-white transition-colors">Features</a>
                  <a href="/landing#how-it-works" onClick={(e) => { window.location.href = '/landing#how-it-works'; e.preventDefault(); }} className="hover:text-white transition-colors">How It Works</a>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Company</h3>
                <div className="flex flex-col space-y-2 text-gray-400">
                  <a href="/about-us" onClick={(e) => { window.location.href = '/about-us'; e.preventDefault(); }} className="hover:text-white transition-colors">About Us</a>
                  <a href="/blog" onClick={(e) => { window.location.href = '/blog'; e.preventDefault(); }} className="hover:text-white transition-colors">Blog</a>
                  <a href="/contact" onClick={(e) => { window.location.href = '/contact'; e.preventDefault(); }} className="hover:text-white transition-colors">Contact</a>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Support</h3>
                <div className="flex flex-col space-y-2 text-gray-400">
                  <a href="/help-center" onClick={(e) => { window.location.href = '/help-center'; e.preventDefault(); }} className="hover:text-white transition-colors">Help Center</a>
                  <a href="/privacy-policy" onClick={(e) => { window.location.href = '/privacy-policy'; e.preventDefault(); }} className="hover:text-white transition-colors">Privacy Policy</a>
                  <a href="/terms-of-service" onClick={(e) => { window.location.href = '/terms-of-service'; e.preventDefault(); }} className="hover:text-white transition-colors">Terms of Service</a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} TanaMind. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ComingSoon;