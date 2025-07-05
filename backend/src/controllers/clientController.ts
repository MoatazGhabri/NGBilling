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