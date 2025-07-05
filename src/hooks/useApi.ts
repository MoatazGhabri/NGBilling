import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  clientsAPI, 
  productsAPI, 
  invoicesAPI, 
  paymentsAPI,
  authAPI,
  LoginRequest,
  RegisterRequest,
  devisAPI,
  bonsLivraisonAPI,
  settingsAPI
} from '../utils/api';
import { Client, Produit, Facture, Paiement, Devis, BonLivraison } from '../types';

// Authentication hooks
export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (credentials: LoginRequest) => authAPI.login(credentials),
    {
      onSuccess: (data) => {
        if (data.success && data.data) {
          localStorage.setItem('ngbilling-token', data.data.token);
          // Invalidate and refetch user data
          queryClient.invalidateQueries(['user']);
        }
      },
    }
  );
};

export const useRegister = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (userData: RegisterRequest) => authAPI.register(userData),
    {
      onSuccess: (data) => {
        if (data.success && data.data) {
          localStorage.setItem('ngbilling-token', data.data.token);
          queryClient.invalidateQueries(['user']);
        }
      },
    }
  );
};

export const useUser = () => {
  return useQuery(
    ['user'],
    () => authAPI.getProfile(),
    {
      enabled: !!localStorage.getItem('ngbilling-token'),
      retry: false,
      onError: () => {
        localStorage.removeItem('ngbilling-token');
      },
    }
  );
};

// Clients hooks
export const useClients = () => {
  return useQuery(
    ['clients'],
    () => clientsAPI.getAll(),
    {
      select: (data) => data.data || [],
    }
  );
};

export const useClient = (id: string) => {
  return useQuery(
    ['clients', id],
    () => clientsAPI.getById(id),
    {
      enabled: !!id,
      select: (data) => data.data,
    }
  );
};

export const useCreateClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (client: Omit<Client, 'id' | 'dateCreation' | 'dateModification'>) => 
      clientsAPI.create(client),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['clients']);
      },
    }
  );
};

export const useUpdateClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ id, client }: { id: string; client: Partial<Client> }) =>
      clientsAPI.update(id, client),
    {
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries(['clients']);
        queryClient.invalidateQueries(['clients', id]);
      },
    }
  );
};

export const useDeleteClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (id: string) => clientsAPI.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['clients']);
      },
    }
  );
};

// Products hooks
export const useProducts = () => {
  return useQuery(
    ['products'],
    () => productsAPI.getAll(),
    {
      select: (data) => data.data || [],
    }
  );
};

export const useProduct = (id: string) => {
  return useQuery(
    ['products', id],
    () => productsAPI.getById(id),
    {
      enabled: !!id,
      select: (data) => data.data,
    }
  );
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (product: Omit<Produit, 'id' | 'dateCreation' | 'dateModification'>) =>
      productsAPI.create(product),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['products']);
      },
    }
  );
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ id, product }: { id: string; product: Partial<Produit> }) =>
      productsAPI.update(id, product),
    {
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries(['products']);
        queryClient.invalidateQueries(['products', id]);
      },
    }
  );
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (id: string) => productsAPI.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['products']);
      },
    }
  );
};

// Invoices hooks
export const useInvoices = () => {
  return useQuery(
    ['invoices'],
    () => invoicesAPI.getAll(),
    {
      select: (data) => data.data || [],
    }
  );
};

export const useInvoice = (id: string) => {
  return useQuery(
    ['invoices', id],
    () => invoicesAPI.getById(id),
    {
      enabled: !!id,
      select: (data) => data.data,
    }
  );
};

export const useInvoicesByStatus = (status: string) => {
  return useQuery(
    ['invoices', 'status', status],
    () => invoicesAPI.getByStatus(status),
    {
      enabled: !!status,
      select: (data) => data.data || [],
    }
  );
};

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (invoice: Omit<Facture, 'id' | 'dateCreation' | 'dateModification'>) =>
      invoicesAPI.create(invoice),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['invoices']);
        queryClient.invalidateQueries(['clients']);
      },
    }
  );
};

export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ id, invoice }: { id: string; invoice: Partial<Facture> }) =>
      invoicesAPI.update(id, invoice),
    {
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries(['invoices']);
        queryClient.invalidateQueries(['invoices', id]);
        queryClient.invalidateQueries(['clients']);
      },
    }
  );
};

export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (id: string) => invoicesAPI.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['invoices']);
        queryClient.invalidateQueries(['clients']);
      },
    }
  );
};

// Payments hooks
export const usePayments = () => {
  return useQuery(
    ['payments'],
    () => paymentsAPI.getAll(),
    {
      select: (data) => data.data || [],
    }
  );
};

export const usePayment = (id: string) => {
  return useQuery(
    ['payments', id],
    () => paymentsAPI.getById(id),
    {
      enabled: !!id,
      select: (data) => data.data,
    }
  );
};

export const usePaymentsByInvoice = (invoiceId: string) => {
  return useQuery(
    ['payments', 'invoice', invoiceId],
    () => paymentsAPI.getByInvoice(invoiceId),
    {
      enabled: !!invoiceId,
      select: (data) => data.data || [],
    }
  );
};

export const usePaymentsByStatus = (status: string) => {
  return useQuery(
    ['payments', 'status', status],
    () => paymentsAPI.getByStatus(status),
    {
      enabled: !!status,
      select: (data) => data.data || [],
    }
  );
};

export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (payment: Omit<Paiement, 'id' | 'datePaiement' | 'dateModification'>) =>
      paymentsAPI.create(payment),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['payments']);
      },
    }
  );
};

export const useUpdatePayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ id, payment }: { id: string; payment: Partial<Paiement> }) =>
      paymentsAPI.update(id, payment),
    {
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries(['payments']);
        queryClient.invalidateQueries(['payments', id]);
      },
    }
  );
};

export const useDeletePayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (id: string) => paymentsAPI.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['payments']);
      },
    }
  );
};

// Devis hooks
export const useDevis = () => {
  return useQuery(
    ['devis'],
    () => devisAPI.getAll(),
    {
      select: (data) => data.data || [],
    }
  );
};

export const useDevisById = (id: string) => {
  return useQuery(
    ['devis', id],
    () => devisAPI.getById(id),
    {
      enabled: !!id,
      select: (data) => data.data,
    }
  );
};

export const useCreateDevis = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (devis: Omit<Devis, 'id' | 'dateCreation' | 'dateModification'>) =>
      devisAPI.create(devis),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['devis']);
      },
    }
  );
};

export const useUpdateDevis = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ id, devis }: { id: string; devis: Partial<Devis> }) =>
      devisAPI.update(id, devis),
    {
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries(['devis']);
        queryClient.invalidateQueries(['devis', id]);
      },
    }
  );
};

export const useDeleteDevis = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (id: string) => devisAPI.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['devis']);
      },
    }
  );
};

// Bons de livraison hooks
export const useBonsLivraison = () => {
  return useQuery(
    ['bons-livraison'],
    () => bonsLivraisonAPI.getAll(),
    {
      select: (data) => data.data || [],
    }
  );
};

export const useBonLivraisonById = (id: string) => {
  return useQuery(
    ['bons-livraison', id],
    () => bonsLivraisonAPI.getById(id),
    {
      enabled: !!id,
      select: (data) => data.data,
    }
  );
};

export const useCreateBonLivraison = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (bonLivraison: Omit<BonLivraison, 'id' | 'dateCreation' | 'dateModification'>) =>
      bonsLivraisonAPI.create(bonLivraison),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['bons-livraison']);
      },
    }
  );
};

export const useUpdateBonLivraison = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ id, bonLivraison }: { id: string; bonLivraison: Partial<BonLivraison> }) =>
      bonsLivraisonAPI.update(id, bonLivraison),
    {
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries(['bons-livraison']);
        queryClient.invalidateQueries(['bons-livraison', id]);
      },
    }
  );
};

export const useDeleteBonLivraison = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (id: string) => bonsLivraisonAPI.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['bons-livraison']);
      },
    }
  );
};

// Settings hooks
export const useSettings = () => {
  return useQuery(['settings'], () => settingsAPI.get(), {
    select: (data) => data.data || {},
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  return useMutation((data: any) => settingsAPI.update(data), {
    onSuccess: () => {
      queryClient.invalidateQueries(['settings']);
    },
  });
}; 