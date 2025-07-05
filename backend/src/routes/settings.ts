import { Router } from 'express';
import { SettingsController } from '../controllers/settingsController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();
const settingsController = new SettingsController();

router.get('/', authenticateToken, settingsController.getSettings);
router.put('/', authenticateToken, settingsController.updateSettings);

export default router; 