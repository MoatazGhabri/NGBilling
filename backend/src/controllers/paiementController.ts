import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Paiement } from '../models/Paiement';
import { Facture } from '../models/Facture';

export class PaiementController {
  private paiementRepository = AppDataSource.getRepository(Paiement);
  private factureRepository = AppDataSource.getRepository(Facture);

  // Get all payments
  public getAllPaiements = async (req: Request, res: Response): Promise<void> => {
    try {
      const paiements = await this.paiementRepository.find({
        relations: ['facture'],
        order: { datePaiement: 'DESC' }
      });

      res.json({
        success: true,
        data: paiements
      });
    } catch (error) {
      console.error('Get all paiements error:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des paiements' });
    }
  };

  // Get payment by ID
  public getPaiementById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const paiement = await this.paiementRepository.findOne({
        where: { id: id as string },
        relations: ['facture']
      });

      if (!paiement) {
        res.status(404).json({ message: 'Paiement non trouvé' });
        return;
      }

      res.json({
        success: true,
        data: paiement
      });
    } catch (error) {
      console.error('Get paiement by ID error:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération du paiement' });
    }
  };

  // Create new payment
  public createPaiement = async (req: Request, res: Response): Promise<void> => {
    try {
      const { factureId, ...paiementData } = req.body;

      // Verify invoice exists
      const facture = await this.factureRepository.findOne({ where: { id: factureId } });
      if (!facture) {
        res.status(404).json({ message: 'Facture non trouvée' });
        return;
      }

      const paiement = this.paiementRepository.create({
        ...paiementData,
        factureId
      });

      await this.paiementRepository.save(paiement);

      res.status(201).json({
        success: true,
        message: 'Paiement créé avec succès',
        data: paiement
      });
    } catch (error) {
      console.error('Create paiement error:', error);
      res.status(500).json({ message: 'Erreur lors de la création du paiement' });
    }
  };

  // Update payment
  public updatePaiement = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const paiement = await this.paiementRepository.findOne({ where: { id: id as string } });
      if (!paiement) {
        res.status(404).json({ message: 'Paiement non trouvé' });
        return;
      }

      Object.assign(paiement, updateData);
      await this.paiementRepository.save(paiement);

      res.json({
        success: true,
        message: 'Paiement mis à jour avec succès',
        data: paiement
      });
    } catch (error) {
      console.error('Update paiement error:', error);
      res.status(500).json({ message: 'Erreur lors de la mise à jour du paiement' });
    }
  };

  // Delete payment
  public deletePaiement = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const paiement = await this.paiementRepository.findOne({ where: { id: id as string } });

      if (!paiement) {
        res.status(404).json({ message: 'Paiement non trouvé' });
        return;
      }

      await this.paiementRepository.remove(paiement);

      res.json({
        success: true,
        message: 'Paiement supprimé avec succès'
      });
    } catch (error) {
      console.error('Delete paiement error:', error);
      res.status(500).json({ message: 'Erreur lors de la suppression du paiement' });
    }
  };

  // Get payments by invoice
  public getPaiementsByFacture = async (req: Request, res: Response): Promise<void> => {
    try {
      const { factureId } = req.params;
      const paiements = await this.paiementRepository.find({
        where: { factureId: factureId as string },
        order: { datePaiement: 'DESC' }
      });

      res.json({
        success: true,
        data: paiements
      });
    } catch (error) {
      console.error('Get paiements by facture error:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des paiements' });
    }
  };

  // Get payments by status
  public getPaiementsByStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { statut } = req.params;
      const paiements = await this.paiementRepository.find({
        where: { statut: statut as 'en_attente' | 'confirme' | 'refuse' },
        relations: ['facture'],
        order: { datePaiement: 'DESC' }
      });

      res.json({
        success: true,
        data: paiements
      });
    } catch (error) {
      console.error('Get paiements by status error:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des paiements' });
    }
  };
} 