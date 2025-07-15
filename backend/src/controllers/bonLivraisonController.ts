import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { BonLivraison } from '../models/BonLivraison';
import { Client } from '../models/Client';
import { Produit } from '../models/Produit';
import { PDFService } from '../services/pdfService';

export class BonLivraisonController {
  private bonLivraisonRepository = AppDataSource.getRepository(BonLivraison);
  private clientRepository = AppDataSource.getRepository(Client);
  private produitRepository = AppDataSource.getRepository(Produit);
  private pdfService = new PDFService();

  // Get all bons de livraison
  public getAllBonsLivraison = async (req: Request, res: Response): Promise<void> => {
    try {
      const bonsLivraison = await this.bonLivraisonRepository.find({
        relations: ['client', 'lignes'],
        order: { dateCreation: 'DESC' }
      });

      res.json({
        success: true,
        data: bonsLivraison
      });
    } catch (error) {
      console.error('Get all bons de livraison error:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des bons de livraison' });
    }
  };

  // Get bon de livraison by ID
  public getBonLivraisonById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const bonLivraison = await this.bonLivraisonRepository.findOne({ 
        where: { id: id as string },
        relations: ['client', 'lignes']
      });

      if (!bonLivraison) {
        res.status(404).json({ message: 'Bon de livraison non trouvé' });
        return;
      }

      res.json({
        success: true,
        data: bonLivraison
      });
    } catch (error) {
      console.error('Get bon de livraison by ID error:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération du bon de livraison' });
    }
  };

  // Create new bon de livraison
  public createBonLivraison = async (req: Request, res: Response): Promise<void> => {
    try {
      const { clientId, lignes, ...bonLivraisonData } = req.body;

      // Verify client exists
      const client = await this.clientRepository.findOne({ where: { id: clientId } });
      if (!client) {
        res.status(404).json({ message: 'Client non trouvé' });
        return;
      }

      // Validate products exist
      const processedLignes = [];

      for (const ligne of lignes) {
        const produit = await this.produitRepository.findOne({ where: { id: ligne.produitId } });
        if (!produit) {
          res.status(404).json({ message: `Produit ${ligne.produitId} non trouvé` });
          return;
        }

        processedLignes.push({
          ...ligne,
          produitNom: produit.nom,
          produitDescription: produit.description,
          total: ligne.quantite * ligne.prixUnitaire
        });
      }

      const bonLivraison = this.bonLivraisonRepository.create({
        ...bonLivraisonData,
        clientId,
        clientNom: client.nom,
        lignes: processedLignes
      });

      await this.bonLivraisonRepository.save(bonLivraison);

      res.status(201).json({
        success: true,
        message: 'Bon de livraison créé avec succès',
        data: bonLivraison
      });
    } catch (error) {
      console.error('Create bon de livraison error:', error);
      res.status(500).json({ message: 'Erreur lors de la création du bon de livraison' });
    }
  };

  // Update bon de livraison
  public updateBonLivraison = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { lignes, ...updateData } = req.body;

      const bonLivraison = await this.bonLivraisonRepository.findOne({ where: { id: id as string } });
      if (!bonLivraison) {
        res.status(404).json({ message: 'Bon de livraison non trouvé' });
        return;
      }

      // Recalculate totals if lignes are provided
      if (lignes) {
        const processedLignes = [];

        for (const ligne of lignes) {
          const produit = await this.produitRepository.findOne({ where: { id: ligne.produitId } });
          if (!produit) {
            res.status(404).json({ message: `Produit ${ligne.produitId} non trouvé` });
            return;
          }

          processedLignes.push({
            ...ligne,
            produitNom: produit.nom,
            produitDescription: produit.description,
            total: ligne.quantite * ligne.prixUnitaire
          });
        }

        Object.assign(bonLivraison, {
          ...updateData,
          lignes: processedLignes
        });
      } else {
        Object.assign(bonLivraison, updateData);
      }

      await this.bonLivraisonRepository.save(bonLivraison);

      res.json({
        success: true,
        message: 'Bon de livraison mis à jour avec succès',
        data: bonLivraison
      });
    } catch (error) {
      console.error('Update bon de livraison error:', error);
      res.status(500).json({ message: 'Erreur lors de la mise à jour du bon de livraison' });
    }
  };

  // Delete bon de livraison
  public deleteBonLivraison = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const bonLivraison = await this.bonLivraisonRepository.findOne({ where: { id: id as string } });

      if (!bonLivraison) {
        res.status(404).json({ message: 'Bon de livraison non trouvé' });
        return;
      }

      await this.bonLivraisonRepository.remove(bonLivraison);

      res.json({
        success: true,
        message: 'Bon de livraison supprimé avec succès'
      });
    } catch (error) {
      console.error('Delete bon de livraison error:', error);
      res.status(500).json({ message: 'Erreur lors de la suppression du bon de livraison' });
    }
  };

  // Generate PDF for bon de livraison
  public generatePDF = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const bonLivraison = await this.bonLivraisonRepository.findOne({ 
        where: { id: id as string },
        relations: ['client', 'lignes']
      });

      if (!bonLivraison) {
        res.status(404).json({ message: 'Bon de livraison non trouvé' });
        return;
      }

      const client = await this.clientRepository.findOne({ where: { id: bonLivraison.clientId } });
      if (!client) {
        res.status(404).json({ message: 'Client non trouvé' });
        return;
      }

      const pdfBuffer = await this.pdfService.generateBonLivraisonPDF(bonLivraison, client);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="bon-livraison-${bonLivraison.numero}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Generate PDF error:', error);
      res.status(500).json({ message: 'Erreur lors de la génération du PDF' });
    }
  };
} 