import { Router } from 'express';
import { body } from 'express-validator';
import { ClientController } from '../controllers/clientController';
import { authenticateToken } from '../middlewares/auth';
import { validate } from '../middlewares/validation';

const router = Router();
const clientController = new ClientController();

// Validation rules
const clientValidation = [
  body('nom').notEmpty().withMessage('Le nom est requis'),
  body('email').isEmail().withMessage('Email invalide'),
  body('telephone').notEmpty().withMessage('Le téléphone est requis'),
  body('adresse').notEmpty().withMessage('L\'adresse est requise'),
  body('ville').notEmpty().withMessage('La ville est requise'),
  body('codePostal').notEmpty().withMessage('Le code postal est requis'),
  body('pays').notEmpty().withMessage('Le pays est requis')
];

// Routes
router.get('/', authenticateToken, clientController.getAllClients);
router.get('/:id', authenticateToken, clientController.getClientById);
router.post('/', authenticateToken, validate(clientValidation), clientController.createClient);
router.put('/:id', authenticateToken, validate(clientValidation), clientController.updateClient);
router.delete('/:id', authenticateToken, clientController.deleteClient);

export default router; 