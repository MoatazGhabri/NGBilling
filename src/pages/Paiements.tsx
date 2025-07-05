import React, { useState } from 'react';
import { Plus, CreditCard, Edit, Trash2, Eye } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Paiement } from '../types';
import { Modal } from '../components/UI/Modal';
import { ConfirmDialog } from '../components/UI/ConfirmDialog';
import { PaiementForm } from '../components/Forms/PaiementForm';

export const Paiements: React.FC = () => {
  const { 
    paiements, 
    setPaiements, 
    factures,
    darkMode, 
    addActivity, 
    showNotification 
  } = useApp();
  
  const [showModal, setShowModal] = useState(false);
  const [editingPaiement, setEditingPaiement] = useState<Paiement | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; paiementId: string }>({
    isOpen: false,
    paiementId: ''
  });

  const handleCreatePaiement = (paiementData: Omit<Paiement, 'id'>) => {
    const newPaiement: Paiement = {
      ...paiementData,
      id: Date.now().toString()
    };
    
    setPaiements(prev => [...prev, newPaiement]);
    
    const facture = factures.find(f => f.id === paiementData.factureId);
    addActivity({
      type: 'paiement',
              description: `Paiement de ${paiementData.montant}TND reçu${facture ? ` pour ${facture.numero}` : ''}`
    });
    showNotification('success', 'Paiement enregistré avec succès');
    setShowModal(false);
  };

  const handleEditPaiement = (paiementData: Omit<Paiement, 'id'>) => {
    if (!editingPaiement) return;
    
    const updatedPaiement: Paiement = {
      ...paiementData,
      id: editingPaiement.id
    };
    
    setPaiements(prev => prev.map(p => p.id === editingPaiement.id ? updatedPaiement : p));
    addActivity({
      type: 'paiement',
              description: `Paiement de ${paiementData.montant}TND modifié`
    });
    showNotification('success', 'Paiement modifié avec succès');
    setEditingPaiement(null);
    setShowModal(false);
  };

  const handleDeletePaiement = (id: string) => {
    const paiement = paiements.find(p => p.id === id);
    if (!paiement) return;
    
    setPaiements(prev => prev.filter(p => p.id !== id));
    addActivity({
      type: 'paiement',
              description: `Paiement de ${paiement.montant}TND supprimé`
    });
    showNotification('success', 'Paiement supprimé avec succès');
  };

  const openNewPaiementModal = () => {
    setEditingPaiement(null);
    setShowModal(true);
  };

  const openEditModal = (paiement: Paiement) => {
    setEditingPaiement(paiement);
    setShowModal(true);
  };

  const getFactureNumero = (factureId: string) => {
    const facture = factures.find(f => f.id === factureId);
    return facture ? facture.numero : 'Facture supprimée';
  };

  const getMethodeLabel = (methode: Paiement['methode']) => {
    switch (methode) {
      case 'especes': return 'Espèces';
      case 'carte': return 'Carte bancaire';
      case 'virement': return 'Virement';
      case 'cheque': return 'Chèque';
      case 'paypal': return 'PayPal';
      case 'stripe': return 'Stripe';
      default: return methode;
    }
  };

  const getStatutColor = (statut: Paiement['statut']) => {
    switch (statut) {
      case 'en_attente': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'confirme': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'refuse': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatutLabel = (statut: Paiement['statut']) => {
    switch (statut) {
      case 'en_attente': return 'En attente';
      case 'confirme': return 'Confirmé';
      case 'refuse': return 'Refusé';
      default: return statut;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-poppins font-bold ${
            darkMode ? 'text-white' : 'text-bleu-nuit'
          }`}>
            Paiements
          </h1>
          <p className={`text-sm mt-1 ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Suivez vos paiements et transactions
          </p>
        </div>
        <button 
          onClick={openNewPaiementModal}
          className="px-4 py-2 bg-orange-sfaxien text-white rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau paiement</span>
        </button>
      </div>

      {paiements.length > 0 ? (
        <div className={`rounded-xl border overflow-hidden ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${
                darkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Facture
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Montant
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Date
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Méthode
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Référence
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Statut
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${
                darkMode ? 'divide-gray-700' : 'divide-gray-200'
              }`}>
                {paiements.map((paiement) => (
                  <tr key={paiement.id} className={`hover:${
                    darkMode ? 'bg-gray-700' : 'bg-gray-50'
                  } transition-colors`}>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      darkMode ? 'text-white' : 'text-bleu-nuit'
                    }`}>
                      {getFactureNumero(paiement.factureId)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      darkMode ? 'text-white' : 'text-bleu-nuit'
                    }`}>
                      {typeof paiement.montant === 'number' ? paiement.montant.toLocaleString() : '0'} TND
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      darkMode ? 'text-gray-300' : 'text-gray-900'
                    }`}>
                      {new Date(paiement.datePaiement).toLocaleDateString()}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      darkMode ? 'text-gray-300' : 'text-gray-900'
                    }`}>
                      {getMethodeLabel(paiement.methode)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      darkMode ? 'text-gray-300' : 'text-gray-900'
                    }`}>
                      {paiement.reference || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        getStatutColor(paiement.statut)
                      }`}>
                        {getStatutLabel(paiement.statut)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => openEditModal(paiement)}
                          className={`p-1 rounded hover:${
                            darkMode ? 'bg-gray-700' : 'bg-gray-100'
                          } transition-colors`}
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4 text-blue-500" />
                        </button>
                        <button className={`p-1 rounded hover:${
                          darkMode ? 'bg-gray-700' : 'bg-gray-100'
                        } transition-colors`}
                        title="Voir détails"
                        >
                          <Eye className="w-4 h-4 text-gray-500" />
                        </button>
                        <button 
                          onClick={() => setDeleteConfirm({ isOpen: true, paiementId: paiement.id })}
                          className={`p-1 rounded hover:${
                            darkMode ? 'bg-gray-700' : 'bg-gray-100'
                          } transition-colors`}
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto bg-orange-sfaxien rounded-full flex items-center justify-center mb-4">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <h3 className={`text-lg font-medium mb-2 ${
            darkMode ? 'text-white' : 'text-bleu-nuit'
          }`}>
            Aucun paiement enregistré
          </h3>
          <p className={`text-sm ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Enregistrez votre premier paiement
          </p>
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingPaiement(null);
        }}
        title={editingPaiement ? 'Modifier le paiement' : 'Nouveau paiement'}
        size="lg"
      >
        <PaiementForm
          onSubmit={editingPaiement ? handleEditPaiement : handleCreatePaiement}
          onCancel={() => {
            setShowModal(false);
            setEditingPaiement(null);
          }}
          initialData={editingPaiement || undefined}
        />
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, paiementId: '' })}
        onConfirm={() => handleDeletePaiement(deleteConfirm.paiementId)}
        title="Supprimer le paiement"
        message="Êtes-vous sûr de vouloir supprimer ce paiement ? Cette action est irréversible."
        confirmText="Supprimer"
      />
    </div>
  );
};