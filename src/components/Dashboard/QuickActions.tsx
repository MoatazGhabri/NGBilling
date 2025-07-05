import React from 'react';
import { 
  Plus, 
  FileText, 
  Users, 
  Package, 
  CreditCard, 
  TrendingUp,
  Download,
  Settings
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface QuickAction {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  action: () => void;
  color: string;
  bgColor: string;
}

export const QuickActions: React.FC = () => {
  const { setCurrentPage, showNotification, darkMode } = useApp();

  const actions: QuickAction[] = [
    {
      title: 'Nouvelle facture',
      description: 'Créer une nouvelle facture',
      icon: FileText,
      action: () => setCurrentPage('factures'),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      title: 'Nouveau devis',
      description: 'Créer un nouveau devis',
      icon: TrendingUp,
      action: () => setCurrentPage('devis'),
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      title: 'Nouveau client',
      description: 'Ajouter un nouveau client',
      icon: Users,
      action: () => setCurrentPage('clients'),
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      title: 'Nouveau produit',
      description: 'Ajouter un nouveau produit',
      icon: Package,
      action: () => setCurrentPage('produits'),
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20'
    },
    {
      title: 'Nouveau paiement',
      description: 'Enregistrer un paiement',
      icon: CreditCard,
      action: () => setCurrentPage('paiements'),
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20'
    },
    {
      title: 'Exporter données',
      description: 'Exporter les données',
      icon: Download,
      action: () => {
        showNotification('info', 'Fonctionnalité d\'export en cours de développement');
      },
      color: 'text-gray-600',
      bgColor: 'bg-gray-50 dark:bg-gray-900/20'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className={`text-lg font-poppins font-semibold ${
          darkMode ? 'text-white' : 'text-bleu-nuit'
        }`}>
          Actions rapides
        </h3>
        <button
          onClick={() => setCurrentPage('parametres')}
          className={`p-2 rounded-lg transition-colors ${
            darkMode 
              ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              onClick={action.action}
              className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                darkMode ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-gray-300'
              } ${action.bgColor}`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${action.bgColor}`}>
                  <Icon className={`w-5 h-5 ${action.color}`} />
                </div>
                <div className="text-left">
                  <p className={`text-sm font-medium ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {action.title}
                  </p>
                  <p className={`text-xs ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {action.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}; 