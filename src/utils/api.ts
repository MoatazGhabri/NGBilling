import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { Client, Produit, Facture, Paiement, Devis, BonLivraison } from '../types';

// API base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

// Create axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add authentication token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ngbilling-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('ngbilling-token');
      window.location.href = '/login';
    }
    
    // Handle other errors
    if (error.response?.status === 403) {
      console.error('Forbidden: You do not have permission to access this resource');
    }
    
    if (error.response?.status === 500) {
      console.error('Server error: Something went wrong on the server');
    }
    
    return Promise.reject(error);
  }
);

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{ field: string; message: string }>;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    nom: string;
    role: string;
  };
  token: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nom: string;
  telephone?: string;
}

// Authentication API methods
export const authAPI = {
  login: async (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
    return response.data;
  },

  register: async (userData: RegisterRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/register', userData);
    return response.data;
  },

  getProfile: async (): Promise<ApiResponse<{ user: LoginResponse['user'] }>> => {
    const response = await apiClient.get<ApiResponse<{ user: LoginResponse['user'] }>>('/auth/profile');
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('ngbilling-token');
    window.location.href = '/login';
  },
};

// Clients API methods
export const clientsAPI = {
  getAll: async (): Promise<ApiResponse<Client[]>> => {
    const response = await apiClient.get<ApiResponse<Client[]>>('/clients');
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Client>> => {
    const response = await apiClient.get<ApiResponse<Client>>(`/clients/${id}`);
    return response.data;
  },

  create: async (client: Omit<Client, 'id' | 'dateCreation' | 'dateModification'>): Promise<ApiResponse<Client>> => {
    const response = await apiClient.post<ApiResponse<Client>>('/clients', client);
    return response.data;
  },

  update: async (id: string, client: Partial<Client>): Promise<ApiResponse<Client>> => {
    const response = await apiClient.put<ApiResponse<Client>>(`/clients/${id}`, client);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/clients/${id}`);
    return response.data;
  },
};

// Products API methods
export const productsAPI = {
  getAll: async (): Promise<ApiResponse<Produit[]>> => {
    const response = await apiClient.get<ApiResponse<Produit[]>>('/produits');
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Produit>> => {
    const response = await apiClient.get<ApiResponse<Produit>>(`/produits/${id}`);
    return response.data;
  },

  getLowStock: async (): Promise<ApiResponse<Produit[]>> => {
    const response = await apiClient.get<ApiResponse<Produit[]>>('/produits/low-stock');
    return response.data;
  },

  create: async (product: Omit<Produit, 'id' | 'dateCreation' | 'dateModification'>): Promise<ApiResponse<Produit>> => {
    const response = await apiClient.post<ApiResponse<Produit>>('/produits', product);
    return response.data;
  },

  update: async (id: string, product: Partial<Produit>): Promise<ApiResponse<Produit>> => {
    const response = await apiClient.put<ApiResponse<Produit>>(`/produits/${id}`, product);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/produits/${id}`);
    return response.data;
  },
};

// Invoices API methods
export const invoicesAPI = {
  getAll: async (): Promise<ApiResponse<Facture[]>> => {
    const response = await apiClient.get<ApiResponse<Facture[]>>('/factures');
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Facture>> => {
    const response = await apiClient.get<ApiResponse<Facture>>(`/factures/${id}`);
    return response.data;
  },

  getByStatus: async (status: string): Promise<ApiResponse<Facture[]>> => {
    const response = await apiClient.get<ApiResponse<Facture[]>>(`/factures/status/${status}`);
    return response.data;
  },

  create: async (invoice: Omit<Facture, 'id' | 'dateCreation' | 'dateModification'>): Promise<ApiResponse<Facture>> => {
    const response = await apiClient.post<ApiResponse<Facture>>('/factures', invoice);
    return response.data;
  },

  update: async (id: string, invoice: Partial<Facture>): Promise<ApiResponse<Facture>> => {
    const response = await apiClient.put<ApiResponse<Facture>>(`/factures/${id}`, invoice);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/factures/${id}`);
    return response.data;
  },

  generatePDF: async (id: string): Promise<Blob> => {
    const response = await apiClient.get(`/factures/${id}/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  },
};

// Payments API methods
export const paymentsAPI = {
  getAll: async (): Promise<ApiResponse<Paiement[]>> => {
    const response = await apiClient.get<ApiResponse<Paiement[]>>('/paiements');
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Paiement>> => {
    const response = await apiClient.get<ApiResponse<Paiement>>(`/paiements/${id}`);
    return response.data;
  },

  getByInvoice: async (invoiceId: string): Promise<ApiResponse<Paiement[]>> => {
    const response = await apiClient.get<ApiResponse<Paiement[]>>(`/paiements/facture/${invoiceId}`);
    return response.data;
  },

  getByStatus: async (status: string): Promise<ApiResponse<Paiement[]>> => {
    const response = await apiClient.get<ApiResponse<Paiement[]>>(`/paiements/status/${status}`);
    return response.data;
  },

  create: async (payment: Omit<Paiement, 'id' | 'datePaiement' | 'dateModification'>): Promise<ApiResponse<Paiement>> => {
    const response = await apiClient.post<ApiResponse<Paiement>>('/paiements', payment);
    return response.data;
  },

  update: async (id: string, payment: Partial<Paiement>): Promise<ApiResponse<Paiement>> => {
    const response = await apiClient.put<ApiResponse<Paiement>>(`/paiements/${id}`, payment);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/paiements/${id}`);
    return response.data;
  },
};

// Devis API methods
export const devisAPI = {
  getAll: async (): Promise<ApiResponse<Devis[]>> => {
    const response = await apiClient.get<ApiResponse<Devis[]>>('/devis');
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Devis>> => {
    const response = await apiClient.get<ApiResponse<Devis>>(`/devis/${id}`);
    return response.data;
  },

  create: async (devis: Omit<Devis, 'id' | 'dateCreation' | 'dateModification'>): Promise<ApiResponse<Devis>> => {
    const response = await apiClient.post<ApiResponse<Devis>>('/devis', devis);
    return response.data;
  },

  update: async (id: string, devis: Partial<Devis>): Promise<ApiResponse<Devis>> => {
    const response = await apiClient.put<ApiResponse<Devis>>(`/devis/${id}`, devis);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/devis/${id}`);
    return response.data;
  },

  generatePDF: async (id: string): Promise<Blob> => {
    const response = await apiClient.get(`/devis/${id}/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  },
};

// Bons de livraison API methods
export const bonsLivraisonAPI = {
  getAll: async (): Promise<ApiResponse<BonLivraison[]>> => {
    const response = await apiClient.get<ApiResponse<BonLivraison[]>>('/bons-livraison');
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<BonLivraison>> => {
    const response = await apiClient.get<ApiResponse<BonLivraison>>(`/bons-livraison/${id}`);
    return response.data;
  },

  create: async (bonLivraison: Omit<BonLivraison, 'id' | 'dateCreation' | 'dateModification'>): Promise<ApiResponse<BonLivraison>> => {
    const response = await apiClient.post<ApiResponse<BonLivraison>>('/bons-livraison', bonLivraison);
    return response.data;
  },

  update: async (id: string, bonLivraison: Partial<BonLivraison>): Promise<ApiResponse<BonLivraison>> => {
    const response = await apiClient.put<ApiResponse<BonLivraison>>(`/bons-livraison/${id}`, bonLivraison);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/bons-livraison/${id}`);
    return response.data;
  },

  generatePDF: async (id: string): Promise<Blob> => {
    const response = await apiClient.get(`/bons-livraison/${id}/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  },
};

// Settings API methods
export const settingsAPI = {
  get: async () => {
    const response = await apiClient.get('/settings');
    return response.data;
  },
  update: async (data: any) => {
    const response = await apiClient.put('/settings', data);
    return response.data;
  },
};

// Export the main API client for custom requests
export default apiClient; 