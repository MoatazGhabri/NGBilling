import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { useApp } from '../../context/AppContext';

interface ProductData {
  name: string;
  sales: number;
  stock: number;
  revenue: number;
}

export const ProductsChart: React.FC = () => {
  const { produits, factures, darkMode } = useApp();

  // Calculate product sales and revenue
  const generateProductData = (): ProductData[] => {
    const productStats: { [key: string]: { sales: number; revenue: number; stock: number } } = {};
    
    // Initialize with current stock
    produits.forEach(product => {
      productStats[product.id] = {
        sales: 0,
        revenue: 0,
        stock: product.stock
      };
    });

    // Calculate sales from invoices
    factures.forEach(invoice => {
      invoice.lignes?.forEach(ligne => {
        if (ligne.produit && productStats[ligne.produit.id]) {
          productStats[ligne.produit.id].sales += ligne.quantite;
          productStats[ligne.produit.id].revenue += (ligne.quantite * ligne.prixUnitaire);
        }
      });
    });

    // Convert to array and sort by revenue
    return Object.entries(productStats)
      .map(([id, stats]) => {
        const product = produits.find(p => p.id === id);
        return {
          name: product?.nom || 'Produit inconnu',
          sales: stats.sales,
          stock: stats.stock,
          revenue: stats.revenue
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5); // Top 5 products
  };

  const data = generateProductData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 rounded-lg shadow-lg border ${
          darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
        }`}>
          <p className={`font-medium ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {label}
          </p>
          <p className={`text-sm ${
            darkMode ? 'text-blue-300' : 'text-blue-600'
          }`}>
            CA: {payload[0]?.value?.toLocaleString()} TND
          </p>
          <p className={`text-sm ${
            darkMode ? 'text-green-300' : 'text-green-600'
          }`}>
            Ventes: {payload[1]?.value} unités
          </p>
          <p className={`text-sm ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Stock: {payload[2]?.value} unités
          </p>
        </div>
      );
    }
    return null;
  };

  if (produits.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <span className="text-gray-500 dark:text-gray-400 text-2xl">📦</span>
          </div>
          <p className={`text-sm ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Aucun produit créé
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={darkMode ? '#374151' : '#e5e7eb'} 
          />
          <XAxis 
            dataKey="name" 
            stroke={darkMode ? '#9ca3af' : '#6b7280'}
            fontSize={10}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            stroke={darkMode ? '#9ca3af' : '#6b7280'}
            fontSize={10}
            tickFormatter={(value) => `${value.toLocaleString()} TND`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="revenue" 
            fill="#f97316" 
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}; 