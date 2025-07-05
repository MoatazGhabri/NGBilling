import React from 'react';
import { useApp } from '../../context/AppContext';

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
}

export const ChartCard: React.FC<ChartCardProps> = ({ title, children }) => {
  const { darkMode } = useApp();

  return (
    <div className={`p-6 rounded-xl border ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <h3 className={`text-lg font-poppins font-semibold mb-4 ${
        darkMode ? 'text-white' : 'text-bleu-nuit'
      }`}>
        {title}
      </h3>
      {children}
    </div>
  );
};