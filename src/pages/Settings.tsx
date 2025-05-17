import React from 'react';
import { Bell, Lock, User, Globe, Sliders, Wifi } from 'lucide-react';

const Settings: React.FC = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#056526]">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and system preferences</p>
      </div>

      <div className="grid gap-6">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <User size={20} className="text-[#0B9444]" />
              <h2 className="text-lg font-semibold text-gray-800">Account Settings</h2>
            </div>
          </div>
          
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0B9444] focus:ring focus:ring-[#39B54A] focus:ring-opacity-50"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0B9444] focus:ring focus:ring-[#39B54A] focus:ring-opacity-50"
                placeholder="Your Name"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Bell size={20} className="text-[#0B9444]" />
              <h2 className="text-lg font-semibold text-gray-800">Notification Preferences</h2>
            </div>
          </div>
          
          <div className="p-4 space-y-4">
            {['Push Notifications', 'Email Notifications', 'SMS Alerts'].map((item) => (
              <div key={item} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{item}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#DFF3E2] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0B9444]"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Wifi size={20} className="text-[#0B9444]" />
              <h2 className="text-lg font-semibold text-gray-800">Device Settings</h2>
            </div>
          </div>
          
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Default Watering Duration</label>
              <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0B9444] focus:ring focus:ring-[#39B54A] focus:ring-opacity-50">
                <option>30 seconds</option>
                <option>1 minute</option>
                <option>2 minutes</option>
                <option>5 minutes</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Sensor Reading Interval</label>
              <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0B9444] focus:ring focus:ring-[#39B54A] focus:ring-opacity-50">
                <option>Every 5 minutes</option>
                <option>Every 15 minutes</option>
                <option>Every 30 minutes</option>
                <option>Every hour</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button className="px-4 py-2 bg-[#0B9444] text-white rounded-md text-sm font-medium hover:bg-[#056526]">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;