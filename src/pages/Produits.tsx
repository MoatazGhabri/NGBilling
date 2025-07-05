import React, { useState } from 'react';
import { Plus, Package, Edit, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Produit } from '../types';
import { Modal } from '../components/UI/Modal';
import { ConfirmDialog } from '../components/UI/ConfirmDialog';
import { useCreateProduct, useUpdateProduct, useProducts, useDeleteProduct } from '../hooks/useApi';

export const Produits: React.FC = () => {
  const { darkMode, addActivity, showNotification } = useApp();
  const { data: produits = [], isLoading, refetch } = useProducts();
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();
  const [showModal, setShowModal] = useState(false);
  const [editingProduit, setEditingProduit] = useState<Produit | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; produitId: string }>({
    isOpen: false,
    produitId: ''
  });
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    prix: '',
    categorie: '',
  });

  const resetForm = () => {
    setFormData({
      nom: '',
      description: '',
      prix: '',
      categorie: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const productPayload = {
      nom: formData.nom,
      description: formData.description,
      prix: parseFloat(formData.prix),
      categorie: formData.categorie,
      actif: true,
    };
    try {
      if (editingProduit) {
        await updateProductMutation.mutateAsync({ id: editingProduit.id, product: productPayload });
        addActivity({ type: 'produit', description: `Produit ${formData.nom} modifié` });
        showNotification('success', 'Produit modifié avec succès');
      } else {
        await createProductMutation.mutateAsync(productPayload);
        addActivity({ type: 'produit', description: `Nouveau produit ajouté : ${formData.nom}` });
        showNotification('success', 'Produit créé avec succès');
      }
      resetForm();
      setEditingProduit(null);
      setShowModal(false);
      refetch();
    } catch (error: any) {
      showNotification('error', error?.response?.data?.message || 'Erreur lors de la sauvegarde du produit');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const openNewProduitModal = () => {
    resetForm();
    setEditingProduit(null);
    setShowModal(true);
  };

  const openEditModal = (produit: Produit) => {
    setFormData({
      nom: produit.nom,
      description: produit.description,
      prix: produit.prix.toString(),
      categorie: produit.categorie,
    });
    setEditingProduit(produit);
    setShowModal(true);
  };

  const handleDeleteProduit = async (id: string) => {
    try {
      await deleteProductMutation.mutateAsync(id);
      addActivity({
        type: 'produit',
        description: `Produit supprimé`
      });
      showNotification('success', 'Produit supprimé avec succès');
      refetch();
    } catch (error: any) {
      showNotification('error', error?.response?.data?.message || 'Erreur lors de la suppression du produit');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-poppins font-bold ${
            darkMode ? 'text-white' : 'text-bleu-nuit'
          }`}>
            Produits
          </h1>
          <p className={`text-sm mt-1 ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Gérez votre catalogue de produits
          </p>
        </div>
        <button 
          onClick={openNewProduitModal}
          className="px-4 py-2 bg-orange-sfaxien text-white rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau produit</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {produits.map((produit) => (
          <div key={produit.id} className={`p-6 rounded-xl border ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } hover:shadow-lg transition-shadow`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className={`text-lg font-semibold ${
                  darkMode ? 'text-white' : 'text-bleu-nuit'
                }`}>
                  {produit.nom}
                </h3>
                <p className={`text-sm mt-1 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {produit.description}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => openEditModal(produit)}
                  className={`p-2 rounded-lg ${
                    darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  } transition-colors`}
                  title="Modifier"
                >
                  <Edit className="w-4 h-4 text-blue-500" />
                </button>
                <button 
                  onClick={() => setDeleteConfirm({ isOpen: true, produitId: produit.id })}
                  className={`p-2 rounded-lg ${
                    darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  } transition-colors`}
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className={`text-sm ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Prix unitaire
                </span>
                <span className={`font-medium ${
                  darkMode ? 'text-white' : 'text-bleu-nuit'
                }`}>
                  {Number(produit.prix).toFixed(3)}{'\u00A0'}TND
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className={`text-sm ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Catégorie
                </span>
                <span className={`text-sm px-2 py-1 rounded-full ${
                  darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                }`}>
                  {produit.categorie}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {produits.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto bg-orange-sfaxien rounded-full flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h3 className={`text-lg font-medium mb-2 ${
            darkMode ? 'text-white' : 'text-bleu-nuit'
          }`}>
            Aucun produit créé
          </h3>
          <p className={`text-sm ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Ajoutez votre premier produit pour commencer
          </p>
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingProduit(null);
          resetForm();
        }}
        title={editingProduit ? 'Modifier le produit' : 'Nouveau produit'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Nom du produit
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
          
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
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
                Prix (TND)
              </label>
              <input
                type="number"
                name="prix"
                value={formData.prix}
                onChange={handleChange}
                required
                step="0.01"
                className={`w-full px-3 py-2 border rounded-lg ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-orange-sfaxien`}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Catégorie
              </label>
              <input
                type="text"
                name="categorie"
                value={formData.categorie}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border rounded-lg ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-orange-sfaxien`}
              />
            </div>
          </div>
          
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                setEditingProduit(null);
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
              className="flex-1 py-2 px-4 bg-orange-sfaxien text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              {editingProduit ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, produitId: '' })}
        onConfirm={() => handleDeleteProduit(deleteConfirm.produitId)}
        title="Supprimer le produit"
        message="Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible."
        confirmText="Supprimer"
      />
    </div>
  );
};