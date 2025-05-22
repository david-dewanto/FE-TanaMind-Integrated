import React from 'react';
import { Brain, AlertCircle, CheckCircle, Clock, Lightbulb, Target } from 'lucide-react';

interface AIInsight {
  id: string;
  type: 'recommendation' | 'warning' | 'success' | 'info';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
  timestamp: string;
  confidence?: number;
}

interface AIInsightCardProps {
  insight: AIInsight;
  onAction?: () => void;
}

const AIInsightCard: React.FC<AIInsightCardProps> = ({ insight, onAction }) => {
  const getTypeConfig = (type: AIInsight['type']) => {
    switch (type) {
      case 'recommendation':
        return {
          icon: <Lightbulb size={20} />,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          iconColor: 'text-blue-600'
        };
      case 'warning':
        return {
          icon: <AlertCircle size={20} />,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          iconColor: 'text-yellow-600'
        };
      case 'success':
        return {
          icon: <CheckCircle size={20} />,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
          iconColor: 'text-green-600'
        };
      case 'info':
      default:
        return {
          icon: <Brain size={20} />,
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-800',
          iconColor: 'text-gray-600'
        };
    }
  };

  const getPriorityIndicator = (priority: AIInsight['priority']) => {
    switch (priority) {
      case 'high':
        return <div className="w-3 h-3 bg-red-500 rounded-full" />;
      case 'medium':
        return <div className="w-3 h-3 bg-yellow-500 rounded-full" />;
      case 'low':
        return <div className="w-3 h-3 bg-green-500 rounded-full" />;
    }
  };

  const config = getTypeConfig(insight.type);

  return (
    <div className={`rounded-lg border p-4 ${config.bgColor} ${config.borderColor}`}>
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 ${config.iconColor}`}>
          {config.icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className={`font-semibold ${config.textColor}`}>
              {insight.title}
            </h3>
            {getPriorityIndicator(insight.priority)}
          </div>
          
          <p className={`text-sm ${config.textColor} mb-3`}>
            {insight.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Clock size={12} />
                {new Date(insight.timestamp).toLocaleDateString()}
              </div>
              {insight.confidence && (
                <div className="flex items-center gap-1">
                  <Target size={12} />
                  {insight.confidence}% confidence
                </div>
              )}
            </div>
            
            {insight.actionable && onAction && (
              <button
                onClick={onAction}
                className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                  insight.type === 'recommendation' 
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : insight.type === 'warning'
                    ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                Take Action
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInsightCard;