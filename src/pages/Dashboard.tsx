import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  FileText, 
  Users, 
  Package, 
  TrendingUp, 
  AlertTriangle,
  Download,
  Activity,
  Clock,
  CheckCircle
} from 'lucide-react';
import { StatsCard } from '../components/Dashboard/StatsCard';
import { ChartCard } from '../components/Dashboard/ChartCard';
import { RecentActivity } from '../components/Dashboard/RecentActivity';
import { RevenueChart } from '../components/Dashboard/RevenueChart';
import { PaymentChart } from '../components/Dashboard/PaymentChart';
import { ProductsChart } from '../components/Dashboard/ProductsChart';
import { QuickActions } from '../components/Dashboard/QuickActions';
import { useApp } from '../context/AppContext';
import { exportToCSV, formatDataForExport } from '../utils/exportUtils';

export const Dashboard: React.FC = () => {
  const { 
    factures, 
    clients, 
    produits, 
    paiements, 
    devis,
    bonsLivraison,
    darkMode, 
    setCurrentPage,
    showNotification 
  } = useApp();

  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const stats = {
    chiffreAffaires: factures
      .filter(f => f.statut === 'payee')
      .reduce((sum, f) => sum + (typeof f.total === 'number' ? f.total : 0), 0),
    facturesEnAttente: factures.filter(f => f.statut === 'envoyee' || f.statut === 'en_retard').length,
    clientsActifs: clients.length,
    devisEnCours: devis.filter(d => d.statut === 'envoye').length,
    bonsLivraison: bonsLivraison.length,
    paiementsRecents: paiements.filter(p => {
      const paymentDate = new Date(p.datePaiement);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return paymentDate > weekAgo;
    }).length
  };

  const handleExport = () => {
    try {
      const data = formatDataForExport(factures, clients, produits);
      exportToCSV(data.factures, 'factures');
      exportToCSV(data.clients, 'clients');
      exportToCSV(data.produits, 'produits');
      showNotification('success', 'Export réalisé avec succès');
    } catch (error) {
      showNotification('error', 'Erreur lors de l\'export');
    }
  };

  const handleNewFacture = () => {
    setCurrentPage('factures');
  };

  // Calcul des tendances
  const currentMonth = new Date().getMonth();
  const lastMonth = currentMonth - 1;
  
  const currentMonthRevenue = factures
    .filter(f => f.statut === 'payee' && new Date(f.dateCreation).getMonth() === currentMonth)
    .reduce((sum, f) => sum + (typeof f.total === 'number' ? f.total : 0), 0);
    
  const lastMonthRevenue = factures
    .filter(f => f.statut === 'payee' && new Date(f.dateCreation).getMonth() === lastMonth)
    .reduce((sum, f) => sum + (typeof f.total === 'number' ? f.total : 0), 0);

  const revenueTrend = lastMonthRevenue > 0 
    ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
    : 0;

  // Recent activity data
  const recentActivity = [
    ...factures.slice(0, 3).map(f => ({
      type: 'facture',
      title: `Facture #${f.numero}`,
      subtitle: `Client #${f.clientId} - ${typeof f.total === 'number' ? f.total.toLocaleString() : '0'} TND`,
      status: f.statut,
      date: f.dateCreation,
      icon: FileText
    })),
    ...devis.slice(0, 2).map(d => ({
      type: 'devis',
      title: `Devis #${d.numero}`,
      subtitle: `Client #${d.clientId} - ${typeof d.total === 'number' ? d.total.toLocaleString() : '0'} TND`,
      status: d.statut,
      date: d.dateCreation,
      icon: TrendingUp
    })),
    ...paiements.slice(0, 2).map(p => ({
      type: 'paiement',
      title: `Paiement #${p.id}`,
      subtitle: `${typeof p.montant === 'number' ? p.montant.toLocaleString() : '0'} TND - ${p.methode}`,
      status: p.statut,
      date: p.datePaiement,
      icon: CheckCircle
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-poppins font-bold ${
            darkMode ? 'text-white' : 'text-bleu-nuit'
          }`}>
            Tableau de bord
          </h1>
          <p className={`text-sm mt-1 ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Aperçu de votre activité commerciale
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleNewFacture}
            className="px-6 py-3 bg-orange-sfaxien text-white rounded-lg hover:bg-orange-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Nouvelle facture
          </button>
          <button 
            onClick={handleExport}
            className={`px-4 py-3 rounded-lg border transition-all duration-200 font-medium flex items-center space-x-2 hover:shadow-lg ${
              darkMode 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Chiffre d'affaires"
          value={stats.chiffreAffaires}
          icon={DollarSign}
          color="bg-green-500"
          trend={{ 
            value: Math.abs(Math.round(revenueTrend)), 
            isPositive: revenueTrend >= 0 
          }}
          loading={isLoading}
        />
        <StatsCard
          title="Factures en attente"
          value={stats.facturesEnAttente}
          icon={FileText}
          color="bg-blue-500"
          loading={isLoading}
        />
        <StatsCard
          title="Clients actifs"
          value={stats.clientsActifs}
          icon={Users}
          color="bg-purple-500"
          trend={{ 
            value: clients.length > 0 ? 8 : 0, 
            isPositive: true 
          }}
          loading={isLoading}
        />
        <StatsCard
          title="Devis en cours"
          value={stats.devisEnCours}
          icon={TrendingUp}
          color="bg-orange-sfaxien"
          loading={isLoading}
        />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Évolution du chiffre d'affaires">
          <RevenueChart />
        </ChartCard>

        <ChartCard title="Répartition des paiements">
          <PaymentChart />
        </ChartCard>
      </div>

      {/* Products and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Top produits par CA">
          <ProductsChart />
        </ChartCard>

        <ChartCard title="Activité récente">
          <div className="space-y-4">
            {recentActivity.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.type === 'facture' ? 'bg-blue-100 dark:bg-blue-900/30' :
                    activity.type === 'devis' ? 'bg-green-100 dark:bg-green-900/30' :
                    'bg-purple-100 dark:bg-purple-900/30'
                  }`}>
                    <Icon className={`w-4 h-4 ${
                      activity.type === 'facture' ? 'text-blue-600 dark:text-blue-400' :
                      activity.type === 'devis' ? 'text-green-600 dark:text-green-400' :
                      'text-purple-600 dark:text-purple-400'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {activity.title}
                    </p>
                    <p className={`text-xs ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {activity.subtitle}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    activity.status === 'payee' || activity.status === 'accepte' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                    activity.status === 'envoyee' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                    {activity.status}
                  </span>
                </div>
              );
            })}
            {recentActivity.length === 0 && (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                <p className={`text-sm ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Aucune activité récente
                </p>
              </div>
            )}
          </div>
        </ChartCard>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`p-6 rounded-xl border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className={`text-sm font-medium ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Devis en cours
              </p>
              <p className={`text-2xl font-bold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {stats.devisEnCours}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className={`text-sm font-medium ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Bons de livraison
              </p>
              <p className={`text-2xl font-bold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {stats.bonsLivraison}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className={`text-sm font-medium ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Paiements récents
              </p>
              <p className={`text-2xl font-bold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {stats.paiementsRecents}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};