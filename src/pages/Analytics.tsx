import React from 'react';
import { Sparkles, Code, BarChart2, Cpu } from 'lucide-react';

// Pure coming soon page with no hooks or context usage
class Analytics extends React.Component {
  render() {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#056526]">AI Analytics</h1>
          <p className="text-gray-600 mt-1">Advanced plant analysis powered by artificial intelligence</p>
        </div>

        <div className="bg-gradient-to-b from-white to-[#F3FFF6] rounded-xl shadow-lg border border-[#DFF3E2] p-8 text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 bg-[#DFF3E2] rounded-full flex items-center justify-center">
              <BarChart2 size={40} className="text-[#0B9444]" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-[#056526] mb-4">Coming Soon</h2>
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
            We're working on bringing you powerful AI-driven analytics to help you understand your plants better and optimize their growth.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="flex justify-center mb-4">
                <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center">
                  <Cpu size={24} className="text-blue-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Smart Predictions</h3>
              <p className="text-gray-600">
                Predict plant health issues before they become visible using advanced machine learning.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="flex justify-center mb-4">
                <div className="h-12 w-12 bg-green-50 rounded-full flex items-center justify-center">
                  <Sparkles size={24} className="text-green-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Growth Optimization</h3>
              <p className="text-gray-600">
                Get personalized recommendations to maximize plant growth and yield.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="flex justify-center mb-4">
                <div className="h-12 w-12 bg-amber-50 rounded-full flex items-center justify-center">
                  <Code size={24} className="text-amber-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Advanced Reporting</h3>
              <p className="text-gray-600">
                Gain insights through detailed reports and interactive visualizations.
              </p>
            </div>
          </div>
          
          <div className="bg-[#056526]/5 p-4 rounded-lg inline-block">
            <p className="text-sm text-[#056526]">
              Our team is hard at work building this feature. Check back soon!
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export default Analytics;