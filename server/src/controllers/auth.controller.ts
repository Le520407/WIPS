import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
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
        role: 'admin',
        status: 'active',
      },
    });

    // Update last login
    await user.update({ last_login: new Date() });

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

// Password login for admin system
export const passwordLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    
    if (!user || !user.password_hash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const bcrypt = require('bcrypt');
    const isValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Account is not active' });
    }

    // Update last login
    await user.update({ last_login: new Date() });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    const userResponse = user.toJSON();
    delete (userResponse as any).password_hash;
    delete (userResponse as any).access_token;

    console.log('✅ User logged in:', user.email);

    res.json({ 
      token, 
      user: userResponse,
      message: 'Login successful' 
    });
  } catch (error) {
    console.error('Password login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const embeddedSignup = async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    
    console.log('📱 Embedded Signup/Login initiated with code:', code);
    
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
    
    // 🔄 Exchange short-lived token for long-lived token (60 days)
    console.log('🔄 Exchanging for long-lived token...');
    try {
      const axios = require('axios');
      const longTokenResponse = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: process.env.META_APP_ID,
          client_secret: process.env.META_APP_SECRET,
          fb_exchange_token: accessToken
        }
      });
      
      if (longTokenResponse.data.access_token) {
        accessToken = longTokenResponse.data.access_token;
        const expiresIn = longTokenResponse.data.expires_in || 5184000; // 60 days default
        console.log(`✅ Got long-lived token (expires in ${Math.floor(expiresIn / 86400)} days)`);
      }
    } catch (error) {
      console.log('⚠️  Could not exchange for long-lived token, using short-lived token');
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
    
    // Get WhatsApp Business Account and Phone Number info from Meta API
    let wabaId: string | null = null;
    let phoneNumberId: string | null = null;
    
    try {
      const axios = require('axios');
      
      // Get businesses
      const businessesResponse = await axios.get(
        'https://graph.facebook.com/v18.0/me/businesses',
        { params: { access_token: accessToken } }
      );
      
      if (businessesResponse.data.data && businessesResponse.data.data.length > 0) {
        const business = businessesResponse.data.data[0];
        console.log('📊 Found business:', business.name);
        
        // Get WhatsApp Business Accounts
        const wabaResponse = await axios.get(
          `https://graph.facebook.com/v18.0/${business.id}/client_whatsapp_business_accounts`,
          { params: { access_token: accessToken } }
        );
        
        if (wabaResponse.data.data && wabaResponse.data.data.length > 0) {
          const waba = wabaResponse.data.data[0];
          wabaId = waba.id;
          console.log('📱 Found WABA:', wabaId);
          
          // Get phone numbers
          const phoneResponse = await axios.get(
            `https://graph.facebook.com/v18.0/${wabaId}/phone_numbers`,
            { params: { access_token: accessToken } }
          );
          
          if (phoneResponse.data.data && phoneResponse.data.data.length > 0) {
            const phone = phoneResponse.data.data[0];
            phoneNumberId = phone.id;
            console.log('📞 Found Phone Number:', phone.display_phone_number, '(ID:', phoneNumberId, ')');
          }
        }
      }
    } catch (apiError: any) {
      console.error('❌ Failed to fetch WABA/Phone info:', apiError.message);
      return res.status(400).json({ 
        error: 'Failed to fetch WhatsApp Business Account information. Please try again.' 
      });
    }
    
    // Verify we got the required information
    if (!wabaId || !phoneNumberId) {
      console.error('❌ Missing WABA ID or Phone Number ID');
      return res.status(400).json({ 
        error: 'Could not find WhatsApp Business Account or Phone Number. Please ensure your account is properly configured.' 
      });
    }
    
    // Find existing user by WABA ID or Phone Number ID (not email, as email changes each time)
    let user = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { whatsapp_account_id: wabaId },
          { phone_number_id: phoneNumberId }
        ]
      }
    });

    let created = false;
    
    if (user) {
      // Update existing user with new token
      await user.update({
        facebook_id: userInfo.id,
        access_token: accessToken,
        phone_number_id: phoneNumberId,
        last_login: new Date(),
        status: 'active',
      });
      console.log('✅ Existing user found and token updated!');
      console.log(`   User: ${user.name} (${user.email})`);
      console.log(`   WABA ID: ${user.whatsapp_account_id}`);
      console.log(`   Phone Number ID: ${phoneNumberId}`);
    } else {
      // Create new user
      user = await User.create({
        facebook_id: userInfo.id,
        name: userInfo.name,
        email: userInfo.email,
        access_token: accessToken,
        whatsapp_account_id: wabaId,
        phone_number_id: phoneNumberId,
        status: 'active',
      });
      created = true;
      console.log('✅ New user created via Embedded Signup');
      console.log(`   Email: ${userInfo.email}`);
      console.log(`   WABA ID: ${wabaId}`);
      console.log(`   Phone Number ID: ${phoneNumberId}`);
    }

    const token = jwt.sign(
      { id: user.id, facebookId: user.facebook_id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    const actionMessage = created ? 'Account created successfully!' : 'Logged in successfully!';
    console.log(`✅ ${actionMessage}`, user.email);
    console.log('   WABA ID:', wabaId);
    console.log('   Phone Number ID:', phoneNumberId);

    res.json({ 
      token, 
      user: user.toJSON(),
      message: actionMessage,
      whatsapp_info: {
        waba_id: wabaId,
        phone_number_id: phoneNumberId
      }
    });
  } catch (error) {
    console.error('Embedded signup/login error:', error);
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

// Manual signup with WhatsApp credentials
export const manualSignup = async (req: Request, res: Response) => {
  try {
    const { 
      name, 
      email, 
      whatsapp_business_account_id, 
      phone_number_id, 
      access_token 
    } = req.body;

    // Validate required fields
    if (!name || !email || !whatsapp_business_account_id || !phone_number_id || !access_token) {
      return res.status(400).json({ 
        error: 'All fields are required: name, email, whatsapp_business_account_id, phone_number_id, access_token' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Create user
    const user = await User.create({
      facebook_id: `manual_${Date.now()}`,
      name,
      email,
      access_token,
      whatsapp_account_id: whatsapp_business_account_id,
      role: 'admin',
      status: 'active',
    });

    // Create account in admin system
    try {
      const Account = require('../models/Account').default;
      await Account.create({
        name: `${name}'s WhatsApp Business`,
        type: 'business',
        whatsapp_business_account_id,
        phone_number_id,
        access_token,
        status: 'active',
      });
      console.log('✅ Account created in admin system');
    } catch (accountError) {
      console.error('⚠️ Failed to create account in admin system:', accountError);
      // Continue anyway - user is created
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    const userResponse = user.toJSON();
    delete (userResponse as any).access_token;

    console.log('✅ Manual signup successful:', user.email);

    res.json({ 
      token, 
      user: userResponse,
      message: 'Account created successfully!' 
    });
  } catch (error) {
    console.error('Manual signup error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
};
