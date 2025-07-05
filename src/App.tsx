import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { Dashboard } from './pages/Dashboard';
import { Factures } from './pages/Factures';
import { Devis } from './pages/Devis';
import { BonsLivraison } from './pages/BonsLivraison';
import { Paiements } from './pages/Paiements';
import { Produits } from './pages/Produits';
import { Clients } from './pages/Clients';
import { Rapports } from './pages/Rapports';
import { Parametres } from './pages/Parametres';
import { Notification } from './components/UI/Notification';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const AppContent: React.FC = () => {
  const { 
    currentPage, 
    darkMode, 
    clients, 
    setClients, 
    produits, 
    setProduits, 
    factures, 
    setFactures,
    notification,
    hideNotification
  } = useApp();

  const { logout } = useAuth();

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'factures':
        return <Factures />;
      case 'devis':
        return <Devis />;
      case 'bons-livraison':
        return <BonsLivraison />;
      case 'paiements':
        return <Paiements />;
      case 'produits':
        return <Produits />;
      case 'clients':
        return <Clients />;
      case 'rapports':
        return <Rapports />;
      case 'parametres':
        return <Parametres />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className={`${darkMode ? 'dark' : ''}`}>
      <div className={`min-h-screen ${
        darkMode ? 'bg-gray-900' : 'bg-blanc-sable'
      } transition-colors duration-200`}>
        <Sidebar />
        <Header onLogout={logout} />
        <main className="ml-64 pt-20 p-6">
          <div className="max-w-7xl mx-auto">
            {renderCurrentPage()}
          </div>
        </main>
        
        <Notification
          type={notification.type}
          message={notification.message}
          isVisible={notification.isVisible}
          onClose={hideNotification}
        />
      </div>
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ProtectedRoute>
          <AppProvider>
            <AppContent />
          </AppProvider>
        </ProtectedRoute>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;