import React from 'react';
import { PieChart, BarChart3, TrendingUp, Download } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Rapports: React.FC = () => {
  const { darkMode } = useApp();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-poppins font-bold ${
            darkMode ? 'text-white' : 'text-bleu-nuit'
          }`}>
            Rapports
          </h1>
          <p className={`text-sm mt-1 ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Analyses et statistiques de votre activité
          </p>
        </div>
        <button className={`px-4 py-2 rounded-lg border transition-colors flex items-center space-x-2 ${
          darkMode 
            ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
        }`}>
          <Download className="w-4 h-4" />
          <span>Exporter</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`p-6 rounded-xl border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-lg font-poppins font-semibold mb-4 ${
            darkMode ? 'text-white' : 'text-bleu-nuit'
          }`}>
            Chiffre d'affaires mensuel
          </h3>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 mx-auto text-orange-sfaxien mb-4" />
              <p className={`text-sm ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Graphique des revenus (à venir)
              </p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-lg font-poppins font-semibold mb-4 ${
            darkMode ? 'text-white' : 'text-bleu-nuit'
          }`}>
            Répartition des ventes
          </h3>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <PieChart className="w-16 h-16 mx-auto text-orange-sfaxien mb-4" />
              <p className={`text-sm ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Graphique en secteurs (à venir)
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={`p-6 rounded-xl border ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <h3 className={`text-lg font-poppins font-semibold mb-4 ${
          darkMode ? 'text-white' : 'text-bleu-nuit'
        }`}>
          Tendances et évolutions
        </h3>
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <TrendingUp className="w-16 h-16 mx-auto text-orange-sfaxien mb-4" />
            <p className={`text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Graphique des tendances (à venir)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};