import { Router } from 'express';
import { DevisController } from '../controllers/devisController';
import { authenticateToken } from '../middlewares/auth';
import { validate } from '../middlewares/validation';
import { body } from 'express-validator';

const router = Router();
const devisController = new DevisController();

// Validation rules
const devisValidation = [
  body('numero').notEmpty().withMessage('Le numéro est requis'),
  body('clientId').notEmpty().withMessage('Le client est requis'),
  body('dateCreation').isISO8601().withMessage('La date de création est invalide'),
  body('dateExpiration').isISO8601().withMessage('La date d\'expiration est invalide'),
  body('statut').isIn(['brouillon', 'envoye', 'accepte', 'refuse', 'expire']).withMessage('Statut invalide'),
  body('lignes').isArray().withMessage('Les lignes doivent être un tableau'),
  body('lignes.*.produitId').notEmpty().withMessage('L\'ID du produit est requis'),
  body('lignes.*.quantite').isInt({ min: 1 }).withMessage('La quantité doit être un nombre positif'),
  body('lignes.*.prixUnitaire').isFloat({ min: 0 }).withMessage('Le prix unitaire doit être positif'),
];

// Routes
router.get('/', authenticateToken, devisController.getAllDevis);
router.get('/:id', authenticateToken, devisController.getDevisById);
router.post('/', authenticateToken, validate(devisValidation), devisController.createDevis);
router.put('/:id', authenticateToken, validate(devisValidation), devisController.updateDevis);
router.delete('/:id', authenticateToken, devisController.deleteDevis);
router.get('/:id/pdf', authenticateToken, devisController.generatePDF);

export default router; 