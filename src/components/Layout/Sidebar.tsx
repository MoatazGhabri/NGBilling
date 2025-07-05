import React from 'react';
import { 
  BarChart3, 
  FileText, 
  FileEdit, 
  Truck, 
  CreditCard, 
  Package, 
  Users, 
  PieChart, 
  Settings,
  Moon,
  Sun
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const menuItems = [
  { id: 'dashboard', label: 'Tableau de bord', icon: BarChart3 },
  { id: 'factures', label: 'Factures', icon: FileText },
  { id: 'devis', label: 'Devis', icon: FileEdit },
  { id: 'bons-livraison', label: 'Bons de livraison', icon: Truck },
  { id: 'paiements', label: 'Paiements', icon: CreditCard },
  { id: 'produits', label: 'Produits / Stock', icon: Package },
  { id: 'clients', label: 'Clients', icon: Users },
  { id: 'rapports', label: 'Rapports', icon: PieChart },
  { id: 'parametres', label: 'Paramètres', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const { currentPage, setCurrentPage, darkMode, setDarkMode } = useApp();

  return (
    <aside className={`fixed left-0 top-0 h-full w-64 z-50 transition-all duration-300 ${
      darkMode ? 'bg-bleu-nuit' : 'bg-white'
    } border-r border-gray-200 dark:border-gray-700 shadow-lg`}>
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-orange-sfaxien rounded-lg flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-poppins font-bold text-bleu-nuit dark:text-white">NGBilling</h1>
            <p className="text-sm text-gris-ardoise dark:text-gray-400">Facturation Simple</p>
          </div>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-orange-sfaxien text-white shadow-md'
                    : `${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gris-ardoise hover:bg-gray-50'}`
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-inter font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="absolute bottom-6 left-6 right-6">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
            darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gris-ardoise hover:bg-gray-50'
          }`}
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          <span className="font-inter font-medium">
            {darkMode ? 'Mode clair' : 'Mode sombre'}
          </span>
        </button>
      </div>
    </aside>
  );
};