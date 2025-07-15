import React, { useState } from 'react';
import { Plus, Users, Edit, Trash2, Mail, Phone, Loader } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Client } from '../types';
import { Modal } from '../components/UI/Modal';
import { ConfirmDialog } from '../components/UI/ConfirmDialog';
import { useClients, useCreateClient, useUpdateClient, useDeleteClient } from '../hooks/useApi';

export const Clients: React.FC = () => {
  const { darkMode, addActivity, showNotification } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; clientId: string }>({
    isOpen: false,
    clientId: ''
  });
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telephone: '',
    adresse: '',
    ville: '',
    codePostal: '',
    pays: '',
  });
  const [backendErrors, setBackendErrors] = useState<string[]>([]);

  // API hooks
  const { data: clients = [], isLoading, error } = useClients();
  const createClientMutation = useCreateClient();
  const updateClientMutation = useUpdateClient();
  const deleteClientMutation = useDeleteClient();

  const resetForm = () => {
    setFormData({
      nom: '',
      email: '',
      telephone: '',
      adresse: '',
      ville: '',
      codePostal: '',
      pays: '',
    });
    setBackendErrors([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBackendErrors([]);
    try {
      if (editingClient) {
        await updateClientMutation.mutateAsync({
          id: editingClient.id,
          client: {
            nom: formData.nom,
            email: formData.email,
            telephone: formData.telephone,
            adresse: formData.adresse,
            ville: formData.ville,
            codePostal: formData.codePostal,
            pays: formData.pays,
          }
        });
        addActivity({
          type: 'client',
          description: `Client ${formData.nom} modifié`
        });
        showNotification('success', 'Client modifié avec succès');
      } else {
        await createClientMutation.mutateAsync({
          nom: formData.nom,
          email: formData.email,
          telephone: formData.telephone,
          adresse: formData.adresse,
          ville: formData.ville,
          codePostal: formData.codePostal,
          pays: formData.pays,
          totalFacture: 0,
        });
        addActivity({
          type: 'client',
          description: `Nouveau client ajouté : ${formData.nom}`
        });
        showNotification('success', 'Client créé avec succès');
      }
      resetForm();
      setEditingClient(null);
      setShowModal(false);
    } catch (error: any) {
      // Gestion des erreurs détaillées du backend
      if (error?.response?.data?.errors) {
        setBackendErrors(error.response.data.errors.map((err: any) => err.msg));
      } else if (error?.response?.data?.message) {
        setBackendErrors([error.response.data.message]);
      } else {
        setBackendErrors(["Erreur lors de l'opération"]);
      }
      showNotification('error', 'Erreur lors de l\'opération');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const openNewClientModal = () => {
    resetForm();
    setEditingClient(null);
    setShowModal(true);
  };

  const openEditModal = (client: Client) => {
    setFormData({
      nom: client.nom,
      email: client.email,
      telephone: client.telephone,
      adresse: client.adresse,
      ville: client.ville,
      codePostal: client.codePostal,
      pays: client.pays,
    });
    setEditingClient(client);
    setShowModal(true);
  };

  const handleDeleteClient = async (id: string) => {
    try {
      await deleteClientMutation.mutateAsync(id);
      const client = clients.find(c => c.id === id);
      if (client) {
        addActivity({
          type: 'client',
          description: `Client ${client.nom} supprimé`
        });
      }
      showNotification('success', 'Client supprimé avec succès');
    } catch (error) {
      showNotification('error', 'Erreur lors de la suppression');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-orange-sfaxien mx-auto mb-4" />
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Chargement des clients...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
          <Users className="w-8 h-8 text-red-600" />
        </div>
        <h3 className={`text-lg font-medium mb-2 ${
          darkMode ? 'text-white' : 'text-bleu-nuit'
        }`}>
          Erreur de chargement
        </h3>
        <p className={`text-sm ${
          darkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Impossible de charger les clients. Veuillez réessayer.
        </p>
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
            Clients
          </h1>
          <p className={`text-sm mt-1 ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Gérez votre base clients et leur historique
          </p>
        </div>
        <button 
          onClick={openNewClientModal}
          className="px-4 py-2 bg-orange-sfaxien text-white rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau client</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client) => (
          <div key={client.id} className={`p-6 rounded-xl border ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } hover:shadow-lg transition-shadow`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className={`text-lg font-semibold ${
                  darkMode ? 'text-white' : 'text-bleu-nuit'
                }`}>
                  {client.nom}
                </h3>
                <p className={`text-sm mt-1 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Client depuis {new Date(client.dateCreation).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => openEditModal(client)}
                  className={`p-2 rounded-lg ${
                    darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  } transition-colors`}
                  title="Modifier"
                >
                  <Edit className="w-4 h-4 text-blue-500" />
                </button>
                <button 
                  onClick={() => setDeleteConfirm({ isOpen: true, clientId: client.id })}
                  className={`p-2 rounded-lg ${
                    darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  } transition-colors`}
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className={`text-sm ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {client.email}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className={`text-sm ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {client.telephone}
                </span>
              </div>
              
              <div className={`pt-3 border-t ${
                darkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <p className={`text-xs ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {client.adresse}
                </p>
                <p className={`text-xs ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {client.codePostal} {client.ville}, {client.pays}
                </p>
              </div>
              
              <div className={`pt-3 border-t ${
                darkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <p className={`text-xs ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Total facturé
                </p>
                <p className={`text-lg font-semibold ${
                  darkMode ? 'text-white' : 'text-bleu-nuit'
                }`}>
                                        {typeof client.totalFacture === 'number' ? client.totalFacture.toLocaleString() : '0'} TND
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {clients.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto bg-orange-sfaxien rounded-full flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h3 className={`text-lg font-medium mb-2 ${
            darkMode ? 'text-white' : 'text-bleu-nuit'
          }`}>
            Aucun client enregistré
          </h3>
          <p className={`text-sm ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Ajoutez votre premier client pour commencer
          </p>
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingClient(null);
          resetForm();
        }}
        title={editingClient ? 'Modifier le client' : 'Nouveau client'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {backendErrors.length > 0 && (
            <div className="bg-red-100 text-red-700 p-2 rounded mb-2">
              {backendErrors.map((err, idx) => (
                <div key={idx}>{err}</div>
              ))}
            </div>
          )}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Nom complet / Entreprise
            </label>
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              required
              className={`w-full px-3 py-2 border rounded-lg ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-orange-sfaxien`}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border rounded-lg ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-orange-sfaxien`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Téléphone
              </label>
              <input
                type="tel"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border rounded-lg ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-orange-sfaxien`}
              />
            </div>
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Adresse
            </label>
            <input
              type="text"
              name="adresse"
              value={formData.adresse}
              onChange={handleChange}
              required
              className={`w-full px-3 py-2 border rounded-lg ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-orange-sfaxien`}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Code postal
              </label>
              <input
                type="text"
                name="codePostal"
                value={formData.codePostal}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border rounded-lg ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-orange-sfaxien`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Ville
              </label>
              <input
                type="text"
                name="ville"
                value={formData.ville}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border rounded-lg ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-orange-sfaxien`}
              />
            </div>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Pays
            </label>
            <input
              type="text"
              name="pays"
              value={formData.pays}
              onChange={handleChange}
              required
              className={`w-full px-3 py-2 border rounded-lg ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-orange-sfaxien`}
            />
          </div>
          
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                setEditingClient(null);
                resetForm();
              }}
              className={`flex-1 py-2 px-4 border rounded-lg ${
                darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              } transition-colors`}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={createClientMutation.isLoading || updateClientMutation.isLoading}
              className="flex-1 py-2 px-4 bg-orange-sfaxien text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createClientMutation.isLoading || updateClientMutation.isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                  {editingClient ? 'Modification...' : 'Création...'}
                </div>
              ) : (
                editingClient ? 'Modifier' : 'Créer'
              )}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, clientId: '' })}
        onConfirm={() => handleDeleteClient(deleteConfirm.clientId)}
        title="Supprimer le client"
        message="Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible."
        confirmText="Supprimer"
      />
    </div>
  );
};