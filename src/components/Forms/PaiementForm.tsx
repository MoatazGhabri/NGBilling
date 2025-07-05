import React, { useState } from 'react';
import { Loader } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useInvoices } from '../../hooks/useApi';
import { Paiement } from '../../types';

interface PaiementFormProps {
  onSubmit: (paiement: Omit<Paiement, 'id'>) => void;
  onCancel: () => void;
  initialData?: Paiement;
}

export const PaiementForm: React.FC<PaiementFormProps> = ({
  onSubmit,
  onCancel,
  initialData
}) => {
  const { darkMode } = useApp();
  const { data: factures = [], isLoading: invoicesLoading } = useInvoices();
  const [formData, setFormData] = useState({
    factureId: initialData?.factureId || '',
    montant: initialData?.montant?.toString() || '',
    datePaiement: initialData?.datePaiement ? new Date(initialData.datePaiement).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    methode: initialData?.methode || 'virement' as const,
    reference: initialData?.reference || '',
    statut: initialData?.statut || 'confirme' as const,
    notes: initialData?.notes || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      factureId: formData.factureId,
      montant: parseFloat(formData.montant),
      datePaiement: new Date(formData.datePaiement),
      methode: formData.methode,
      reference: formData.reference,
      statut: formData.statut,
      notes: formData.notes
    });
  };

  // Show all invoices for payment selection
  const facturesEnAttente = factures;

  // Show loading state if data is still loading
  if (invoicesLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-orange-sfaxien mx-auto mb-4" />
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Chargement des factures...
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={`block text-sm font-medium mb-2 ${
          darkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Facture
        </label>
        <select
          name="factureId"
          value={formData.factureId}
          onChange={handleChange}
          required
          className={`w-full px-3 py-2 border rounded-lg ${
            darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-orange-sfaxien`}
        >
          <option value="">Sélectionner une facture</option>
          {facturesEnAttente.map(facture => (
            <option key={facture.id} value={facture.id}>
                              {facture.numero} - {facture.clientNom} ({typeof facture.total === 'number' ? facture.total.toFixed(2) : '0.00'} TND)
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Montant (TND)
          </label>
          <input
            type="number"
            name="montant"
            value={formData.montant}
            onChange={handleChange}
            required
            step="0.01"
            className={`w-full px-3 py-2 border rounded-lg ${
              darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-orange-sfaxien`}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Date de paiement
          </label>
          <input
            type="date"
            name="datePaiement"
            value={formData.datePaiement}
            onChange={handleChange}
            required
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
            Méthode de paiement
          </label>
          <select
            name="methode"
            value={formData.methode}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg ${
              darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-orange-sfaxien`}
          >
            <option value="especes">Espèces</option>
            <option value="carte">Carte bancaire</option>
            <option value="virement">Virement</option>
            <option value="cheque">Chèque</option>
            <option value="paypal">PayPal</option>
            <option value="stripe">Stripe</option>
          </select>
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
            <option value="en_attente">En attente</option>
            <option value="confirme">Confirmé</option>
            <option value="refuse">Refusé</option>
          </select>
        </div>
      </div>

      <div>
        <label className={`block text-sm font-medium mb-2 ${
          darkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Référence
        </label>
        <input
          type="text"
          name="reference"
          value={formData.reference}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg ${
            darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-orange-sfaxien`}
          placeholder="Numéro de transaction, référence..."
        />
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
          placeholder="Notes complémentaires..."
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
          {initialData ? 'Modifier' : 'Enregistrer'} le paiement
        </button>
      </div>
    </form>
  );
};