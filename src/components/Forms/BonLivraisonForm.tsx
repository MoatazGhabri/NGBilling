import React, { useState } from 'react';
import { Plus, Trash2, Loader } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useClients, useProducts } from '../../hooks/useApi';
import { BonLivraison, LigneDocument } from '../../types';

interface BonLivraisonFormProps {
  onSubmit: (bonLivraison: Omit<BonLivraison, 'id'>) => void;
  onCancel: () => void;
  initialData?: BonLivraison;
}

export const BonLivraisonForm: React.FC<BonLivraisonFormProps> = ({
  onSubmit,
  onCancel,
  initialData
}) => {
  const { darkMode } = useApp();
  const { data: clients = [], isLoading: clientsLoading } = useClients();
  const { data: produits = [], isLoading: productsLoading } = useProducts();
  const [formData, setFormData] = useState({
    numero: initialData?.numero || `BL-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
    clientId: initialData?.clientId || '',
    dateCreation: initialData?.dateCreation ? new Date(initialData.dateCreation).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    dateLivraison: initialData?.dateLivraison ? new Date(initialData.dateLivraison).toISOString().split('T')[0] : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    statut: initialData?.statut || 'prepare' as const,
    notes: initialData?.notes || ''
  });

  const [lignes, setLignes] = useState<LigneDocument[]>(
    initialData?.lignes || [{
      id: '1',
      produitId: '',
      produitNom: '',
      quantite: 1,
      prixUnitaire: 0,
      total: 0
    }]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLigneChange = (index: number, field: keyof LigneDocument, value: string | number) => {
    const newLignes = [...lignes];
    let parsedValue = value;
    if (typeof value === 'string') {
      // Replace comma with dot for decimal separator
      parsedValue = value.replace(',', '.');
      if (field === 'prixUnitaire' || field === 'quantite') {
        parsedValue = parseFloat(parsedValue) || 0;
      }
    }
    newLignes[index] = { ...newLignes[index], [field]: parsedValue };

    if (field === 'produitId') {
      const produit = produits.find(p => p.id === value);
      console.log('Selected produit:', produit);
      if (produit) {
        newLignes[index].produitNom = produit.nom;
        // Always parse prix as float (handle comma or dot)
        let prix = 0;
        if (typeof produit.prix === 'string') {
          prix = parseFloat(String(produit.prix).replace(',', '.'));
        } else if (typeof produit.prix === 'number') {
          prix = produit.prix;
        }
        newLignes[index].prixUnitaire = prix;
        newLignes[index].total =
          (typeof newLignes[index].quantite === 'number' ? newLignes[index].quantite : 0) *
          prix;
      }
    } else {
      newLignes[index].total =
        (typeof newLignes[index].quantite === 'number' ? newLignes[index].quantite : 0) *
        (typeof newLignes[index].prixUnitaire === 'number' ? newLignes[index].prixUnitaire : 0);
    }

    setLignes(newLignes);
  };

  const addLigne = () => {
    setLignes([...lignes, {
      id: Date.now().toString(),
      produitId: '',
      produitNom: '',
      quantite: 1,
      prixUnitaire: 0,
      total: 0
    }]);
  };

  const removeLigne = (index: number) => {
    if (lignes.length > 1) {
      setLignes(lignes.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find(c => c.id === formData.clientId);
    if (!client) return;

    onSubmit({
      numero: formData.numero,
      clientId: formData.clientId,
      clientNom: client.nom,
      dateCreation: new Date(formData.dateCreation),
      dateLivraison: new Date(formData.dateLivraison),
      statut: formData.statut,
      lignes,
      notes: formData.notes
    });
  };

  // Show loading state if data is still loading
  if (clientsLoading || productsLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-orange-sfaxien mx-auto mb-4" />
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Chargement des données...
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Numéro de bon de livraison
          </label>
          <input
            type="text"
            name="numero"
            value={formData.numero}
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
            Client
          </label>
          <select
            name="clientId"
            value={formData.clientId}
            onChange={handleChange}
            required
            className={`w-full px-3 py-2 border rounded-lg ${
              darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-orange-sfaxien`}
          >
            <option value="">Sélectionner un client</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>{client.nom}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Date de création
          </label>
          <input
            type="date"
            name="dateCreation"
            value={formData.dateCreation}
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
            Date de livraison
          </label>
          <input
            type="date"
            name="dateLivraison"
            value={formData.dateLivraison}
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
            Statut
          </label>
          <select
            name="statut"
            value={formData.statut}
            onChange={handleChange}
            required
            className={`w-full px-3 py-2 border rounded-lg ${
              darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-orange-sfaxien`}
          >
            <option value="prepare">Préparé</option>
            <option value="expediee">Expédié</option>
            <option value="livree">Livré</option>
          </select>
        </div>
      </div>

      <div>
        <label className={`block text-sm font-medium mb-2 ${
          darkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Notes
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className={`w-full px-3 py-2 border rounded-lg ${
            darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-orange-sfaxien`}
          placeholder="Notes additionnelles..."
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-medium ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Produits
          </h3>
          <button
            type="button"
            onClick={addLigne}
            className="flex items-center space-x-2 px-3 py-1 text-sm bg-orange-sfaxien text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un produit</span>
          </button>
        </div>

        <div className="space-y-4">
          {lignes.map((ligne, index) => (
            <div key={ligne.id} className={`p-4 border rounded-lg ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Produit
                  </label>
                  <select
                    value={ligne.produitId}
                    onChange={(e) => handleLigneChange(index, 'produitId', e.target.value)}
                    required
                    className={`w-full px-3 py-2 border rounded-lg ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-orange-sfaxien`}
                  >
                    <option value="">Sélectionner un produit</option>
                    {produits.map(produit => (
                      <option key={produit.id} value={produit.id}>{produit.nom}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Quantité
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={ligne.quantite}
                    onChange={(e) => handleLigneChange(index, 'quantite', parseInt(e.target.value))}
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
                    Prix unitaire (TND)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={ligne.prixUnitaire}
                    onChange={(e) => handleLigneChange(index, 'prixUnitaire', parseFloat(e.target.value))}
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
                    Total (TND)
                  </label>
                  <input
                    type="text"
                    value={ligne.total.toFixed(2)}
                    readOnly
                    className={`w-full px-3 py-2 border rounded-lg ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-gray-400' : 'bg-gray-100 border-gray-300 text-gray-600'
                    }`}
                  />
                </div>
              </div>
              {lignes.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeLigne(index)}
                  className="mt-2 flex items-center space-x-1 text-red-500 hover:text-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm">Supprimer</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className={`px-4 py-2 border rounded-lg transition-colors ${
            darkMode 
              ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-orange-sfaxien text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          {initialData ? 'Modifier' : 'Créer'}
        </button>
      </div>
    </form>
  );
};