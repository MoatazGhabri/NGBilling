export const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        if (value instanceof Date) {
          return value.toLocaleDateString();
        }
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const formatDataForExport = (factures: any[], clients: any[], produits: any[]) => {
  return {
    factures: factures.map(f => ({
      numero: f.numero,
      client: f.clientNom,
      date_creation: f.dateCreation,
      date_echeance: f.dateEcheance,
      statut: f.statut,
      sous_total: f.sousTotal,
      tva: f.tva,
      total: f.total,
      notes: f.notes
    })),
    clients: clients.map(c => ({
      nom: c.nom,
      email: c.email,
      telephone: c.telephone,
      adresse: c.adresse,
      ville: c.ville,
      code_postal: c.codePostal,
      pays: c.pays,
      date_creation: c.dateCreation,
      total_facture: c.totalFacture
    })),
    produits: produits.map(p => ({
      nom: p.nom,
      description: p.description,
      prix: p.prix,
      stock: p.stock,
      stock_min: p.stockMin,
      categorie: p.categorie,
      date_creation: p.dateCreation,
      actif: p.actif
    }))
  };
};