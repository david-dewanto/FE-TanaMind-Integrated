import React from 'react';
import { BarChart3, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface SensorReading {
  value: number;
  timestamp: string;
  optimal_min: number;
  optimal_max: number;
}

interface PlantHealthChartProps {
  data: SensorReading[];
  label: string;
  unit: string;
  color: string;
  icon?: React.ReactNode;
}

const PlantHealthChart: React.FC<PlantHealthChartProps> = ({ 
  data, 
  label, 
  unit, 
  color,
  icon 
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
          <h3 className="text-lg font-semibold text-gray-800">{label}</h3>
        </div>
        <div className="flex items-center justify-center h-32 text-gray-500">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
              {icon || <BarChart3 size={24} className="text-gray-400" />}
            </div>
            <p className="text-sm">No sensor data available</p>
          </div>
        </div>
      </div>
    );
  }

  const latest = data[0];
  const previous = data[1];
  const isInRange = latest.value >= latest.optimal_min && latest.value <= latest.optimal_max;
  
  let trend: 'up' | 'down' | 'stable' = 'stable';
  let trendValue = 0;
  
  if (previous) {
    const diff = latest.value - previous.value;
    trendValue = Math.abs(diff);
    if (Math.abs(diff) > 0.1) {
      trend = diff > 0 ? 'up' : 'down';
    }
  }

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUp size={16} className="text-green-600" />;
      case 'down': return <TrendingDown size={16} className="text-red-600" />;
      default: return <Minus size={16} className="text-gray-400" />;
    }
  };

  const getTrendText = () => {
    if (trend === 'stable') return 'Stable';
    return `${trend === 'up' ? '+' : '-'}${trendValue.toFixed(1)}${unit}`;
  };

  const getStatusColor = () => {
    if (isInRange) return 'text-green-600 bg-green-50';
    return 'text-red-600 bg-red-50';
  };

  // Create a simple bar chart visualization
  const chartData = data.slice(0, 10).reverse(); // Show last 10 readings, oldest first
  const maxValue = Math.max(...chartData.map(d => d.value), latest.optimal_max);
  const minValue = Math.min(...chartData.map(d => d.value), latest.optimal_min);
  const range = maxValue - minValue || 1;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
          <h3 className="text-lg font-semibold text-gray-800">{label}</h3>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor()}`}>
          {isInRange ? '✓ Optimal' : '⚠ Attention'}
        </div>
      </div>

      {/* Current Value and Trend */}
      <div className="mb-6">
        <div className="flex items-baseline gap-3 mb-2">
          <span className="text-3xl font-bold text-gray-900">
            {latest.value.toFixed(1)}
          </span>
          <span className="text-lg text-gray-600">{unit}</span>
          <div className="flex items-center gap-1 ml-2">
            {getTrendIcon()}
            <span className="text-sm text-gray-600">{getTrendText()}</span>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          Optimal range: {latest.optimal_min}-{latest.optimal_max}{unit}
        </div>
      </div>

      {/* Enhanced Bar Chart */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Last {chartData.length} readings</span>
          <span>{new Date(latest.timestamp).toLocaleDateString()}</span>
        </div>
        
        {/* Bar Chart Container */}
        <div className="relative h-24 bg-gray-50 rounded-lg p-4">
          <div className="h-full flex items-end justify-between gap-1">
            {chartData.map((reading, index) => {
              const height = ((reading.value - minValue) / range) * 100;
              const isOptimal = reading.value >= reading.optimal_min && reading.value <= reading.optimal_max;
              const isLatest = index === chartData.length - 1;
              
              return (
                <div
                  key={index}
                  className="flex-1 relative group flex flex-col justify-end h-full"
                >
                  <div
                    className={`w-full rounded-t-sm transition-all duration-300 hover:opacity-80 ${
                      isLatest ? 'ring-2 ring-offset-1' : ''
                    }`}
                    style={{ 
                      height: `${Math.max(height, 8)}%`,
                      backgroundColor: isOptimal ? color : '#ef4444',
                      ringColor: isOptimal ? color : '#ef4444'
                    }}
                  />
                  
                  {/* Enhanced Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">
                    <div className="font-medium">{reading.value.toFixed(1)}{unit}</div>
                    <div className="text-gray-300">{new Date(reading.timestamp).toLocaleString()}</div>
                    <div className="text-gray-300">{isOptimal ? 'Optimal' : 'Out of range'}</div>
                    {/* Arrow */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Enhanced Range Indicator */}
        <div className="space-y-2">
          <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="absolute h-full bg-emerald-200 rounded-full"
              style={{
                left: `${((latest.optimal_min - minValue) / range) * 100}%`,
                width: `${((latest.optimal_max - latest.optimal_min) / range) * 100}%`
              }}
            />
            {/* Current value indicator */}
            <div
              className="absolute top-0 h-full w-1 bg-gray-800 shadow-sm"
              style={{
                left: `${((latest.value - minValue) / range) * 100}%`,
                transform: 'translateX(-50%)'
              }}
            />
          </div>
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>{minValue.toFixed(1)}{unit}</span>
            <span className="text-gray-600 font-medium">Current: {latest.value.toFixed(1)}{unit}</span>
            <span>{maxValue.toFixed(1)}{unit}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlantHealthChart;