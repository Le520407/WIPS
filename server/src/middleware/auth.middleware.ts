import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    facebookId: string;
    accessToken?: string;
  };
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Support both 'id' and 'userId' fields for backward compatibility
    const userId = decoded.id || decoded.userId;
    
    // Fetch user from database to get access token
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    req.user = {
      id: user.id,
      facebookId: user.facebook_id,
      accessToken: user.access_token
    };
    
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
