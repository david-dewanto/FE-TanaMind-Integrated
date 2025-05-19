import React from 'react';
import { Link } from 'react-router-dom';
import { Droplets, BarChart3, Calendar, BookOpen, Wifi } from 'lucide-react';
import Logo from '../components/Logo';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white bg-opacity-90 text-gray-800 shadow-sm fixed top-0 left-0 right-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <nav className="flex justify-between items-center">
            <div className="flex items-center">
              <Link to="/landing">
                <Logo showText={true} className="h-10" textClassName="ml-2 text-[#0B9444] text-xl font-bold" />
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="hover:text-[#0B9444] transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-[#0B9444] transition-colors">How It Works</a>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/signin" className="text-gray-700 hover:text-[#0B9444] transition-colors">Sign In</Link>
              <Link to="/signup" className="bg-[#0B9444] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#056526] transition-colors">
                Sign Up
              </Link>
            </div>
          </nav>
        </div>
      </header>
      
      {/* Spacer for fixed header */}
      <div className="h-20"></div>

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-[#0B9444] to-[#42B883] text-white py-20">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-10 md:mb-0">
                <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                  Smart Plant Care at Your Fingertips
                </h1>
                <p className="text-xl mb-8 text-green-100">
                  Monitor your plants with real-time data, automatic watering schedules, and personalized care recommendations.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/signup" className="bg-white text-[#0B9444] px-6 py-3 rounded-lg font-semibold text-center hover:bg-green-100 transition-colors">
                    Get Started
                  </Link>
                  <a href="#how-it-works" className="border border-white text-white px-6 py-3 rounded-lg font-semibold text-center hover:bg-white hover:bg-opacity-10 transition-colors">
                    Learn More
                  </a>
                </div>
              </div>
              <div className="md:w-1/2 flex justify-center">
                <div className="relative w-full max-w-md">
                  <div className="rounded-xl overflow-hidden shadow-2xl">
                    <img 
                      src="https://images.pexels.com/photos/2132227/pexels-photo-2132227.jpeg" 
                      alt="Smart Plant Monitoring" 
                      className="w-full"
                    />
                  </div>
                  <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg">
                    <div className="flex items-center space-x-2">
                      <Droplets size={24} className="text-blue-500" />
                      <div>
                        <p className="font-semibold text-gray-800">Soil Moisture</p>
                        <p className="text-[#0B9444] font-bold">65% - Optimal</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Smart Features</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-[#E7F7EF] p-6 rounded-xl">
                <div className="bg-[#0B9444] inline-block p-3 rounded-lg text-white mb-4">
                  <Droplets size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Smart Watering</h3>
                <p className="text-gray-600">
                  Automated watering system with customizable schedules and manual override options.
                </p>
              </div>
              
              <div className="bg-[#E7F7EF] p-6 rounded-xl">
                <div className="bg-[#0B9444] inline-block p-3 rounded-lg text-white mb-4">
                  <BarChart3 size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Sensor Monitoring</h3>
                <p className="text-gray-600">
                  Monitor soil moisture, temperature, air humidity, and light levels in real-time.
                </p>
              </div>
              
              <div className="bg-[#E7F7EF] p-6 rounded-xl">
                <div className="bg-[#0B9444] inline-block p-3 rounded-lg text-white mb-4">
                  <Calendar size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Plant Health Tracking</h3>
                <p className="text-gray-600">
                  Track plant health status and receive alerts when plants need attention.
                </p>
              </div>
              
              <div className="bg-[#E7F7EF] p-6 rounded-xl">
                <div className="bg-[#0B9444] inline-block p-3 rounded-lg text-white mb-4">
                  <BookOpen size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Plant Management</h3>
                <p className="text-gray-600">
                  Track plant details, care requirements, and customize optimal growing conditions.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* How It Works */}
        <section id="how-it-works" className="py-20 bg-gray-50">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">How It Works</h2>
            
            <div className="flex flex-col md:flex-row items-center mb-12">
              <div className="md:w-1/2 mb-8 md:mb-0">
                <div className="rounded-xl overflow-hidden shadow-lg max-w-md mx-auto">
                  <img 
                    src="https://images.pexels.com/photos/1094651/pexels-photo-1094651.jpeg" 
                    alt="Plant sensor setup" 
                    className="w-full"
                  />
                </div>
              </div>
              <div className="md:w-1/2 md:pl-12">
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <h3 className="text-2xl font-semibold text-[#0B9444] mb-4">1. Connect Your Device</h3>
                  <p className="text-gray-600 mb-4">
                    Setup is simple! Plug in your TanaMind sensor, connect to WiFi, and pair with our app in minutes.
                  </p>
                  <div className="flex items-center text-gray-500">
                    <Wifi size={20} className="mr-2" />
                    <span>Automatic WiFi configuration</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row-reverse items-center mb-12">
              <div className="md:w-1/2 mb-8 md:mb-0">
                <div className="rounded-xl overflow-hidden shadow-lg max-w-md mx-auto">
                  <img 
                    src="https://images.pexels.com/photos/5082567/pexels-photo-5082567.jpeg" 
                    alt="Mobile app dashboard" 
                    className="w-full"
                  />
                </div>
              </div>
              <div className="md:w-1/2 md:pr-12">
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <h3 className="text-2xl font-semibold text-[#0B9444] mb-4">2. Monitor Your Plants</h3>
                  <p className="text-gray-600 mb-4">
                    Track soil moisture, light levels, temperature, and humidity in real-time through our intuitive dashboard.
                  </p>
                  <div className="flex items-center text-gray-500">
                    <BarChart3 size={20} className="mr-2" />
                    <span>Real-time data visualization</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-8 md:mb-0">
                <div className="rounded-xl overflow-hidden shadow-lg max-w-md mx-auto">
                  <img 
                    src="https://images.pexels.com/photos/6208087/pexels-photo-6208087.jpeg" 
                    alt="Automatic plant care" 
                    className="w-full"
                  />
                </div>
              </div>
              <div className="md:w-1/2 md:pl-12">
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <h3 className="text-2xl font-semibold text-[#0B9444] mb-4">3. Automate Plant Care</h3>
                  <p className="text-gray-600 mb-4">
                    Set watering schedules or let our smart system handle it. Receive notifications when your plants need attention.
                  </p>
                  <div className="flex items-center text-gray-500">
                    <Droplets size={20} className="mr-2" />
                    <span>Smart watering algorithms</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA */}
        <section className="py-20 bg-gradient-to-r from-[#056526] to-[#0B9444] text-white">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Plant Care?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Join thousands of plant enthusiasts who are using TanaMind to grow healthier, happier plants.
            </p>
            <Link 
              to="/signup" 
              className="bg-white text-[#0B9444] px-8 py-3 rounded-lg font-semibold inline-block hover:bg-green-100 transition-colors"
            >
              Get Started Today
            </Link>
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
                  <a href="/#features" onClick={(e) => { window.location.href = '/#features'; e.preventDefault(); }} className="hover:text-white transition-colors">Features</a>
                  <a href="/#how-it-works" onClick={(e) => { window.location.href = '/#how-it-works'; e.preventDefault(); }} className="hover:text-white transition-colors">How It Works</a>
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

export default LandingPage;