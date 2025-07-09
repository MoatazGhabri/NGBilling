import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Facture } from '../models/Facture';
import { Client } from '../models/Client';
import { Produit } from '../models/Produit';
import { PDFService } from '../services/pdfService';

export class FactureController {
  private factureRepository = AppDataSource.getRepository(Facture);
  private clientRepository = AppDataSource.getRepository(Client);
  private produitRepository = AppDataSource.getRepository(Produit);
  private pdfService = new PDFService();

  // Get all invoices
  public getAllFactures = async (req: Request, res: Response): Promise<void> => {
    try {
      const factures = await this.factureRepository.find({
        relations: ['client', 'lignes', 'paiements'],
        order: { dateCreation: 'DESC' }
      });

      res.json({
        success: true,
        data: factures
      });
    } catch (error) {
      console.error('Get all factures error:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des factures' });
    }
  };

  // Get invoice by ID
  public getFactureById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const facture = await this.factureRepository.findOne({
        where: { id: id as string },
        relations: ['client', 'lignes', 'paiements']
      });

      if (!facture) {
        res.status(404).json({ message: 'Facture non trouvée' });
        return;
      }

      res.json({
        success: true,
        data: facture
      });
    } catch (error) {
      console.error('Get facture by ID error:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération de la facture' });
    }
  };

  // Helper to update client's totalFacture
  private async updateClientTotalFacture(clientId: string) {
    const factures = await this.factureRepository.find({ where: { clientId } });
    const total = factures.reduce((sum, f) => sum + (typeof f.total === 'number' ? f.total : 0), 0);
    await this.clientRepository.update(clientId, { totalFacture: total });
  }

  // Create new invoice
  public createFacture = async (req: Request, res: Response): Promise<void> => {
    try {
      const { clientId, lignes, ...factureData } = req.body;

      // Verify client exists
      const client = await this.clientRepository.findOne({ where: { id: clientId } });
      if (!client) {
        res.status(404).json({ message: 'Client non trouvé' });
        return;
      }

      // Calculate totals
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
      const remiseTotale = factureData.remiseTotale || 0;
      const remiseMontant = sousTotal * (remiseTotale / 100);
      const sousTotalApresRemise = sousTotal - remiseMontant;
      const tva = sousTotalApresRemise * 0.19;
      const total = sousTotalApresRemise + tva;

      const facture = this.factureRepository.create({
        ...factureData,
        clientId,
        clientNom: client.nom,
        sousTotal,
        tva,
        total,
        lignes: processedLignes,
        remiseTotale
      });

      await this.factureRepository.save(facture);
      await this.updateClientTotalFacture(clientId);

      res.status(201).json({
        success: true,
        message: 'Facture créée avec succès',
        data: facture
      });
    } catch (error) {
      console.error('Create facture error:', error);
      res.status(500).json({ message: 'Erreur lors de la création de la facture' });
    }
  };

  // Update invoice
  public updateFacture = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const facture = await this.factureRepository.findOne({ where: { id: id as string } });
      if (!facture) {
        res.status(404).json({ message: 'Facture non trouvée' });
        return;
      }

      Object.assign(facture, updateData);
      await this.factureRepository.save(facture);
      await this.updateClientTotalFacture(facture.clientId);

      res.json({
        success: true,
        message: 'Facture mise à jour avec succès',
        data: facture
      });
    } catch (error) {
      console.error('Update facture error:', error);
      res.status(500).json({ message: 'Erreur lors de la mise à jour de la facture' });
    }
  };

  // Delete invoice
  public deleteFacture = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const facture = await this.factureRepository.findOne({ where: { id: id as string } });

      if (!facture) {
        res.status(404).json({ message: 'Facture non trouvée' });
        return;
      }

      await this.factureRepository.remove(facture);
      await this.updateClientTotalFacture(facture.clientId);

      res.json({
        success: true,
        message: 'Facture supprimée avec succès'
      });
    } catch (error) {
      console.error('Delete facture error:', error);
      res.status(500).json({ message: 'Erreur lors de la suppression de la facture' });
    }
  };

  // Get invoices by status
  public getFacturesByStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { statut } = req.params;
      const factures = await this.factureRepository.find({
        where: { statut: statut as 'brouillon' | 'envoyee' | 'payee' | 'en_retard' | 'annulee' },
        relations: ['client'],
        order: { dateCreation: 'DESC' }
      });

      res.json({
        success: true,
        data: factures
      });
    } catch (error) {
      console.error('Get factures by status error:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des factures' });
    }
  };

  // Generate PDF for facture
  public generatePDF = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const facture = await this.factureRepository.findOne({ 
        where: { id: id as string },
        relations: ['client', 'lignes']
      });

      if (!facture) {
        res.status(404).json({ message: 'Facture non trouvée' });
        return;
      }

      const client = await this.clientRepository.findOne({ where: { id: facture.clientId } });
      if (!client) {
        res.status(404).json({ message: 'Client non trouvé' });
        return;
      }

      const pdfBuffer = await this.pdfService.generateFacturePDF(facture, client);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="facture-${facture.numero}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Generate PDF error:', error);
      res.status(500).json({ message: 'Erreur lors de la génération du PDF' });
    }
  };
} 