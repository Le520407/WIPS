import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../middleware/auth.middleware';
import { exchangeFacebookToken, getFacebookUserInfo } from '../services/facebook.service';

export const facebookLogin = async (req: Request, res: Response) => {
  try {
    const { code, accessToken } = req.body;
    
    let fbAccessToken = accessToken;
    
    if (code) {
      fbAccessToken = await exchangeFacebookToken(code);
    }
    
    if (!fbAccessToken) {
      return res.status(400).json({ error: 'No access token provided' });
    }

    const userInfo = await getFacebookUserInfo(fbAccessToken);
    
    // TODO: Save user to database
    const user = {
      id: userInfo.id,
      facebookId: userInfo.id,
      name: userInfo.name,
      email: userInfo.email
    };

    const token = jwt.sign(
      { id: user.id, facebookId: user.facebookId },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.json({ token, user });
  } catch (error) {
    console.error('Facebook login error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

export const facebookCallback = async (req: Request, res: Response) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({ error: 'No authorization code' });
    }

    const accessToken = await exchangeFacebookToken(code as string);
    const userInfo = await getFacebookUserInfo(accessToken);

    const token = jwt.sign(
      { id: userInfo.id, facebookId: userInfo.id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
  } catch (error) {
    console.error('Facebook callback error:', error);
    res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    // TODO: Fetch user from database
    const user = {
      id: req.user!.id,
      facebookId: req.user!.facebookId
    };
    
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user' });
  }
};
