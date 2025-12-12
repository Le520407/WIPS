require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v21.0';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

async function testProfilePictureUpload() {
  console.log('\n🧪 Testing Profile Picture Upload...\n');

  try {
    // 1. Get current profile
    console.log('1️⃣ Getting current profile...');
    const profileResponse = await axios.get(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/whatsapp_business_profile`,
      {
        params: {
          fields: 'about,address,description,email,profile_picture_url,websites,vertical'
        },
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
        },
      }
    );
    
    console.log('Current profile:', JSON.stringify(profileResponse.data, null, 2));
    const currentPictureUrl = profileResponse.data.data[0]?.profile_picture_url;
    console.log('Current picture URL:', currentPictureUrl || 'None');

    // 2. Try to upload a test image
    console.log('\n2️⃣ Uploading test image...');
    
    // Create a simple test image buffer (1x1 red pixel PNG)
    const testImageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==',
      'base64'
    );

    const form = new FormData();
    form.append('messaging_product', 'whatsapp');
    form.append('file', testImageBuffer, {
      filename: 'test-profile.png',
      contentType: 'image/png',
    });

    const uploadResponse = await axios.post(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/whatsapp_business_profile`,
      form,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          ...form.getHeaders(),
        },
      }
    );

    console.log('Upload response:', JSON.stringify(uploadResponse.data, null, 2));

    // 3. Wait a bit and check if profile updated
    console.log('\n3️⃣ Waiting 3 seconds for Meta to process...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('\n4️⃣ Getting updated profile...');
    const updatedProfileResponse = await axios.get(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/whatsapp_business_profile`,
      {
        params: {
          fields: 'about,address,description,email,profile_picture_url,websites,vertical'
        },
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
        },
      }
    );
    
    console.log('Updated profile:', JSON.stringify(updatedProfileResponse.data, null, 2));
    const newPictureUrl = updatedProfileResponse.data.data[0]?.profile_picture_url;
    console.log('New picture URL:', newPictureUrl || 'None');

    if (newPictureUrl && newPictureUrl !== currentPictureUrl) {
      console.log('\n✅ SUCCESS: Picture URL changed!');
      console.log('Old:', currentPictureUrl);
      console.log('New:', newPictureUrl);
    } else if (newPictureUrl === currentPictureUrl) {
      console.log('\n⚠️  WARNING: Picture URL did not change');
      console.log('This might mean:');
      console.log('- Meta is still processing the image');
      console.log('- The upload failed silently');
      console.log('- The same image was uploaded');
    } else {
      console.log('\n❌ ERROR: No picture URL found');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Full error:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testProfilePictureUpload();
