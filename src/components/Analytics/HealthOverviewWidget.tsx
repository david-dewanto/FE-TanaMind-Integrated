import React from 'react';
import { Heart, AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { AIRecommendation } from '../../api/ai';

interface HealthOverviewWidgetProps {
  recommendations: AIRecommendation[];
  totalPlants: number;
}

const HealthOverviewWidget: React.FC<HealthOverviewWidgetProps> = ({ 
  recommendations, 
  totalPlants 
}) => {
  const healthCounts = recommendations.reduce((acc, rec) => {
    acc[rec.overallHealth] = (acc[rec.overallHealth] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const excellent = healthCounts.excellent || 0;
  const good = healthCounts.good || 0;
  const concerning = healthCounts.concerning || 0;
  const critical = healthCounts.critical || 0;

  const healthyPlants = excellent + good;
  const needAttention = concerning + critical;
  const healthPercentage = totalPlants > 0 ? (healthyPlants / totalPlants) * 100 : 0;

  const getHealthColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthIcon = (percentage: number) => {
    if (percentage >= 80) return <CheckCircle size={24} className="text-green-600" />;
    if (percentage >= 60) return <Clock size={24} className="text-yellow-600" />;
    return <AlertTriangle size={24} className="text-red-600" />;
  };

  const healthStats = [
    {
      label: 'Excellent',
      count: excellent,
      color: 'bg-green-500',
      textColor: 'text-green-700'
    },
    {
      label: 'Good', 
      count: good,
      color: 'bg-blue-500',
      textColor: 'text-blue-700'
    },
    {
      label: 'Concerning',
      count: concerning,
      color: 'bg-yellow-500', 
      textColor: 'text-yellow-700'
    },
    {
      label: 'Critical',
      count: critical,
      color: 'bg-red-500',
      textColor: 'text-red-700'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Heart size={24} className="text-pink-600" />
        <h2 className="text-xl font-semibold text-gray-800">Plant Health Overview</h2>
      </div>

      {/* Overall Health Score */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-2">
          {getHealthIcon(healthPercentage)}
          <span className={`text-3xl font-bold ${getHealthColor(healthPercentage)}`}>
            {healthPercentage.toFixed(0)}%
          </span>
        </div>
        <p className="text-gray-600">
          {healthyPlants} of {totalPlants} plants are healthy
        </p>
        {needAttention > 0 && (
          <p className="text-sm text-orange-600 mt-1">
            {needAttention} plant{needAttention !== 1 ? 's' : ''} need attention
          </p>
        )}
      </div>

      {/* Health Distribution */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Health Distribution</h3>
        {healthStats.map((stat) => (
          <div key={stat.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${stat.color}`} />
              <span className="text-sm text-gray-700">{stat.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${stat.textColor}`}>
                {stat.count}
              </span>
              <span className="text-xs text-gray-500">
                ({totalPlants > 0 ? ((stat.count / totalPlants) * 100).toFixed(0) : 0}%)
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="mt-6">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span>Health Progress</span>
          <span>{healthPercentage.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              healthPercentage >= 80 
                ? 'bg-green-500' 
                : healthPercentage >= 60 
                ? 'bg-yellow-500' 
                : 'bg-red-500'
            }`}
            style={{ width: `${healthPercentage}%` }}
          />
        </div>
      </div>

      {/* Quick Actions */}
      {needAttention > 0 && (
        <div className="mt-6 p-3 bg-orange-50 rounded-lg border border-orange-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-orange-600" />
            <span className="text-sm font-medium text-orange-800">Action Required</span>
          </div>
          <p className="text-xs text-orange-700">
            {needAttention} plant{needAttention !== 1 ? 's' : ''} need immediate attention. 
            Check individual plant recommendations for specific actions.
          </p>
        </div>
      )}

      {/* Improvement Trend */}
      {recommendations.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <TrendingUp size={16} className="text-green-600" />
            <span>
              {recommendations.filter(r => r.confidenceScore >= 80).length} high-confidence insights available
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthOverviewWidget;