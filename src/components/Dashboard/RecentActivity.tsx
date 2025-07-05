import React from 'react';
import { FileText, User, Package, CreditCard, FileEdit } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const RecentActivity: React.FC = () => {
  const { darkMode, recentActivities } = useApp();

  const getIcon = (type: string) => {
    switch (type) {
      case 'facture': return FileText;
      case 'client': return User;
      case 'produit': return Package;
      case 'paiement': return CreditCard;
      case 'devis': return FileEdit;
      default: return FileText;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'facture': return 'bg-blue-500';
      case 'client': return 'bg-green-500';
      case 'produit': return 'bg-yellow-500';
      case 'paiement': return 'bg-orange-sfaxien';
      case 'devis': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
  };

  return (
    <div className={`p-6 rounded-xl border ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <h3 className={`text-lg font-poppins font-semibold mb-4 ${
        darkMode ? 'text-white' : 'text-bleu-nuit'
      }`}>
        Activité récente
      </h3>
      <div className="space-y-4">
        {recentActivities.length > 0 ? (
          recentActivities.map((activity) => {
            const Icon = getIcon(activity.type);
            return (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getColor(activity.type)}`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    darkMode ? 'text-white' : 'text-bleu-nuit'
                  }`}>
                    {activity.description}
                  </p>
                  <p className={`text-xs ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {formatTime(activity.time)}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8">
            <p className={`text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Aucune activité récente
            </p>
          </div>
        )}
      </div>
    </div>
  );
};