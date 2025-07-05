import { Router } from 'express';
import { body } from 'express-validator';
import { ProduitController } from '../controllers/produitController';
import { authenticateToken } from '../middlewares/auth';
import { validate } from '../middlewares/validation';

const router = Router();
const produitController = new ProduitController();

// Validation rules
const produitValidation = [
  body('nom').notEmpty().withMessage('Le nom est requis'),
  body('description').notEmpty().withMessage('La description est requise'),
  body('prix').isFloat({ min: 0 }).withMessage('Le prix doit être un nombre positif'),
  body('stock').isInt({ min: 0 }).withMessage('Le stock doit être un nombre entier positif'),
  body('stockMin').isInt({ min: 0 }).withMessage('Le stock minimum doit être un nombre entier positif'),
  body('categorie').notEmpty().withMessage('La catégorie est requise')
];

// Routes
router.get('/', authenticateToken, produitController.getAllProduits);
router.get('/low-stock', authenticateToken, produitController.getProduitsLowStock);
router.get('/:id', authenticateToken, produitController.getProduitById);
router.post('/', authenticateToken, validate(produitValidation), produitController.createProduit);
router.put('/:id', authenticateToken, validate(produitValidation), produitController.updateProduit);
router.delete('/:id', authenticateToken, produitController.deleteProduit);

export default router; 