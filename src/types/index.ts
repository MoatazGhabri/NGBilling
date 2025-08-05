export interface Client {
  id: string;
  nom: string;
  email: string;
  telephone: string;
  adresse: string;
  ville: string;
  codePostal: string;
  pays: string;
  dateCreation: Date;
  totalFacture: number;
}

export interface Produit {
  id: string;
  nom: string;
  description: string;
  prix: number;
  categorie: string;
  dateCreation: Date;
  actif: boolean;
}

export interface LigneDocument {
  id: string;
  produitId: string;
  produitNom: string;
  quantite: number;
  prixUnitaire: number;
  remise?: number;
  total: number;
}

export interface Facture {
  id: string;
  numero: string;
  clientId: string;
  clientNom: string;
  dateCreation: Date;
  dateEcheance: Date;
  statut: 'brouillon' | 'envoyee' | 'payee' | 'en_retard' | 'annulee';
  lignes: LigneDocument[];
  sousTotal: number;
  tva: number;
  total: number;
  notes: string;
  remiseTotale?: number;
}

export interface Devis {
  id: string;
  numero: string;
  clientId: string;
  clientNom: string;
  dateCreation: Date;
  dateExpiration: Date;
  statut: 'brouillon' | 'envoye' | 'accepte' | 'refuse' | 'expire';
  lignes: LigneDocument[];
  sousTotal: number;
  tva: number;
  total: number;
  notes: string;
  remiseTotale?: number;
  conditionsReglement: 'acompte50' | 'acompte70';
}

export interface BonLivraison {
  id: string;
  numero: string;
  clientId: string;
  clientNom: string;
  dateCreation: Date;
  dateLivraison: Date;
  statut: 'prepare' | 'expediee' | 'livree';
  lignes: LigneDocument[];
  notes: string;
}

export interface Paiement {
  id: string;
  factureId: string;
  montant: number;
  datePaiement: Date;
  methode: 'especes' | 'carte' | 'virement' | 'cheque' | 'paypal' | 'stripe';
  reference: string;
  statut: 'en_attente' | 'confirme' | 'refuse';
  notes: string;
}

export interface Stats {
  chiffreAffaires: number;
  facturesEnAttente: number;
  facturesPayees: number;
  clientsActifs: number;
}