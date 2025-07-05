import React, { useState } from 'react';
import { Plus, FileEdit, Edit, Trash2, Eye, FileText, Download } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Devis as DevisType } from '../types';
import { Modal } from '../components/UI/Modal';
import { ConfirmDialog } from '../components/UI/ConfirmDialog';
import { DevisForm } from '../components/Forms/DevisForm';
import { useDevis, useCreateDevis, useUpdateDevis, useDeleteDevis } from '../hooks/useApi';
import { devisAPI } from '../utils/api';

export const Devis: React.FC = () => {
  const { darkMode, addActivity, showNotification } = useApp();
  const { data: devis = [], isLoading, refetch } = useDevis();
  const createDevisMutation = useCreateDevis();
  const updateDevisMutation = useUpdateDevis();
  const deleteDevisMutation = useDeleteDevis();
  
  const [showModal, setShowModal] = useState(false);
  const [editingDevis, setEditingDevis] = useState<DevisType | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; devisId: string }>({
    isOpen: false,
    devisId: ''
  });

  const handleCreateDevis = async (devisData: Omit<DevisType, 'id'>) => {
    try {
      await createDevisMutation.mutateAsync(devisData);
      addActivity({
        type: 'devis',
        description: `Devis ${devisData.numero} créé pour ${devisData.clientNom}`
      });
      showNotification('success', 'Devis créé avec succès');
      setShowModal(false);
      refetch();
    } catch (error: any) {
      showNotification('error', error?.response?.data?.message || 'Erreur lors de la création du devis');
    }
  };

  const handleEditDevis = async (devisData: Omit<DevisType, 'id'>) => {
    if (!editingDevis) return;
    
    try {
      await updateDevisMutation.mutateAsync({ id: editingDevis.id, devis: devisData });
      addActivity({
        type: 'devis',
        description: `Devis ${devisData.numero} modifié`
      });
      showNotification('success', 'Devis modifié avec succès');
      setEditingDevis(null);
      setShowModal(false);
      refetch();
    } catch (error: any) {
      showNotification('error', error?.response?.data?.message || 'Erreur lors de la modification du devis');
    }
  };

  const handleDeleteDevis = async (id: string) => {
    try {
      await deleteDevisMutation.mutateAsync(id);
      addActivity({
        type: 'devis',
        description: `Devis supprimé`
      });
      showNotification('success', 'Devis supprimé avec succès');
      refetch();
    } catch (error: any) {
      showNotification('error', error?.response?.data?.message || 'Erreur lors de la suppression du devis');
    }
  };

  const handleGeneratePDF = async (devisItem: DevisType) => {
    try {
      const pdfBlob = await devisAPI.generatePDF(devisItem.id);
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `devis-${devisItem.numero}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      addActivity({
        type: 'devis',
        description: `PDF du devis ${devisItem.numero} généré`
      });
      showNotification('success', 'PDF généré avec succès');
    } catch (error: any) {
      showNotification('error', 'Erreur lors de la génération du PDF');
    }
  };

  const openNewDevisModal = () => {
    setEditingDevis(null);
    setShowModal(true);
  };

  const openEditModal = (devisItem: DevisType) => {
    setEditingDevis(devisItem);
    setShowModal(true);
  };

  const getStatusColor = (status: DevisType['statut']) => {
    switch (status) {
      case 'brouillon': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      case 'envoye': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'accepte': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'refuse': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'expire': return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: DevisType['statut']) => {
    switch (status) {
      case 'brouillon': return 'Brouillon';
      case 'envoye': return 'Envoyé';
      case 'accepte': return 'Accepté';
      case 'refuse': return 'Refusé';
      case 'expire': return 'Expiré';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-sfaxien mx-auto mb-4"></div>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Chargement des devis...
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
            Devis
          </h1>
          <p className={`text-sm mt-1 ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Créez et gérez vos devis
          </p>
        </div>
        <button 
          onClick={openNewDevisModal}
          className="px-4 py-2 bg-orange-sfaxien text-white rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau devis</span>
        </button>
      </div>

      {devis.length > 0 ? (
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
                    Expiration
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Montant
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
                {devis.map((devisItem) => (
                  <tr key={devisItem.id} className={`hover:${
                    darkMode ? 'bg-gray-700' : 'bg-gray-50'
                  } transition-colors`}>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      darkMode ? 'text-white' : 'text-bleu-nuit'
                    }`}>
                      {devisItem.numero}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      darkMode ? 'text-gray-300' : 'text-gray-900'
                    }`}>
                      {devisItem.clientNom}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      darkMode ? 'text-gray-300' : 'text-gray-900'
                    }`}>
                      {new Date(devisItem.dateCreation).toLocaleDateString()}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      darkMode ? 'text-gray-300' : 'text-gray-900'
                    }`}>
                      {new Date(devisItem.dateExpiration).toLocaleDateString()}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      darkMode ? 'text-white' : 'text-bleu-nuit'
                    }`}>
                      {Number(devisItem.total).toFixed(2)} TND
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(devisItem.statut)}`}>
                        {getStatusLabel(devisItem.statut)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openEditModal(devisItem)}
                          className={`p-2 rounded-lg ${
                            darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                          } transition-colors`}
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4 text-blue-500" />
                        </button>
                        <button
                          onClick={() => handleGeneratePDF(devisItem)}
                          className={`p-2 rounded-lg ${
                            darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                          } transition-colors`}
                          title="Télécharger PDF"
                        >
                          <Download className="w-4 h-4 text-green-500" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ isOpen: true, devisId: devisItem.id })}
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
          <h3 className="text-lg font-medium mb-2">Aucun devis</h3>
          <p className="text-sm">Commencez par créer votre premier devis</p>
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingDevis ? 'Modifier le devis' : 'Nouveau devis'}
      >
        <DevisForm
          onSubmit={editingDevis ? handleEditDevis : handleCreateDevis}
          onCancel={() => setShowModal(false)}
          initialData={editingDevis || undefined}
        />
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, devisId: '' })}
        onConfirm={() => {
          handleDeleteDevis(deleteConfirm.devisId);
          setDeleteConfirm({ isOpen: false, devisId: '' });
        }}
        title="Supprimer le devis"
        message="Êtes-vous sûr de vouloir supprimer ce devis ? Cette action est irréversible."
      />
    </div>
  );
};