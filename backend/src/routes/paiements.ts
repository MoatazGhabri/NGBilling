import { Router } from 'express';
import { body } from 'express-validator';
import { PaiementController } from '../controllers/paiementController';
import { authenticateToken } from '../middlewares/auth';
import { validate } from '../middlewares/validation';

const router = Router();
const paiementController = new PaiementController();

// Validation rules
const paiementValidation = [
  body('factureId').notEmpty().withMessage('L\'ID de la facture est requis'),
  body('montant').isFloat({ min: 0 }).withMessage('Le montant doit être un nombre positif'),
  body('methode').isIn(['especes', 'carte', 'virement', 'cheque', 'paypal', 'stripe']).withMessage('Méthode de paiement invalide'),
  body('statut').isIn(['en_attente', 'confirme', 'refuse']).withMessage('Statut invalide')
];

// Routes
router.get('/', authenticateToken, paiementController.getAllPaiements);
router.get('/facture/:factureId', authenticateToken, paiementController.getPaiementsByFacture);
router.get('/status/:statut', authenticateToken, paiementController.getPaiementsByStatus);
router.get('/:id', authenticateToken, paiementController.getPaiementById);
router.post('/', authenticateToken, validate(paiementValidation), paiementController.createPaiement);
router.put('/:id', authenticateToken, validate(paiementValidation), paiementController.updatePaiement);
router.delete('/:id', authenticateToken, paiementController.deletePaiement);

export default router; 