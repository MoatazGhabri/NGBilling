import React, { useState, useEffect } from 'react';
import { LucideIcon } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  loading?: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  trend, 
  loading = false 
}) => {
  const { darkMode } = useApp();
  const [animatedValue, setAnimatedValue] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Animate value on mount
  useEffect(() => {
    if (typeof value === 'number') {
      const targetValue = value;
      const duration = 1000;
      const steps = 60;
      const increment = targetValue / steps;
      let currentValue = 0;

      const timer = setInterval(() => {
        currentValue += increment;
        if (currentValue >= targetValue) {
          setAnimatedValue(targetValue);
          clearInterval(timer);
        } else {
          setAnimatedValue(currentValue);
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [value]);

  const displayValue = typeof value === 'number' ? animatedValue : value;

  return (
    <div 
      className={`p-6 rounded-xl border transition-all duration-300 hover:shadow-xl hover:scale-105 ${
        darkMode ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-gray-300'
      } ${isHovered ? 'transform -translate-y-1' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={`text-sm font-medium transition-colors ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {title}
          </p>
          <p className={`text-2xl font-poppins font-bold mt-1 transition-all duration-300 ${
            darkMode ? 'text-white' : 'text-bleu-nuit'
          } ${loading ? 'animate-pulse' : ''}`}>
            {loading ? '...' : (
              typeof displayValue === 'number' 
                ? displayValue.toLocaleString() 
                : displayValue
            )}
          </p>
          {trend && (
            <div className="flex items-center space-x-1 mt-2">
              <span className={`text-xs font-medium ${
                trend.isPositive ? 'text-green-500' : 'text-red-500'
              }`}>
                {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
              </span>
              <span className={`text-xs ${
                darkMode ? 'text-gray-500' : 'text-gray-400'
              }`}>
                ce mois
              </span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-300 ${
          color.includes('green') ? 'gradient-green' :
          color.includes('blue') ? 'gradient-blue' :
          color.includes('purple') ? 'gradient-purple' :
          'gradient-orange'
        } ${
          isHovered ? 'scale-110 shadow-lg animate-pulse-glow' : ''
        }`}>
          <Icon className={`w-6 h-6 text-white transition-transform duration-300 ${
            isHovered ? 'scale-110' : ''
          }`} />
        </div>
      </div>
      
      {/* Animated background gradient */}
      <div className={`absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 ${
        isHovered ? 'opacity-10' : ''
      } ${color.replace('bg-', 'bg-gradient-to-br from-')}`} />
    </div>
  );
};