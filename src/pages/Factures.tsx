import React, { useState, useMemo } from 'react';
import { Plus, Search, Filter, Download, Mail, Eye, Edit, Trash2, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Facture } from '../types';
import { Modal } from '../components/UI/Modal';
import { ConfirmDialog } from '../components/UI/ConfirmDialog';
import { FactureForm } from '../components/Forms/FactureForm';
import { useInvoices, useCreateInvoice, useUpdateInvoice, useDeleteInvoice } from '../hooks/useApi';
import { invoicesAPI } from '../utils/api';

export const Factures: React.FC = () => {
  const { darkMode, addActivity, showNotification } = useApp();
  const { data: factures = [], isLoading, refetch } = useInvoices();
  const createInvoiceMutation = useCreateInvoice();
  const updateInvoiceMutation = useUpdateInvoice();
  const deleteInvoiceMutation = useDeleteInvoice();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingFacture, setEditingFacture] = useState<Facture | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; factureId: string }>({
    isOpen: false,
    factureId: ''
  });

  const filteredFactures = factures.filter(facture => {
    const matchesSearch = facture.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         facture.clientNom.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || facture.statut === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateFacture = async (factureData: Omit<Facture, 'id'>) => {
    try {
      await createInvoiceMutation.mutateAsync(factureData);
      addActivity({
        type: 'facture',
        description: `Facture ${factureData.numero} créée pour ${factureData.clientNom}`
      });
      showNotification('success', 'Facture créée avec succès');
      setShowModal(false);
      refetch();
    } catch (error: any) {
      showNotification('error', error?.response?.data?.message || 'Erreur lors de la création de la facture');
    }
  };

  const handleEditFacture = async (factureData: Omit<Facture, 'id'>) => {
    if (!editingFacture) return;
    
    try {
      await updateInvoiceMutation.mutateAsync({ id: editingFacture.id, invoice: factureData });
      addActivity({
        type: 'facture',
        description: `Facture ${factureData.numero} modifiée`
      });
      showNotification('success', 'Facture modifiée avec succès');
      setEditingFacture(null);
      setShowModal(false);
      refetch();
    } catch (error: any) {
      showNotification('error', error?.response?.data?.message || 'Erreur lors de la modification de la facture');
    }
  };

  const handleDeleteFacture = async (id: string) => {
    try {
      await deleteInvoiceMutation.mutateAsync(id);
      addActivity({
        type: 'facture',
        description: `Facture supprimée`
      });
      showNotification('success', 'Facture supprimée avec succès');
      refetch();
    } catch (error: any) {
      showNotification('error', error?.response?.data?.message || 'Erreur lors de la suppression de la facture');
    }
  };

  const handleGeneratePDF = async (facture: Facture) => {
    try {
      const pdfBlob = await invoicesAPI.generatePDF(facture.id);
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `facture-${facture.numero}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      addActivity({
        type: 'facture',
        description: `PDF de la facture ${facture.numero} généré`
      });
      showNotification('success', 'PDF généré avec succès');
    } catch (error: any) {
      showNotification('error', 'Erreur lors de la génération du PDF');
    }
  };

  const openNewFactureModal = () => {
    setEditingFacture(null);
    setShowModal(true);
  };

  const openEditModal = (facture: Facture) => {
    setEditingFacture(facture);
    setShowModal(true);
  };

  const getStatusColor = (status: Facture['statut']) => {
    switch (status) {
      case 'brouillon': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      case 'envoyee': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'payee': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'en_retard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'annulee': return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: Facture['statut']) => {
    switch (status) {
      case 'brouillon': return 'Brouillon';
      case 'envoyee': return 'Envoyée';
      case 'payee': return 'Payée';
      case 'en_retard': return 'En retard';
      case 'annulee': return 'Annulée';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-sfaxien mx-auto mb-4"></div>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Chargement des factures...
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
            Factures
          </h1>
          <p className={`text-sm mt-1 ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Gérez vos factures et suivez leur statut
          </p>
        </div>
        <button 
          onClick={openNewFactureModal}
          className="px-4 py-2 bg-orange-sfaxien text-white rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle facture</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par numéro ou client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`pl-10 pr-4 py-2 w-full rounded-lg border ${
              darkMode 
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-bleu-nuit placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-orange-sfaxien focus:border-transparent`}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={`px-4 py-2 rounded-lg border ${
            darkMode 
              ? 'bg-gray-800 border-gray-600 text-white' 
              : 'bg-white border-gray-300 text-bleu-nuit'
          } focus:outline-none focus:ring-2 focus:ring-orange-sfaxien focus:border-transparent`}
        >
          <option value="all">Tous les statuts</option>
          <option value="brouillon">Brouillon</option>
          <option value="envoyee">Envoyée</option>
          <option value="payee">Payée</option>
          <option value="en_retard">En retard</option>
          <option value="annulee">Annulée</option>
        </select>
      </div>

      {filteredFactures.length > 0 ? (
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
                    Date
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Échéance
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
                {filteredFactures.map((facture) => (
                  <tr key={facture.id} className={`hover:${
                    darkMode ? 'bg-gray-700' : 'bg-gray-50'
                  } transition-colors`}>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      darkMode ? 'text-white' : 'text-bleu-nuit'
                    }`}>
                      {facture.numero}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      darkMode ? 'text-gray-300' : 'text-gray-900'
                    }`}>
                      {facture.clientNom}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      darkMode ? 'text-gray-300' : 'text-gray-900'
                    }`}>
                      {new Date(facture.dateCreation).toLocaleDateString()}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      darkMode ? 'text-gray-300' : 'text-gray-900'
                    }`}>
                      {new Date(facture.dateEcheance).toLocaleDateString()}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      darkMode ? 'text-white' : 'text-bleu-nuit'
                    }`}>
                      {(facture.appliquerTVA === false
  ? (Number(facture.sousTotal) - Number(facture.remiseTotale || 0)).toFixed(2)
  : Number(facture.total).toFixed(2))} TND
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(facture.statut)}`}>
                        {getStatusLabel(facture.statut)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openEditModal(facture)}
                          className={`p-2 rounded-lg ${
                            darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                          } transition-colors`}
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4 text-blue-500" />
                        </button>
                        <button
                          onClick={() => handleGeneratePDF(facture)}
                          className={`p-2 rounded-lg ${
                            darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                          } transition-colors`}
                          title="Télécharger PDF"
                        >
                          <Download className="w-4 h-4 text-green-500" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ isOpen: true, factureId: facture.id })}
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
          <h3 className="text-lg font-medium mb-2">Aucune facture</h3>
          <p className="text-sm">Commencez par créer votre première facture</p>
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingFacture ? 'Modifier la facture' : 'Nouvelle facture'}
      >
        <FactureForm
          onSubmit={editingFacture ? handleEditFacture : handleCreateFacture}
          onCancel={() => setShowModal(false)}
          initialData={editingFacture || undefined}
        />
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, factureId: '' })}
        onConfirm={() => {
          handleDeleteFacture(deleteConfirm.factureId);
          setDeleteConfirm({ isOpen: false, factureId: '' });
        }}
        title="Supprimer la facture"
        message="Êtes-vous sûr de vouloir supprimer cette facture ? Cette action est irréversible."
      />
    </div>
  );
};