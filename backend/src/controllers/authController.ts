import { Request, Response } from 'express';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { JWTPayload } from '../middlewares/auth';

export class AuthController {
  private userRepository = AppDataSource.getRepository(User);

  // Register new user
  public register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password, nom, telephone } = req.body;

      // Check if user already exists
      const existingUser = await this.userRepository.findOne({ where: { email } });
      if (existingUser) {
        res.status(400).json({ message: 'Un utilisateur avec cet email existe déjà' });
        return;
      }

      // Create new user
      const user = this.userRepository.create({
        email,
        password,
        nom,
        telephone
      });

      await this.userRepository.save(user);

      // Generate JWT token
      const payload: JWTPayload = {
        userId: user.id,
        email: user.email,
        role: user.role
      };

      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in environment variables');
      }
      const options: SignOptions = { expiresIn: (process.env.JWT_EXPIRES_IN || '24h') as any };
      const token = jwt.sign(payload, String(process.env.JWT_SECRET), options);

      res.status(201).json({
        success: true,
        message: 'Utilisateur créé avec succès',
        data: {
          user: {
            id: user.id,
            email: user.email,
            nom: user.nom,
            role: user.role
          },
          token
        }
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ message: 'Erreur lors de la création du compte' });
    }
  };

  // Login user
  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await this.userRepository.findOne({ where: { email } });
      if (!user || !user.actif) {
        res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        return;
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        return;
      }

      // Generate JWT token
      const payload: JWTPayload = {
        userId: user.id,
        email: user.email,
        role: user.role
      };

      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in environment variables');
      }
      const options: SignOptions = { expiresIn: (process.env.JWT_EXPIRES_IN || '24h') as any };
      const token = jwt.sign(payload, String(process.env.JWT_SECRET), options);

      res.json({
        success: true,
        message: 'Connexion réussie',
        data: {
          user: {
            id: user.id,
            email: user.email,
            nom: user.nom,
            role: user.role
          },
          token
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Erreur lors de la connexion' });
    }
  };

  // Get current user profile
  public getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Utilisateur non authentifié' });
        return;
      }

      res.json({
        success: true,
        data: {
          user: {
            id: req.user.id,
            email: req.user.email,
            nom: req.user.nom,
            role: req.user.role
          }
        }
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération du profil' });
    }
  };
} 