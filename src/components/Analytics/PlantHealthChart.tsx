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
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          {icon || <BarChart3 size={20} />}
          <h3 className="text-lg font-semibold text-gray-800">{label}</h3>
        </div>
        <div className="text-center text-gray-500 py-8">
          <p>No data available</p>
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
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon || <BarChart3 size={20} style={{ color }} />}
          <h3 className="text-lg font-semibold text-gray-800">{label}</h3>
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
          {isInRange ? '✓ Optimal' : '⚠ Out of range'}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-gray-800">
            {latest.value.toFixed(1)}
          </span>
          <span className="text-lg text-gray-600">{unit}</span>
          <div className="flex items-center gap-1 ml-2">
            {getTrendIcon()}
            <span className="text-sm text-gray-600">{getTrendText()}</span>
          </div>
        </div>
        <div className="text-sm text-gray-500 mt-1">
          Optimal: {latest.optimal_min}-{latest.optimal_max}{unit}
        </div>
      </div>

      {/* Simple bar chart */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Last 10 readings</span>
          <span>{new Date(latest.timestamp).toLocaleDateString()}</span>
        </div>
        <div className="h-20 flex items-end gap-1">
          {chartData.map((reading, index) => {
            const height = ((reading.value - minValue) / range) * 100;
            const isOptimal = reading.value >= reading.optimal_min && reading.value <= reading.optimal_max;
            
            return (
              <div
                key={index}
                className="flex-1 relative group"
              >
                <div
                  className={`w-full rounded-t transition-all duration-200 ${
                    isOptimal ? 'bg-green-400' : 'bg-red-400'
                  } group-hover:opacity-80`}
                  style={{ 
                    height: `${Math.max(height, 5)}%`,
                    backgroundColor: isOptimal ? color : '#ef4444'
                  }}
                />
                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  {reading.value.toFixed(1)}{unit}
                  <br />
                  {new Date(reading.timestamp).toLocaleDateString()}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Optimal range indicator */}
        <div className="relative h-2 bg-gray-100 rounded">
          <div
            className="absolute h-full bg-green-200 rounded"
            style={{
              left: `${((latest.optimal_min - minValue) / range) * 100}%`,
              width: `${((latest.optimal_max - latest.optimal_min) / range) * 100}%`
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>{minValue.toFixed(1)}</span>
          <span>{maxValue.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
};

export default PlantHealthChart;