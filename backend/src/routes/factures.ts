import { Router } from 'express';
import { body } from 'express-validator';
import { FactureController } from '../controllers/factureController';
import { authenticateToken } from '../middlewares/auth';
import { validate } from '../middlewares/validation';

const router = Router();
const factureController = new FactureController();

// Validation rules
const factureValidation = [
  body('clientId').notEmpty().withMessage('L\'ID du client est requis'),
  body('numero').notEmpty().withMessage('Le numéro de facture est requis'),
  body('dateEcheance').isISO8601().withMessage('La date d\'échéance est requise'),
  body('lignes').isArray({ min: 1 }).withMessage('Au moins une ligne est requise'),
  body('lignes.*.produitId').notEmpty().withMessage('L\'ID du produit est requis'),
  body('lignes.*.quantite').isInt({ min: 1 }).withMessage('La quantité doit être un nombre entier positif'),
  body('lignes.*.prixUnitaire').isFloat({ min: 0 }).withMessage('Le prix unitaire doit être un nombre positif')
];

// Routes
router.get('/', authenticateToken, factureController.getAllFactures);
router.get('/status/:statut', authenticateToken, factureController.getFacturesByStatus);
router.get('/:id', authenticateToken, factureController.getFactureById);
router.get('/:id/details', authenticateToken, factureController.getFactureDetails);
router.post('/', authenticateToken, validate(factureValidation), factureController.createFacture);
router.put('/:id', authenticateToken, validate(factureValidation), factureController.updateFacture);
router.delete('/:id', authenticateToken, factureController.deleteFacture);
router.get('/:id/pdf', authenticateToken, factureController.generatePDF);

export default router; 