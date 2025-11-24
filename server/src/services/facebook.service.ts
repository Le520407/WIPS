import axios from 'axios';

export const exchangeFacebookToken = async (code: string): Promise<string> => {
  try {
    const response = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
      params: {
        client_id: process.env.META_APP_ID,
        client_secret: process.env.META_APP_SECRET,
        code,
        redirect_uri: `${process.env.CLIENT_URL}/auth/callback`
      }
    });

    return response.data.access_token;
  } catch (error) {
    console.error('Token exchange error:', error);
    throw new Error('Failed to exchange Facebook token');
  }
};

export const getFacebookUserInfo = async (accessToken: string) => {
  try {
    const response = await axios.get('https://graph.facebook.com/me', {
      params: {
        fields: 'id,name,email',
        access_token: accessToken
      }
    });

    return response.data;
  } catch (error) {
    console.error('Get user info error:', error);
    throw new Error('Failed to get Facebook user info');
  }
};
