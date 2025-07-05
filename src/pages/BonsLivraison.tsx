import React, { useState } from 'react';
import { Plus, FileEdit, Edit, Trash2, Eye, FileText, Download } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BonLivraison } from '../types';
import { Modal } from '../components/UI/Modal';
import { ConfirmDialog } from '../components/UI/ConfirmDialog';
import { BonLivraisonForm } from '../components/Forms/BonLivraisonForm';
import { useBonsLivraison, useCreateBonLivraison, useUpdateBonLivraison, useDeleteBonLivraison } from '../hooks/useApi';
import { bonsLivraisonAPI } from '../utils/api';

export const BonsLivraison: React.FC = () => {
  const { darkMode, addActivity, showNotification } = useApp();
  const { data: bonsLivraison = [], isLoading, refetch } = useBonsLivraison();
  const createBonLivraisonMutation = useCreateBonLivraison();
  const updateBonLivraisonMutation = useUpdateBonLivraison();
  const deleteBonLivraisonMutation = useDeleteBonLivraison();
  
  const [showModal, setShowModal] = useState(false);
  const [editingBonLivraison, setEditingBonLivraison] = useState<BonLivraison | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; bonLivraisonId: string }>({
    isOpen: false,
    bonLivraisonId: ''
  });

  const handleCreateBonLivraison = async (bonLivraisonData: Omit<BonLivraison, 'id'>) => {
    try {
      await createBonLivraisonMutation.mutateAsync(bonLivraisonData);
      addActivity({
        type: 'bonLivraison',
        description: `Bon de livraison ${bonLivraisonData.numero} créé pour ${bonLivraisonData.clientNom}`
      });
      showNotification('success', 'Bon de livraison créé avec succès');
      setShowModal(false);
      refetch();
    } catch (error: any) {
      showNotification('error', error?.response?.data?.message || 'Erreur lors de la création du bon de livraison');
    }
  };

  const handleEditBonLivraison = async (bonLivraisonData: Omit<BonLivraison, 'id'>) => {
    if (!editingBonLivraison) return;
    
    try {
      await updateBonLivraisonMutation.mutateAsync({ id: editingBonLivraison.id, bonLivraison: bonLivraisonData });
      addActivity({
        type: 'bonLivraison',
        description: `Bon de livraison ${bonLivraisonData.numero} modifié`
      });
      showNotification('success', 'Bon de livraison modifié avec succès');
      setEditingBonLivraison(null);
      setShowModal(false);
      refetch();
    } catch (error: any) {
      showNotification('error', error?.response?.data?.message || 'Erreur lors de la modification du bon de livraison');
    }
  };

  const handleDeleteBonLivraison = async (id: string) => {
    try {
      await deleteBonLivraisonMutation.mutateAsync(id);
      addActivity({
        type: 'bonLivraison',
        description: `Bon de livraison supprimé`
      });
      showNotification('success', 'Bon de livraison supprimé avec succès');
      refetch();
    } catch (error: any) {
      showNotification('error', error?.response?.data?.message || 'Erreur lors de la suppression du bon de livraison');
    }
  };

  const handleGeneratePDF = async (bonLivraisonItem: BonLivraison) => {
    try {
      const pdfBlob = await bonsLivraisonAPI.generatePDF(bonLivraisonItem.id);
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bon-livraison-${bonLivraisonItem.numero}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      addActivity({
        type: 'bonLivraison',
        description: `PDF du bon de livraison ${bonLivraisonItem.numero} généré`
      });
      showNotification('success', 'PDF généré avec succès');
    } catch (error: any) {
      showNotification('error', 'Erreur lors de la génération du PDF');
    }
  };

  const openNewBonLivraisonModal = () => {
    setEditingBonLivraison(null);
    setShowModal(true);
  };

  const openEditModal = (bonLivraisonItem: BonLivraison) => {
    setEditingBonLivraison(bonLivraisonItem);
    setShowModal(true);
  };

  const getStatusColor = (status: BonLivraison['statut']) => {
    switch (status) {
      case 'prepare': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'expediee': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'livree': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: BonLivraison['statut']) => {
    switch (status) {
      case 'prepare': return 'Préparé';
      case 'expediee': return 'Expédié';
      case 'livree': return 'Livré';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-sfaxien mx-auto mb-4"></div>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Chargement des bons de livraison...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-poppins font-bold ${
            darkMode ? 'text-white' : 'text-bleu-nuit'
          }`}>
            Bons de Livraison
          </h1>
          <p className={`text-sm mt-1 ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Créez et gérez vos bons de livraison
          </p>
        </div>
        <button 
          onClick={openNewBonLivraisonModal}
          className="px-4 py-2 bg-orange-sfaxien text-white rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau bon de livraison</span>
        </button>
      </div>

      {bonsLivraison.length > 0 ? (
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
                    Numéro
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Client
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Date création
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Date livraison
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
                {bonsLivraison.map((bonLivraisonItem) => (
                  <tr key={bonLivraisonItem.id} className={`hover:${
                    darkMode ? 'bg-gray-700' : 'bg-gray-50'
                  } transition-colors`}>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      darkMode ? 'text-white' : 'text-bleu-nuit'
                    }`}>
                      {bonLivraisonItem.numero}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      darkMode ? 'text-gray-300' : 'text-gray-900'
                    }`}>
                      {bonLivraisonItem.clientNom}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      darkMode ? 'text-gray-300' : 'text-gray-900'
                    }`}>
                      {new Date(bonLivraisonItem.dateCreation).toLocaleDateString()}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      darkMode ? 'text-gray-300' : 'text-gray-900'
                    }`}>
                      {new Date(bonLivraisonItem.dateLivraison).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(bonLivraisonItem.statut)}`}>
                        {getStatusLabel(bonLivraisonItem.statut)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openEditModal(bonLivraisonItem)}
                          className={`p-2 rounded-lg ${
                            darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                          } transition-colors`}
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4 text-blue-500" />
                        </button>
                        <button
                          onClick={() => handleGeneratePDF(bonLivraisonItem)}
                          className={`p-2 rounded-lg ${
                            darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                          } transition-colors`}
                          title="Télécharger PDF"
                        >
                          <Download className="w-4 h-4 text-green-500" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ isOpen: true, bonLivraisonId: bonLivraisonItem.id })}
                          className={`p-2 rounded-lg ${
                            darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
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
        <div className={`text-center py-12 ${
          darkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">Aucun bon de livraison</h3>
          <p className="text-sm">Commencez par créer votre premier bon de livraison</p>
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingBonLivraison ? 'Modifier le bon de livraison' : 'Nouveau bon de livraison'}
      >
        <BonLivraisonForm
          onSubmit={editingBonLivraison ? handleEditBonLivraison : handleCreateBonLivraison}
          onCancel={() => setShowModal(false)}
          initialData={editingBonLivraison || undefined}
        />
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, bonLivraisonId: '' })}
        onConfirm={() => {
          handleDeleteBonLivraison(deleteConfirm.bonLivraisonId);
          setDeleteConfirm({ isOpen: false, bonLivraisonId: '' });
        }}
        title="Supprimer le bon de livraison"
        message="Êtes-vous sûr de vouloir supprimer ce bon de livraison ? Cette action est irréversible."
      />
    </div>
  );
};