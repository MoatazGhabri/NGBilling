import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { useApp } from '../../context/AppContext';

interface RevenueData {
  month: string;
  revenue: number;
  invoices: number;
}

export const RevenueChart: React.FC = () => {
  const { factures, darkMode } = useApp();

  // Generate revenue data for the last 6 months
  const generateRevenueData = (): RevenueData[] => {
    const months = [];
    const currentDate = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('fr-FR', { month: 'short' });
      
      const monthInvoices = factures.filter(f => {
        const invoiceDate = new Date(f.dateCreation);
        return invoiceDate.getMonth() === date.getMonth() && 
               invoiceDate.getFullYear() === date.getFullYear() &&
               f.statut === 'payee';
      });
      
      const monthRevenue = monthInvoices.reduce((sum, f) => sum + (typeof f.total === 'number' ? f.total : 0), 0);
      
      months.push({
        month: monthName,
        revenue: monthRevenue,
        invoices: monthInvoices.length
      });
    }
    
    return months;
  };

  const data = generateRevenueData();

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
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Factures: {payload[1]?.value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={darkMode ? '#374151' : '#e5e7eb'} 
          />
          <XAxis 
            dataKey="month" 
            stroke={darkMode ? '#9ca3af' : '#6b7280'}
            fontSize={12}
          />
          <YAxis 
            stroke={darkMode ? '#9ca3af' : '#6b7280'}
            fontSize={12}
            tickFormatter={(value) => `${value.toLocaleString()} TND`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="revenue" 
            stroke="#f97316" 
            strokeWidth={3}
            fill="url(#revenueGradient)"
            fillOpacity={1}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}; 