import React from 'react';
import { Bell, Clock, Calendar, Construction, Sparkles } from 'lucide-react';

/**
 * Notifications Coming Soon Page
 * This is a placeholder component showing that the notifications feature is coming soon.
 * No mockup data is used - only a static UI.
 */
const Notifications: React.FC = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[#056526]">Notifications</h1>
          <p className="text-gray-600 mt-2">Stay updated with your plants' needs</p>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Green accent bar */}
          <div className="h-2 bg-gradient-to-r from-[#0B9444] to-[#39B54A]"></div>
          
          <div className="p-8 text-center">
            {/* Coming Soon Header */}
            <div className="mb-8">
              <div className="inline-flex justify-center items-center p-4 bg-[#DFF3E2] rounded-full mb-4">
                <Construction size={48} className="text-[#0B9444]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Notifications Coming Soon</h2>
              <p className="text-gray-600 max-w-xl mx-auto">
                We're working hard to bring you personalized plant notifications. 
                Soon you'll receive updates about watering schedules, temperature alerts, 
                and more to keep your plants thriving.
              </p>
            </div>
            
            {/* Features Preview */}
            <div className="grid md:grid-cols-3 gap-6 mb-10">
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="mb-2 flex justify-center">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Bell size={28} className="text-blue-600" />
                  </div>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Smart Alerts</h3>
                <p className="text-sm text-gray-600">
                  Receive timely alerts about plant conditions that require your attention.
                </p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="mb-2 flex justify-center">
                  <div className="p-2 bg-[#DFF3E2] rounded-full">
                    <Calendar size={28} className="text-[#0B9444]" />
                  </div>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Watering Reminders</h3>
                <p className="text-sm text-gray-600">
                  Never miss a watering day with customized schedule reminders.
                </p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="mb-2 flex justify-center">
                  <div className="p-2 bg-amber-100 rounded-full">
                    <Sparkles size={28} className="text-amber-600" />
                  </div>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Growth Milestones</h3>
                <p className="text-sm text-gray-600">
                  Celebrate your plant's progress with growth and health achievement updates.
                </p>
              </div>
            </div>
            
            {/* Launch Timeline */}
            <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-700">
              <Clock size={16} className="mr-2 text-[#0B9444]" />
              <span>Estimated launch: Coming next update</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;