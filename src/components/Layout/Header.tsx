import React from 'react';
import { Bell, Search, User, LogOut } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface HeaderProps {
  onLogout: () => void;
  timer?: number; // seconds
}

export const Header: React.FC<HeaderProps> = ({ onLogout, timer }) => {
  const { darkMode } = useApp();

  // Format timer as mm:ss
  const formatTimer = (seconds?: number) => {
    if (typeof seconds !== 'number') return '';
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <header className={`fixed top-0 left-64 right-0 z-40 ${
      darkMode ? 'bg-gray-800' : 'bg-white'
    } border-b border-gray-200 dark:border-gray-700 shadow-sm`}>
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                className={`pl-10 pr-4 py-2 w-96 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-blanc-sable border-gray-300 text-bleu-nuit placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-orange-sfaxien focus:border-transparent`}
              />
            </div>
            {/* Timer display */}
            {typeof timer === 'number' && (
              <div className="ml-6 px-3 py-1 rounded bg-orange-sfaxien text-white font-mono font-bold text-lg shadow">
                Session: {formatTimer(timer)}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <button className={`p-2 rounded-lg transition-colors ${
              darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}>
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-sfaxien rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-bleu-nuit dark:text-white">NATHY GRAPH</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Studio Créatif</p>
              </div>
              <button
                onClick={onLogout}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
                title="Se déconnecter"
              >
                <LogOut className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};