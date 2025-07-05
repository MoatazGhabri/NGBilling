import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Settings } from '../models/Settings';

export class SettingsController {
  private settingsRepository = AppDataSource.getRepository(Settings);

  // Get settings (single row)
  public getSettings = async (req: Request, res: Response): Promise<void> => {
    try {
      let settings = await this.settingsRepository.findOne({ where: {} });
      if (!settings) {
        settings = this.settingsRepository.create({ data: {} });
        await this.settingsRepository.save(settings);
      }
      res.json({ success: true, data: settings.data });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erreur lors de la récupération des paramètres' });
    }
  };

  // Update settings (single row)
  public updateSettings = async (req: Request, res: Response): Promise<void> => {
    try {
      let settings = await this.settingsRepository.findOne({ where: {} });
      if (!settings) {
        settings = this.settingsRepository.create({ data: {} });
      }
      settings.data = { ...settings.data, ...req.body };
      await this.settingsRepository.save(settings);
      res.json({ success: true, data: settings.data });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour des paramètres' });
    }
  };
} 