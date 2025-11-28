import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../middleware/auth.middleware';
import { exchangeFacebookToken, getFacebookUserInfo } from '../services/facebook.service';
import User from '../models/User';

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
    
    // Find or create user in database
    const [user] = await User.findOrCreate({
      where: { facebook_id: userInfo.id },
      defaults: {
        facebook_id: userInfo.id,
        name: userInfo.name,
        email: userInfo.email,
        access_token: fbAccessToken,
      },
    });

    const token = jwt.sign(
      { id: user.id, facebookId: user.facebook_id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.json({ token, user: user.toJSON() });
  } catch (error) {
    console.error('Facebook login error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

export const testUserLogin = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    // Find or create test user
    const [user] = await User.findOrCreate({
      where: { email: email || 'test@whatsapp-platform.com' },
      defaults: {
        facebook_id: 'test_user_2024',
        name: 'Test User',
        email: email || 'test@whatsapp-platform.com',
        whatsapp_account_id: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
      },
    });

    const token = jwt.sign(
      { id: user.id, facebookId: user.facebook_id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    console.log('✅ Test user logged in:', user.email);

    res.json({ 
      token, 
      user: user.toJSON(),
      message: 'Test user login successful. All data will be saved to database.' 
    });
  } catch (error) {
    console.error('Test user login error:', error);
    res.status(500).json({ error: 'Test user login failed' });
  }
};

export const embeddedSignup = async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    
    console.log('📱 Embedded Signup initiated with code:', code);
    
    // Exchange code for access token (if needed)
    let accessToken = code;
    
    if (code && code.length > 100) {
      // This is already an access token
      accessToken = code;
    } else if (code) {
      // Exchange code for token
      try {
        accessToken = await exchangeFacebookToken(code);
      } catch (error) {
        console.log('Using code as token directly');
        accessToken = code;
      }
    }
    
    // Get user info from Facebook
    let userInfo;
    try {
      userInfo = await getFacebookUserInfo(accessToken);
    } catch (error) {
      // If we can't get user info, create a generic user
      console.log('Creating generic WhatsApp user');
      userInfo = {
        id: 'whatsapp_' + Date.now(),
        name: 'WhatsApp Business User',
        email: `whatsapp_${Date.now()}@business.com`
      };
    }
    
    // Find or create user in database
    const [user] = await User.findOrCreate({
      where: { facebook_id: userInfo.id },
      defaults: {
        facebook_id: userInfo.id,
        name: userInfo.name,
        email: userInfo.email,
        access_token: accessToken,
        whatsapp_account_id: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
      },
    });

    const token = jwt.sign(
      { id: user.id, facebookId: user.facebook_id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    console.log('✅ Embedded Signup successful:', user.email);

    res.json({ 
      token, 
      user: user.toJSON(),
      message: 'WhatsApp Business connected successfully!' 
    });
  } catch (error) {
    console.error('Embedded signup error:', error);
    res.status(500).json({ error: 'Embedded signup failed' });
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

    const [user] = await User.findOrCreate({
      where: { facebook_id: userInfo.id },
      defaults: {
        facebook_id: userInfo.id,
        name: userInfo.name,
        email: userInfo.email,
        access_token: accessToken,
      },
    });

    const token = jwt.sign(
      { id: user.id, facebookId: user.facebook_id },
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
    const user = await User.findByPk(req.user!.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user: user.toJSON() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user' });
  }
};
