import axios from 'axios';

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v21.0';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

/**
 * Get Business Profile
 * https://developers.facebook.com/docs/whatsapp/business-management-api/manage-profile
 */
export const getBusinessProfile = async () => {
  try {
    const response = await axios.get(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/whatsapp_business_profile`,
      {
        params: {
          fields: 'about,address,description,email,profile_picture_url,websites,vertical,messaging_product'
        },
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
        },
      }
    );

    console.log('✅ Business profile retrieved:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Get business profile error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Update Business Profile
 * https://developers.facebook.com/docs/whatsapp/business-management-api/manage-profile
 */
export const updateBusinessProfile = async (profileData: {
  about?: string;
  address?: string;
  description?: string;
  email?: string;
  vertical?: string;
  websites?: string[];
}) => {
  try {
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/whatsapp_business_profile`,
      {
        messaging_product: 'whatsapp',
        ...profileData
      },
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ Business profile updated:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Update business profile error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Upload Profile Picture
 * Method 1: Direct upload to profile (current method)
 * Method 2: Upload to media first, then set as profile picture
 * https://developers.facebook.com/docs/whatsapp/business-management-api/manage-profile#profile-picture
 */
export const uploadProfilePicture = async (imageBuffer: Buffer, mimeType: string) => {
  try {
    console.log('📤 Starting profile picture upload...');
    console.log('Image size:', imageBuffer.length, 'bytes');
    console.log('MIME type:', mimeType);

    // Method: Direct upload using multipart/form-data
    const FormData = require('form-data');
    const form = new FormData();
    form.append('messaging_product', 'whatsapp');
    form.append('file', imageBuffer, {
      filename: 'profile.jpg',
      contentType: mimeType,
    });

    console.log('🔄 Uploading to Meta API...');
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/whatsapp_business_profile`,
      form,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          ...form.getHeaders(),
        },
      }
    );

    console.log('✅ Meta API response:', JSON.stringify(response.data, null, 2));
    console.log('⏳ Note: Profile picture may take a few moments to appear in WhatsApp');
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Upload profile picture error:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Full error details:', JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
};

/**
 * Delete Profile Picture
 */
export const deleteProfilePicture = async () => {
  try {
    const response = await axios.delete(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/whatsapp_business_profile/picture`,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
        },
      }
    );

    console.log('✅ Profile picture deleted:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Delete profile picture error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get available business verticals (categories)
 */
export const getBusinessVerticals = () => {
  return [
    { value: 'AUTOMOTIVE', label: 'Automotive' },
    { value: 'BEAUTY', label: 'Beauty, Spa and Salon' },
    { value: 'APPAREL', label: 'Clothing and Apparel' },
    { value: 'EDU', label: 'Education' },
    { value: 'ENTERTAIN', label: 'Entertainment' },
    { value: 'EVENT_PLAN', label: 'Event Planning and Service' },
    { value: 'FINANCE', label: 'Finance and Banking' },
    { value: 'GROCERY', label: 'Food and Grocery' },
    { value: 'GOVT', label: 'Public Service' },
    { value: 'HOTEL', label: 'Hotel and Lodging' },
    { value: 'HEALTH', label: 'Medical and Health' },
    { value: 'NONPROFIT', label: 'Non-profit' },
    { value: 'PROF_SERVICES', label: 'Professional Services' },
    { value: 'RETAIL', label: 'Shopping and Retail' },
    { value: 'TRAVEL', label: 'Travel and Transportation' },
    { value: 'RESTAURANT', label: 'Restaurant' },
    { value: 'OTHER', label: 'Other' },
  ];
};
