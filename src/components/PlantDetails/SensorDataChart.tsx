import React from 'react';
import { SensorData } from '../../types';
import { ErrorMessage } from '../common';

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
      <ErrorMessage
        message="No sensor data available"
        type="info"
        className="h-40 flex items-center justify-center"
      />
    );
  }

  const formattedData = [...data].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  ).slice(0, 24);
  
  // Get min, max values with safeguards for missing data
  const validValues = formattedData
    .map(item => Number(item[dataKey]))
    .filter(value => !isNaN(value) && value !== null && value !== undefined);
  
  // Ensure we have a good range for the y-axis, even with only one reading
  let maxValue, minValue;
  
  if (validValues.length > 0) {
    // Get actual min/max from data
    const dataMax = Math.max(...validValues);
    const dataMin = Math.min(...validValues);
    
    // If min and max are the same (e.g., only one reading), create artificial range
    if (dataMax === dataMin) {
      // Use thresholds to determine a reasonable range
      // Make the single value appear somewhere in the middle
      const buffer = Math.max((thresholds.max - thresholds.min) / 2, 10);
      maxValue = Math.max(dataMax + buffer, thresholds.max);
      minValue = Math.min(dataMin - buffer, thresholds.min);
    } else {
      // Add a small buffer (10%) to max and min for better visualization
      const range = dataMax - dataMin;
      maxValue = Math.max(dataMax + range * 0.1, thresholds.max);
      minValue = Math.min(dataMin - range * 0.1, thresholds.min);
    }
  } else {
    // No valid values, use thresholds
    maxValue = thresholds.max;
    minValue = thresholds.min;
  }
  
  // Add a minimum range if max and min are still too close
  if (maxValue - minValue < 5) {
    maxValue += 5;
    minValue = Math.max(0, minValue - 5); // Ensure we don't go below 0 for values that can't be negative
  }
  
  // Get the latest value with fallback
  const latestValue = validValues.length > 0 
    ? formattedData[0][dataKey] 
    : 0;
  
  const getTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const isInOptimalRange = (value: number) => {
    return value >= thresholds.min && value <= thresholds.max;
  };

  const getStatusColor = () => {
    if (isInOptimalRange(Number(latestValue))) {
      return 'text-[#0B9444]';
    } else {
      return 'text-amber-500';
    }
  };
  
  const chartHeight = 120;
  const chartWidth = '100%';
  
  // Get Y coordinate with safety checks for division by zero
  const getY = (value: number) => {
    const range = (maxValue - minValue) || 1; // Prevent division by zero
    const normalizedValue = Math.max(Math.min(value, maxValue), minValue); // Clamp value
    return chartHeight - ((normalizedValue - minValue) / range) * chartHeight;
  };
  
  const getX = (index: number, total: number) => {
    const width = typeof chartWidth === 'string' ? 
      parseInt(chartWidth) || 300 : chartWidth;
    return (index / (total - 1)) * width;
  };
  
  // Generate points with safeguards
  const points = formattedData.map((item, index) => {
    const value = Number(item[dataKey]);
    if (isNaN(value) || value === null || value === undefined) return null;
    
    const x = getX(index, formattedData.length);
    const y = getY(value);
    return `${x},${y}`;
  }).filter(point => point !== null).join(' ');

  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium text-gray-700">{title}</h3>
        <div className={`text-sm font-semibold ${getStatusColor()} flex items-center gap-1`}>
          <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: color }}></span>
          <span>{latestValue} {unit}</span>
        </div>
      </div>
      
      <div className="relative" style={{ height: `${chartHeight}px` }}>
        {/* Chart background grid lines for better readability */}
        <div className="absolute inset-0 grid grid-cols-4 w-full h-full">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="border-r border-gray-100 h-full" />
          ))}
        </div>
        <div className="absolute inset-0 grid grid-rows-4 w-full h-full">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="border-b border-gray-100 w-full" />
          ))}
        </div>
        
        {/* Add reference lines for better readability with few data points */}
        <div className="absolute inset-0">
          {/* Mid-range reference line */}
          <div className="absolute w-full border-b border-dashed border-gray-200"
               style={{ top: `${getY((maxValue + minValue) / 2)}px` }} />
               
          {/* Quarterway reference lines */}
          <div className="absolute w-full border-b border-dotted border-gray-100"
               style={{ top: `${getY(minValue + (maxValue - minValue) * 0.25)}px` }} />
          <div className="absolute w-full border-b border-dotted border-gray-100"
               style={{ top: `${getY(minValue + (maxValue - minValue) * 0.75)}px` }} />
        </div>
        
        <svg width={chartWidth} height={chartHeight} className="overflow-visible relative z-10">
          {/* Threshold lines with improved styling - adjusted to not overlap with text */}
          <line 
            x1="30" 
            y1={getY(thresholds.min)} 
            x2="85%" 
            y2={getY(thresholds.min)} 
            stroke="#CBD5E1" 
            strokeWidth="1.5" 
            strokeDasharray="4,4" 
          />
          <line 
            x1="30" 
            y1={getY(thresholds.max)} 
            x2="85%" 
            y2={getY(thresholds.max)} 
            stroke="#CBD5E1" 
            strokeWidth="1.5" 
            strokeDasharray="4,4" 
          />

          {/* Only render polyline if we have multiple valid points */}
          {points && formattedData.length > 1 && (
            <polyline
              fill="none"
              stroke={color}
              strokeWidth="2"
              points={points}
            />
          )}
          
          {/* We've removed the special case for single reading line as requested */}
          
          {/* Dots for each data point with safeguards */}
          {formattedData.map((item, index) => {
            const value = Number(item[dataKey]);
            if (isNaN(value) || value === null || value === undefined) return null;
            
            // Make the latest reading (index 0) more prominent
            const isLatest = index === 0;
            
            return (
              <circle
                key={index}
                cx={getX(index, formattedData.length)}
                cy={getY(value)}
                r={isLatest || formattedData.length === 1 ? "5" : "3"}
                fill={isLatest ? color : "white"}
                stroke={color}
                strokeWidth={isLatest || formattedData.length === 1 ? "2" : "1.5"}
              />
            );
          })}
        </svg>
        
        {/* Min and max labels - positioned to the left to avoid overlap - with smaller font */}
        <div className="absolute top-0 left-0 text-[9px] text-gray-400 px-1 bg-white/50 rounded">
          {maxValue.toFixed(1)} {unit}
        </div>
        <div className="absolute bottom-0 left-0 text-[9px] text-gray-400 px-1 bg-white/50 rounded">
          {minValue.toFixed(1)} {unit}
        </div>
        
        {/* Reference value labels - only show when few data points or single reading */}
        {formattedData.length <= 3 && (
          <>
            <div className="absolute text-[9px] text-gray-400 px-1 bg-white/50 rounded" 
                 style={{ top: `${getY((maxValue + minValue) / 2)}px`, left: '0', transform: 'translateY(-50%)' }}>
              {((maxValue + minValue) / 2).toFixed(1)} {unit}
            </div>
            <div className="absolute text-[9px] text-gray-400 px-1 bg-white/50 rounded" 
                 style={{ top: `${getY(minValue + (maxValue - minValue) * 0.25)}px`, left: '0', transform: 'translateY(-50%)' }}>
              {(minValue + (maxValue - minValue) * 0.25).toFixed(1)} {unit}
            </div>
            <div className="absolute text-[9px] text-gray-400 px-1 bg-white/50 rounded" 
                 style={{ top: `${getY(minValue + (maxValue - minValue) * 0.75)}px`, left: '0', transform: 'translateY(-50%)' }}>
              {(minValue + (maxValue - minValue) * 0.75).toFixed(1)} {unit}
            </div>
          </>
        )}
        
        {/* Threshold labels - positioned to the right with better spacing and smaller font */}
        <div className="absolute right-0 text-[9px] text-gray-500 px-1 bg-white/70 rounded shadow-sm" 
          style={{ top: `${getY(thresholds.max)}px`, transform: 'translateY(-50%)' }}>
          Max: {thresholds.max} {unit}
        </div>
        <div className="absolute right-0 text-[9px] text-gray-500 px-1 bg-white/70 rounded shadow-sm" 
          style={{ top: `${getY(thresholds.min)}px`, transform: 'translateY(-50%)' }}>
          Min: {thresholds.min} {unit}
        </div>
      </div>
      
      {formattedData.length >= 2 && (
        <div className="flex justify-between mt-2 text-xs text-gray-500 border-t border-gray-100 pt-1">
          <span className="font-medium">From: {getTime(formattedData[formattedData.length - 1].timestamp)}</span>
          <span className="font-medium">To: {getTime(formattedData[0].timestamp)}</span>
        </div>
      )}
    </div>
  );
};

export default SensorDataChart;