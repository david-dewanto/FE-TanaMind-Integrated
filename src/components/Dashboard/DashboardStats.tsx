import React from 'react';
import { DashboardStats as DashboardStatsType } from '../../types';
import { Flower, Droplets, AlertCircle, CheckCircle } from 'lucide-react';

interface DashboardStatsProps {
  stats: DashboardStatsType;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  const statItems = [
    { 
      title: 'Total Plants', 
      value: stats.totalPlants, 
      icon: <Flower size={20} className="text-[#0B9444]" />,
      bgColor: 'bg-[#DFF3E2]',
      textColor: 'text-[#056526]',
    },
    { 
      title: 'Needs Water', 
      value: stats.plantsNeedingWater, 
      icon: <Droplets size={20} className="text-blue-500" />,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
    },
    { 
      title: 'Needs Attention', 
      value: stats.plantsNeedingAttention, 
      icon: <AlertCircle size={20} className="text-amber-500" />,
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
    },
    { 
      title: 'Auto-Watered Today', 
      value: stats.autoWateredToday, 
      icon: <CheckCircle size={20} className="text-[#39B54A]" />,
      bgColor: 'bg-[#DFF3E2]',
      textColor: 'text-[#0B9444]',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((item, index) => (
        <div 
          key={index} 
          className={`${item.bgColor} rounded-lg p-4 shadow-sm transition-transform hover:scale-[1.02] duration-300`}
        >
          <div className="flex justify-between items-center">
            <span className={`text-2xl font-bold ${item.textColor}`}>{item.value}</span>
            <div className={`p-2 rounded-full ${item.bgColor}`}>
              {item.icon}
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-1">{item.title}</p>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;