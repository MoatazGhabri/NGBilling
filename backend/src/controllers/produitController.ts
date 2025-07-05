import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Produit } from '../models/Produit';

export class ProduitController {
  private produitRepository = AppDataSource.getRepository(Produit);

  // Get all products
  public getAllProduits = async (req: Request, res: Response): Promise<void> => {
    try {
      const produits = await this.produitRepository.find({
        order: { dateCreation: 'DESC' }
      });

      res.json({
        success: true,
        data: produits
      });
    } catch (error) {
      console.error('Get all produits error:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des produits' });
    }
  };

  // Get product by ID
  public getProduitById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const produit = await this.produitRepository.findOne({ where: { id: id as string } });

      if (!produit) {
        res.status(404).json({ message: 'Produit non trouvé' });
        return;
      }

      res.json({
        success: true,
        data: produit
      });
    } catch (error) {
      console.error('Get produit by ID error:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération du produit' });
    }
  };

  // Create new product
  public createProduit = async (req: Request, res: Response): Promise<void> => {
    try {
      const produitData = req.body;
      
      // Validation manuelle des champs requis
      const requiredFields = ['nom', 'prix', 'categorie'];
      const missingFields = requiredFields.filter(field => {
        const value = produitData[field];
        return value === undefined || value === null || value === '' || 
               (typeof value === 'number' && value < 0);
      });
      
      if (missingFields.length > 0) {
        res.status(400).json({ 
          message: `Champs manquants ou invalides: ${missingFields.join(', ')}`,
          missingFields 
        });
        return;
      }

      // Validation des valeurs numériques
      if (produitData.prix < 0) {
        res.status(400).json({ message: 'Le prix doit être positif' });
        return;
      }

      // Vérifier si le produit existe déjà (même nom)
      const existingProduit = await this.produitRepository.findOne({ 
        where: { nom: produitData.nom } 
      });
      
      if (existingProduit) {
        res.status(400).json({ message: 'Un produit avec ce nom existe déjà' });
        return;
      }

      const produit = this.produitRepository.create(produitData);
      await this.produitRepository.save(produit);

      res.status(201).json({
        success: true,
        message: 'Produit créé avec succès',
        data: produit
      });
    } catch (error) {
      console.error('Create produit error:', error);
      res.status(500).json({ message: 'Erreur lors de la création du produit' });
    }
  };

  // Update product
  public updateProduit = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const produit = await this.produitRepository.findOne({ where: { id: id as string } });
      if (!produit) {
        res.status(404).json({ message: 'Produit non trouvé' });
        return;
      }

      Object.assign(produit, updateData);
      await this.produitRepository.save(produit);

      res.json({
        success: true,
        message: 'Produit mis à jour avec succès',
        data: produit
      });
    } catch (error) {
      console.error('Update produit error:', error);
      res.status(500).json({ message: 'Erreur lors de la mise à jour du produit' });
    }
  };

  // Delete product
  public deleteProduit = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const produit = await this.produitRepository.findOne({ where: { id: id as string } });

      if (!produit) {
        res.status(404).json({ message: 'Produit non trouvé' });
        return;
      }

      await this.produitRepository.remove(produit);

      res.json({
        success: true,
        message: 'Produit supprimé avec succès'
      });
    } catch (error) {
      console.error('Delete produit error:', error);
      res.status(500).json({ message: 'Erreur lors de la suppression du produit' });
    }
  };
} 