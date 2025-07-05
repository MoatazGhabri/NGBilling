import { Router } from 'express';
import { BonLivraisonController } from '../controllers/bonLivraisonController';
import { authenticateToken } from '../middlewares/auth';
import { validate } from '../middlewares/validation';
import { body } from 'express-validator';

const router = Router();
const bonLivraisonController = new BonLivraisonController();

// Validation rules
const bonLivraisonValidation = [
  body('numero').notEmpty().withMessage('Le numéro est requis'),
  body('clientId').notEmpty().withMessage('Le client est requis'),
  body('dateCreation').isISO8601().withMessage('La date de création est invalide'),
  body('dateLivraison').isISO8601().withMessage('La date de livraison est invalide'),
  body('statut').isIn(['prepare', 'expediee', 'livree']).withMessage('Statut invalide'),
  body('lignes').isArray().withMessage('Les lignes doivent être un tableau'),
  body('lignes.*.produitId').notEmpty().withMessage('L\'ID du produit est requis'),
  body('lignes.*.quantite').isInt({ min: 1 }).withMessage('La quantité doit être un nombre positif'),
  body('lignes.*.prixUnitaire').isFloat({ min: 0 }).withMessage('Le prix unitaire doit être positif'),
];

// Routes
router.get('/', authenticateToken, bonLivraisonController.getAllBonsLivraison);
router.get('/:id', authenticateToken, bonLivraisonController.getBonLivraisonById);
router.post('/', authenticateToken, validate(bonLivraisonValidation), bonLivraisonController.createBonLivraison);
router.put('/:id', authenticateToken, validate(bonLivraisonValidation), bonLivraisonController.updateBonLivraison);
router.delete('/:id', authenticateToken, bonLivraisonController.deleteBonLivraison);
router.get('/:id/pdf', authenticateToken, bonLivraisonController.generatePDF);

export default router; 