import React, { createContext, useContext, ReactNode, useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Client, Produit, Facture, Devis, BonLivraison, Paiement } from '../types';

interface AppContextType {
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  produits: Produit[];
  setProduits: React.Dispatch<React.SetStateAction<Produit[]>>;
  factures: Facture[];
  setFactures: React.Dispatch<React.SetStateAction<Facture[]>>;
  devis: Devis[];
  setDevis: React.Dispatch<React.SetStateAction<Devis[]>>;
  bonsLivraison: BonLivraison[];
  setBonsLivraison: React.Dispatch<React.SetStateAction<BonLivraison[]>>;
  paiements: Paiement[];
  setPaiements: React.Dispatch<React.SetStateAction<Paiement[]>>;
  currentPage: string;
  setCurrentPage: React.Dispatch<React.SetStateAction<string>>;
  darkMode: boolean;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
  recentActivities: RecentActivity[];
  addActivity: (activity: Omit<RecentActivity, 'id' | 'time'>) => void;
  notification: NotificationState;
  showNotification: (type: 'success' | 'error', message: string) => void;
  hideNotification: () => void;
}

interface RecentActivity {
  id: string;
  type: 'facture' | 'client' | 'produit' | 'paiement' | 'devis' | 'bonLivraison';
  description: string;
  time: Date;
}

interface NotificationState {
  isVisible: boolean;
  type: 'success' | 'error';
  message: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [clients, setClients] = useLocalStorage<Client[]>('ngbilling-clients', []);
  const [produits, setProduits] = useLocalStorage<Produit[]>('ngbilling-produits', []);
  const [factures, setFactures] = useLocalStorage<Facture[]>('ngbilling-factures', []);
  const [devis, setDevis] = useLocalStorage<Devis[]>('ngbilling-devis', []);
  const [bonsLivraison, setBonsLivraison] = useLocalStorage<BonLivraison[]>('ngbilling-bons-livraison', []);
  const [paiements, setPaiements] = useLocalStorage<Paiement[]>('ngbilling-paiements', []);
  const [currentPage, setCurrentPage] = useLocalStorage<string>('ngbilling-current-page', 'dashboard');
  const [darkMode, setDarkMode] = useLocalStorage<boolean>('ngbilling-dark-mode', false);
  const [recentActivities, setRecentActivities] = useLocalStorage<RecentActivity[]>('ngbilling-activities', []);
  
  const [notification, setNotification] = useState<NotificationState>({
    isVisible: false,
    type: 'success',
    message: ''
  });

  const addActivity = (activity: Omit<RecentActivity, 'id' | 'time'>) => {
    const newActivity: RecentActivity = {
      ...activity,
      id: Date.now().toString(),
      time: new Date()
    };
    setRecentActivities(prev => [newActivity, ...prev.slice(0, 9)]);
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({
      isVisible: true,
      type,
      message
    });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  };

  return (
    <AppContext.Provider
      value={{
        clients,
        setClients,
        produits,
        setProduits,
        factures,
        setFactures,
        devis,
        setDevis,
        bonsLivraison,
        setBonsLivraison,
        paiements,
        setPaiements,
        currentPage,
        setCurrentPage,
        darkMode,
        setDarkMode,
        recentActivities,
        addActivity,
        notification,
        showNotification,
        hideNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};