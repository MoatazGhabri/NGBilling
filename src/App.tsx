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
import { Modal } from './components/UI/Modal';
import { useState, useEffect, useRef, MutableRefObject } from 'react';

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

const TEN_MINUTES = 10 * 60; // seconds
const TIMER_KEY = 'session-timer';

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

  const { logout, user, login } = useAuth();

  // Timer state
  const [timer, setTimer] = useState(TEN_MINUTES);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Restore timer from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(TIMER_KEY);
    if (saved && !isNaN(Number(saved))) {
      setTimer(Number(saved));
    }
  }, []);

  // Save timer to localStorage on change
  useEffect(() => {
    localStorage.setItem(TIMER_KEY, timer.toString());
  }, [timer]);

  // Reset timer on user activity
  useEffect(() => {
    const resetTimer = () => setTimer(TEN_MINUTES);
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
    };
  }, []);

  // Countdown logic
  useEffect(() => {
    if (timer <= 0) {
      setShowPasswordDialog(true);
      return;
    }
    timerRef.current = setTimeout(() => setTimer(t => t - 1), 1000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timer]);

  // Handle password dialog submit
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await login({ email: user.email, password });
      setShowPasswordDialog(false);
      setPassword('');
      setPasswordError('');
      setTimer(TEN_MINUTES);
      localStorage.setItem(TIMER_KEY, TEN_MINUTES.toString());
    } catch {
      setPasswordError('Mot de passe incorrect.');
      setTimeout(() => {
        setShowPasswordDialog(false);
        setPassword('');
        setPasswordError('');
        localStorage.removeItem(TIMER_KEY);
        logout();
      }, 1200);
    }
  };

  // Handle dialog cancel (logout)
  const handleDialogCancel = () => {
    setShowPasswordDialog(false);
    setPassword('');
    setPasswordError('');
    localStorage.removeItem(TIMER_KEY);
    logout();
  };

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
      case 'settings':
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
        <Header onLogout={logout} timer={timer} />
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
        <Modal isOpen={showPasswordDialog} onClose={handleDialogCancel} title="Confirmer la session">
          <form onSubmit={handlePasswordSubmit}>
            <label className="block mb-2 font-medium">Veuillez entrer votre mot de passe pour continuer :</label>
            <input
              type="password"
              className="w-full px-3 py-2 border rounded-lg mb-2"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoFocus
              required
            />
            {passwordError && <div className="text-red-500 text-sm mb-2">{passwordError}</div>}
            <div className="flex justify-end space-x-2 mt-4">
              <button type="button" onClick={handleDialogCancel} className="px-4 py-2 bg-gray-300 rounded">Annuler</button>
              <button type="submit" className="px-4 py-2 bg-orange-sfaxien text-white rounded">Valider</button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <AuthProvider>
          <ProtectedRoute>
            <AppContent />
          </ProtectedRoute>
        </AuthProvider>
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;