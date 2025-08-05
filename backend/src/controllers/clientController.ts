import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Client } from '../models/Client';

export class ClientController {
  private clientRepository = AppDataSource.getRepository(Client);

  // Get all clients
  public getAllClients = async (req: Request, res: Response): Promise<void> => {
    try {
      const clients = await this.clientRepository.find({
        order: { dateCreation: 'DESC' }
      });

      res.json({
        success: true,
        data: clients
      });
    } catch (error) {
      console.error('Get all clients error:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des clients' });
    }
  };

  // Get client by ID
  public getClientById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const client = await this.clientRepository.findOne({ where: { id: id as string } });

      if (!client) {
        res.status(404).json({ message: 'Client non trouvé' });
        return;
      }

      res.json({
        success: true,
        data: client
      });
    } catch (error) {
      console.error('Get client by ID error:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération du client' });
    }
  };

  // Create new client
  public createClient = async (req: Request, res: Response): Promise<void> => {
    try {
      const clientData = req.body;
      
      // Validation manuelle des champs requis
      const requiredFields = ['nom', 'email', 'telephone', 'adresse', 'ville', 'codePostal', 'pays'];
      const missingFields = requiredFields.filter(field => !clientData[field] || clientData[field].trim() === '');
      
      if (missingFields.length > 0) {
        res.status(400).json({ 
          message: `Champs manquants: ${missingFields.join(', ')}`,
          missingFields 
        });
        return;
      }

      // Validation de l'email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(clientData.email)) {
        res.status(400).json({ message: 'Format d\'email invalide' });
        return;
      }

      // Vérifier si l'email existe déjà
      const existingClient = await this.clientRepository.findOne({ 
        where: { email: clientData.email } 
      });
      
      if (existingClient) {
        res.status(400).json({ message: 'Un client avec cet email existe déjà' });
        return;
      }

      // Génération du code client auto-incrémenté (5 chiffres)
      const lastClient = await this.clientRepository.find({
        order: { code: 'DESC' },
        take: 1
      });
      let nextNumber = 1;
      if (
  lastClient.length > 0 &&
  /^\d{5}$/.test(lastClient[0]?.code ?? '')
) {
  nextNumber = parseInt(lastClient[0]!.code, 10) + 1;
}
      clientData.code = 'CLT-' + nextNumber.toString().padStart(5, '0');

      const client = this.clientRepository.create(clientData);
      await this.clientRepository.save(client);

      res.status(201).json({
        success: true,
        message: 'Client créé avec succès',
        data: client
      });
    } catch (error) {
      console.error('Create client error:', error);
      res.status(500).json({ message: 'Erreur lors de la création du client' });
    }
  };

  // Update client
  public updateClient = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const client = await this.clientRepository.findOne({ where: { id: id as string } });
      if (!client) {
        res.status(404).json({ message: 'Client non trouvé' });
        return;
      }

      Object.assign(client, updateData);
      await this.clientRepository.save(client);

      res.json({
        success: true,
        message: 'Client mis à jour avec succès',
        data: client
      });
    } catch (error) {
      console.error('Update client error:', error);
      res.status(500).json({ message: 'Erreur lors de la mise à jour du client' });
    }
  };

  // Delete client
  public deleteClient = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const client = await this.clientRepository.findOne({ where: { id: id as string } });

      if (!client) {
        res.status(404).json({ message: 'Client non trouvé' });
        return;
      }

      await this.clientRepository.remove(client);

      res.json({
        success: true,
        message: 'Client supprimé avec succès'
      });
    } catch (error) {
      console.error('Delete client error:', error);
      res.status(500).json({ message: 'Erreur lors de la suppression du client' });
    }
  };
} 