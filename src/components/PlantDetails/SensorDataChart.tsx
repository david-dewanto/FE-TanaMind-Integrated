import React from 'react';
import { SensorData } from '../../types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface SensorDataChartProps {
  data: SensorData[];
  dataKey: keyof SensorData;
  title: string;
  unit: string;
  color: string;
  thresholds: {
    min: number;
    max: number;
  };
}

const SensorDataChart: React.FC<SensorDataChartProps> = ({ 
  data, 
  dataKey, 
  title, 
  unit, 
  color,
  thresholds 
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
        <div className="flex items-center justify-center h-32 text-gray-500">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
              <TrendingUp size={24} className="text-gray-400" />
            </div>
            <p className="text-sm">No sensor data available</p>
          </div>
        </div>
      </div>
    );
  }

  const formattedData = [...data].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  ).slice(0, 12); // Show last 12 readings for cleaner visualization
  
  const validValues = formattedData
    .map(item => Number(item[dataKey]))
    .filter(value => !isNaN(value) && value !== null && value !== undefined);
  
  if (validValues.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
        <div className="flex items-center justify-center h-32 text-gray-500">
          <p className="text-sm">Invalid sensor data</p>
        </div>
      </div>
    );
  }

  const latestValue = Number(formattedData[0][dataKey]);
  const previousValue = formattedData.length > 1 ? Number(formattedData[1][dataKey]) : latestValue;
  
  // Calculate trend
  const trend = latestValue > previousValue ? 'up' : 
                latestValue < previousValue ? 'down' : 'stable';
  const trendValue = Math.abs(latestValue - previousValue);

  const isInOptimalRange = (value: number) => {
    return value >= thresholds.min && value <= thresholds.max;
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUp size={16} className="text-emerald-600" />;
      case 'down': return <TrendingDown size={16} className="text-red-500" />;
      default: return <Minus size={16} className="text-gray-400" />;
    }
  };

  const getTrendText = () => {
    if (trend === 'stable') return 'Stable';
    return `${trend === 'up' ? '+' : '-'}${trendValue.toFixed(1)}${unit}`;
  };

  const getStatusColor = () => {
    if (isInOptimalRange(latestValue)) {
      return 'text-emerald-600 bg-emerald-50';
    } else {
      return 'text-amber-600 bg-amber-50';
    }
  };

  // Create chart data for visualization
  const chartData = formattedData.reverse(); // Oldest to newest for chart
  const maxValue = Math.max(...validValues, thresholds.max);
  const minValue = Math.min(...validValues, thresholds.min);
  const range = maxValue - minValue || 1;

  const getTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor()}`}>
          {isInOptimalRange(latestValue) ? '✓ Optimal' : '⚠ Attention'}
        </div>
      </div>

      {/* Current Value and Trend */}
      <div className="mb-6">
        <div className="flex items-baseline gap-3 mb-2">
          <span className="text-3xl font-bold text-gray-900">
            {latestValue.toFixed(1)}
          </span>
          <span className="text-lg text-gray-600">{unit}</span>
          <div className="flex items-center gap-1 ml-2">
            {getTrendIcon()}
            <span className="text-sm text-gray-600">{getTrendText()}</span>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          Optimal range: {thresholds.min}-{thresholds.max}{unit}
        </div>
      </div>

      {/* Chart Visualization */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Last {chartData.length} readings</span>
          <span>{new Date(formattedData[formattedData.length - 1].timestamp).toLocaleDateString()}</span>
        </div>
        
        {/* Line Chart */}
        <div className="relative h-24 bg-gray-50 rounded-lg p-4">
          <svg width="100%" height="100%" className="overflow-visible">
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* Optimal range area */}
            <rect
              x="0"
              y={`${(1 - (thresholds.max - minValue) / range) * 100}%`}
              width="100%"
              height={`${((thresholds.max - thresholds.min) / range) * 100}%`}
              fill={color}
              opacity="0.1"
            />
            
            {/* Data line */}
            {chartData.length > 1 && (
              <polyline
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={chartData.map((item, index) => {
                  const x = (index / (chartData.length - 1)) * 100;
                  const y = (1 - (Number(item[dataKey]) - minValue) / range) * 100;
                  return `${x}%,${y}%`;
                }).join(' ')}
              />
            )}
            
            {/* Data points */}
            {chartData.map((item, index) => {
              const value = Number(item[dataKey]);
              const x = (index / (chartData.length - 1)) * 100;
              const y = (1 - (value - minValue) / range) * 100;
              const isOptimal = isInOptimalRange(value);
              const isLatest = index === chartData.length - 1;
              
              return (
                <circle
                  key={index}
                  cx={`${x}%`}
                  cy={`${y}%`}
                  r={isLatest ? "4" : "3"}
                  fill={isLatest ? color : isOptimal ? color : '#ef4444'}
                  stroke="white"
                  strokeWidth="2"
                  className="drop-shadow-sm"
                />
              );
            })}
          </svg>
        </div>

        {/* Range indicators */}
        <div className="flex justify-between items-center text-xs text-gray-400">
          <span>{minValue.toFixed(1)}{unit}</span>
          <div className="flex-1 mx-4 h-1 bg-gray-200 rounded-full relative">
            <div 
              className="absolute h-full bg-emerald-200 rounded-full"
              style={{
                left: `${((thresholds.min - minValue) / range) * 100}%`,
                width: `${((thresholds.max - thresholds.min) / range) * 100}%`
              }}
            />
          </div>
          <span>{maxValue.toFixed(1)}{unit}</span>
        </div>

        {/* Time range */}
        {chartData.length >= 2 && (
          <div className="flex justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
            <span>From: {getTime(chartData[0].timestamp)}</span>
            <span>To: {getTime(chartData[chartData.length - 1].timestamp)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SensorDataChart;