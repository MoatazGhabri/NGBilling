import React, { useState } from 'react';
import { Plus, Trash2, Loader } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useClients, useProducts } from '../../hooks/useApi';
import { Devis as DevisType, LigneDocument } from '../../types';

interface DevisFormProps {
  onSubmit: (devis: Omit<DevisType, 'id'>) => void;
  onCancel: () => void;
  initialData?: DevisType;
}

export const DevisForm: React.FC<DevisFormProps> = ({
  onSubmit,
  onCancel,
  initialData
}) => {
  const { darkMode } = useApp();
  const { data: clients = [], isLoading: clientsLoading } = useClients();
  const { data: produits = [], isLoading: productsLoading } = useProducts();
  const [formData, setFormData] = useState({
    numero: initialData?.numero || `D-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
    clientId: initialData?.clientId || '',
    dateCreation: initialData?.dateCreation ? new Date(initialData.dateCreation).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    dateExpiration: initialData?.dateExpiration ? new Date(initialData.dateExpiration).toISOString().split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    statut: initialData?.statut || 'brouillon' as const,
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

  const [remiseTotale, setRemiseTotale] = useState(initialData?.remiseTotale || 0);

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

    if (field === 'remise') {
      newLignes[index].remise = typeof parsedValue === 'number' ? parsedValue : parseFloat(parsedValue as string) || 0;
    }

    const remiseLigne = newLignes[index].remise || 0;
    newLignes[index].total = (typeof newLignes[index].quantite === 'number' ? newLignes[index].quantite : 0) * (typeof newLignes[index].prixUnitaire === 'number' ? newLignes[index].prixUnitaire : 0) * (1 - remiseLigne / 100);

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

  const sousTotal = lignes.reduce((sum, ligne) => sum + ligne.total, 0);
  const remiseMontant = sousTotal * (remiseTotale / 100);
  const sousTotalApresRemise = sousTotal - remiseMontant;
  const tva = sousTotalApresRemise * 0.19;
  const total = sousTotalApresRemise + tva;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find(c => c.id === formData.clientId);
    if (!client) return;

    onSubmit({
      numero: formData.numero,
      clientId: formData.clientId,
      clientNom: client.nom,
      dateCreation: new Date(formData.dateCreation),
      dateExpiration: new Date(formData.dateExpiration),
      statut: formData.statut,
      lignes,
      sousTotal,
      tva,
      total,
      notes: formData.notes,
      remiseTotale
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
            Numéro de devis
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
            Date d'expiration
          </label>
          <input
            type="date"
            name="dateExpiration"
            value={formData.dateExpiration}
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
            className={`w-full px-3 py-2 border rounded-lg ${
              darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-orange-sfaxien`}
          >
            <option value="brouillon">Brouillon</option>
            <option value="envoye">Envoyé</option>
            <option value="accepte">Accepté</option>
            <option value="refuse">Refusé</option>
            <option value="expire">Expiré</option>
          </select>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-medium ${
            darkMode ? 'text-white' : 'text-bleu-nuit'
          }`}>
            Lignes du devis
          </h3>
          <button
            type="button"
            onClick={addLigne}
            className="px-3 py-1 bg-orange-sfaxien text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter</span>
          </button>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {lignes.map((ligne, index) => (
            <div key={ligne.id} className={`p-3 border rounded-lg ${
              darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="grid grid-cols-12 gap-3 items-end">
                <div className="col-span-4">
                  <label className={`block text-xs font-medium mb-1 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Produit
                  </label>
                  <select
                    value={ligne.produitId}
                    onChange={(e) => handleLigneChange(index, 'produitId', e.target.value)}
                    required
                    className={`w-full px-2 py-1 text-sm border rounded ${
                      darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                    } focus:outline-none focus:ring-1 focus:ring-orange-sfaxien`}
                  >
                    <option value="">Sélectionner</option>
                    {produits.map(produit => (
                      <option key={produit.id} value={produit.id}>{produit.nom}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className={`block text-xs font-medium mb-1 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Quantité
                  </label>
                  <input
                    type="number"
                    value={ligne.quantite}
                    onChange={(e) => handleLigneChange(index, 'quantite', e.target.value)}
                    min="1"
                    required
                    className={`w-full px-2 py-1 text-sm border rounded ${
                      darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                    } focus:outline-none focus:ring-1 focus:ring-orange-sfaxien`}
                  />
                </div>
                <div className="col-span-2">
                  <label className={`block text-xs font-medium mb-1 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Prix unitaire
                  </label>
                  <input
                    type="number"
                    value={ligne.prixUnitaire}
                    onChange={(e) => handleLigneChange(index, 'prixUnitaire', e.target.value)}
                    step="0.01"
                    required
                    className={`w-full px-2 py-1 text-sm border rounded ${
                      darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                    } focus:outline-none focus:ring-1 focus:ring-orange-sfaxien`}
                  />
                </div>
                <div className="col-span-2">
                  <label className={`block text-xs font-medium mb-1 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Total
                  </label>
                  <div className={`px-2 py-1 text-sm border rounded ${
                    darkMode ? 'bg-gray-800 border-gray-500 text-gray-300' : 'bg-gray-100 border-gray-300 text-gray-700'
                  }`}>
                    {typeof ligne.total === 'number' ? ligne.total.toFixed(2) : '0.00'} TND
                  </div>
                </div>
                <div className="col-span-2">
                  <label className={`block text-xs font-medium mb-1 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Remise (%)
                  </label>
                  <input
                    type="number"
                    value={ligne.remise || 0}
                    min={0}
                    max={100}
                    onChange={(e) => handleLigneChange(index, 'remise', e.target.value)}
                    className={`w-full px-2 py-1 text-sm border rounded ${
                      darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                    } focus:outline-none focus:ring-1 focus:ring-orange-sfaxien`}
                  />
                </div>
                <div className="col-span-2">
                  <button
                    type="button"
                    onClick={() => removeLigne(index)}
                    disabled={lignes.length === 1}
                    className={`w-full p-1 rounded transition-colors ${
                      lignes.length === 1 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                    }`}
                  >
                    <Trash2 className="w-4 h-4 mx-auto" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`p-3 border rounded-lg ${
        darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'
      }`}>
        <div className="space-y-1 text-right">
          <div className="flex justify-between">
            <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Sous-total :</span>
            <span className={darkMode ? 'text-white' : 'text-bleu-nuit'}>{typeof sousTotal === 'number' ? sousTotal.toFixed(2) : '0.00'} TND</span>
          </div>
          <div className="flex justify-between">
            <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Remise totale :</span>
            <span className={darkMode ? 'text-white' : 'text-bleu-nuit'}>{typeof remiseMontant === 'number' ? remiseMontant.toFixed(2) : '0.00'} TND</span>
          </div>
          <div className={`flex justify-between text-lg font-bold pt-2 border-t ${
            darkMode ? 'border-gray-600 text-white' : 'border-gray-200 text-bleu-nuit'
          }`}>
            <span>Sous-total après remise :</span>
            <span>{typeof sousTotalApresRemise === 'number' ? sousTotalApresRemise.toFixed(2) : '0.00'} TND</span>
          </div>
          <div className={`flex justify-between text-lg font-bold pt-2 border-t ${
            darkMode ? 'border-gray-600 text-white' : 'border-gray-200 text-bleu-nuit'
          }`}>
            <span>TVA (19%) :</span>
            <span className={darkMode ? 'text-white' : 'text-bleu-nuit'}>{typeof tva === 'number' ? tva.toFixed(2) : '0.00'} TND</span>
          </div>
          <div className={`flex justify-between text-lg font-bold pt-2 border-t ${
            darkMode ? 'border-gray-600 text-white' : 'border-gray-200 text-bleu-nuit'
          }`}>
            <span>Total :</span>
            <span>{typeof total === 'number' ? total.toFixed(2) : '0.00'} TND</span>
          </div>
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
          rows={2}
          className={`w-full px-3 py-2 border rounded-lg ${
            darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-orange-sfaxien`}
          placeholder="Notes ou conditions particulières..."
        />
      </div>

      <div>
        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Remise globale (%)</label>
        <input
          type="number"
          value={remiseTotale}
          min={0}
          max={100}
          onChange={e => setRemiseTotale(Number(e.target.value))}
          className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-orange-sfaxien`}
        />
      </div>

      <div className="flex space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className={`flex-1 py-2 px-4 border rounded-lg transition-colors ${
            darkMode 
              ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Annuler
        </button>
        <button
          type="submit"
          className="flex-1 py-2 px-4 bg-orange-sfaxien text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          {initialData ? 'Modifier' : 'Créer'} le devis
        </button>
      </div>
    </form>
  );
};