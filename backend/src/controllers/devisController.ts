import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Devis } from '../models/Devis';
import { Produit } from '../models/Produit';
import { Client } from '../models/Client';
import { PDFService } from '../services/pdfService';

export class DevisController {
  private devisRepository = AppDataSource.getRepository(Devis);
  private produitRepository = AppDataSource.getRepository(Produit);
  private clientRepository = AppDataSource.getRepository(Client);
  private pdfService = new PDFService();

  // Get all devis
  public getAllDevis = async (req: Request, res: Response): Promise<void> => {
    try {
      const devis = await this.devisRepository.find({
        relations: ['client', 'lignes'],
        order: { dateCreation: 'DESC' }
      });

      res.json({
        success: true,
        data: devis
      });
    } catch (error) {
      console.error('Get all devis error:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des devis' });
    }
  };

  // Get devis by ID
  public getDevisById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const devis = await this.devisRepository.findOne({ 
        where: { id: id as string },
        relations: ['client', 'lignes']
      });

      if (!devis) {
        res.status(404).json({ message: 'Devis non trouvé' });
        return;
      }

      res.json({
        success: true,
        data: devis
      });
    } catch (error) {
      console.error('Get devis by ID error:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération du devis' });
    }
  };

  // Create new devis
  public createDevis = async (req: Request, res: Response): Promise<void> => {
    try {
      const { clientId, lignes, ...devisData } = req.body;
      
      // Validate products exist and calculate totals
      let sousTotal = 0;
      const processedLignes = [];

      for (const ligne of lignes) {
        const produit = await this.produitRepository.findOne({ where: { id: ligne.produitId } });
        if (!produit) {
          res.status(404).json({ message: `Produit ${ligne.produitId} non trouvé` });
          return;
        }

        const remiseLigne = ligne.remise || 0;
        const totalLigne = ligne.quantite * ligne.prixUnitaire * (1 - remiseLigne / 100);
        sousTotal += totalLigne;

        processedLignes.push({
          ...ligne,
          produitNom: produit.nom,
          total: totalLigne
        });
      }

      const remiseTotale = devisData.remiseTotale || 0;
      const remiseMontant = sousTotal * (remiseTotale / 100);
      const sousTotalApresRemise = sousTotal - remiseMontant;
      const tva = sousTotalApresRemise * 0.19;
      const total = sousTotalApresRemise + tva;

      // Avant la création du devis
      let numero = devisData.numero;
      let exists = await this.devisRepository.findOne({ where: { numero } });
      while (exists) {
        numero = `D-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        exists = await this.devisRepository.findOne({ where: { numero } });
      }
      devisData.numero = numero;

      const devis = this.devisRepository.create({
        ...devisData,
        clientId,
        sousTotal,
        tva,
        total,
        remiseTotale,
        lignes: processedLignes
      });

      await this.devisRepository.save(devis);

      res.status(201).json({
        success: true,
        message: 'Devis créé avec succès',
        data: devis
      });
    } catch (error) {
      console.error('Create devis error:', error);
      res.status(500).json({ message: 'Erreur lors de la création du devis' });
    }
  };

  // Update devis
  public updateDevis = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { lignes, ...updateData } = req.body;

      const devis = await this.devisRepository.findOne({ where: { id: id as string } });
      if (!devis) {
        res.status(404).json({ message: 'Devis non trouvé' });
        return;
      }

      // Recalculate totals if lignes are provided
      if (lignes) {
        let sousTotal = 0;
        const processedLignes = [];

        for (const ligne of lignes) {
          const produit = await this.produitRepository.findOne({ where: { id: ligne.produitId } });
          if (!produit) {
            res.status(404).json({ message: `Produit ${ligne.produitId} non trouvé` });
            return;
          }

          const remiseLigne = ligne.remise || 0;
          const totalLigne = ligne.quantite * ligne.prixUnitaire * (1 - remiseLigne / 100);
          sousTotal += totalLigne;

          processedLignes.push({
            ...ligne,
            produitNom: produit.nom,
            total: totalLigne
          });
        }

        const remiseTotale = updateData.remiseTotale || 0;
        const remiseMontant = sousTotal * (remiseTotale / 100);
        const sousTotalApresRemise = sousTotal - remiseMontant;
        const tva = sousTotalApresRemise * 0.19;
        const total = sousTotalApresRemise + tva;

        Object.assign(devis, {
          ...updateData,
          sousTotal,
          tva,
          total,
          remiseTotale,
          lignes: processedLignes
        });
      } else {
        Object.assign(devis, updateData);
      }

      await this.devisRepository.save(devis);

      res.json({
        success: true,
        message: 'Devis mis à jour avec succès',
        data: devis
      });
    } catch (error) {
      console.error('Update devis error:', error);
      res.status(500).json({ message: 'Erreur lors de la mise à jour du devis' });
    }
  };

  // Delete devis
  public deleteDevis = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const devis = await this.devisRepository.findOne({ where: { id: id as string } });

      if (!devis) {
        res.status(404).json({ message: 'Devis non trouvé' });
        return;
      }

      await this.devisRepository.remove(devis);

      res.json({
        success: true,
        message: 'Devis supprimé avec succès'
      });
    } catch (error) {
      console.error('Delete devis error:', error);
      res.status(500).json({ message: 'Erreur lors de la suppression du devis' });
    }
  };

  // Generate PDF for devis
  public generatePDF = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const devis = await this.devisRepository.findOne({ 
        where: { id: id as string },
        relations: ['client', 'lignes']
      });

      if (!devis) {
        res.status(404).json({ message: 'Devis non trouvé' });
        return;
      }

      const client = await this.clientRepository.findOne({ where: { id: devis.clientId } });
      if (!client) {
        res.status(404).json({ message: 'Client non trouvé' });
        return;
      }

      const pdfBuffer = await this.pdfService.generateDevisPDF(devis, client);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="devis-${devis.numero}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Generate PDF error:', error);
      res.status(500).json({ message: 'Erreur lors de la génération du PDF' });
    }
  };
} 