import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    console.log('🔍 Auth Debug:', {
      url: req.url,
      method: req.method,
      hasAuthHeader: !!authHeader,
      hasToken: !!token,
      tokenLength: token?.length || 0
    });

    if (!token) {
      console.log('❌ No token provided');
      res.status(401).json({ message: 'Token d\'accès requis' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    console.log('✅ Token verified, userId:', decoded.userId);
    
    // Get user from database
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: decoded.userId } });

    console.log('🔍 User lookup result:', {
      found: !!user,
      userId: decoded.userId,
      userActive: user?.actif
    });

    if (!user || !user.actif) {
      console.log('❌ User not found or inactive');
      res.status(401).json({ message: 'Utilisateur non trouvé ou inactif' });
      return;
    }

    console.log('✅ User authenticated:', user.email);
    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    res.status(403).json({ message: 'Token invalide' });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentification requise' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Permissions insuffisantes' });
      return;
    }

    next();
  };
}; 