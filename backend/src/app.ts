import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from 'dotenv';
import { initializeDatabase } from './config/database';
import { errorHandler, notFound } from './middlewares/errorHandler';

// Import routes
import authRoutes from './routes/auth';
import clientRoutes from './routes/clients';
import produitRoutes from './routes/produits';
import factureRoutes from './routes/factures';
import paiementRoutes from './routes/paiements';
import devisRoutes from './routes/devis';
import bonsLivraisonRoutes from './routes/bonsLivraison';
import settingsRoutes from './routes/settings';

// Load environment variables
config();

// Initialize database
initializeDatabase();

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
// CORS configuration
const allowedOrigins = [
  process.env.CORS_ORIGIN || 'https://billing.nathy-graph.com',
  'http://31.97.177.87:5173',
  'http://localhost:5173',

];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      // Allow requests with no origin (like mobile apps, curl, etc.)
      callback(null, true);
    } else {
      callback(new Error(`CORS policy: Origin ${origin} not allowed`));
    }
  },
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API prefix
const apiPrefix = process.env.API_PREFIX || '/api/v1';

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'NGBilling API is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/clients`, clientRoutes);
app.use(`${apiPrefix}/produits`, produitRoutes);
app.use(`${apiPrefix}/factures`, factureRoutes);
app.use(`${apiPrefix}/paiements`, paiementRoutes);
app.use(`${apiPrefix}/devis`, devisRoutes);
app.use(`${apiPrefix}/bons-livraison`, bonsLivraisonRoutes);
app.use(`${apiPrefix}/settings`, settingsRoutes);

// 404 handler
app.use(notFound);

// Error handling middleware
app.use(errorHandler);

export default app; 