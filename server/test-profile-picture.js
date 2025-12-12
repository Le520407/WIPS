const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:3002/api/business-profile';
const USER_ID = '24a8cbe8-c31b-4e1a-a745-4fd4461b3ce6';

async function testProfilePictureUpload() {
  console.log('🧪 Testing Business Profile Picture Upload\n');
  console.log('============================================================\n');

  try {
    // Test 1: Get current profile
    console.log('1️⃣  Getting current business profile...');
    const profileResponse = await axios.get(`${API_URL}?userId=${USER_ID}`);
    console.log('✅ Current profile:', JSON.stringify(profileResponse.data, null, 2));
    console.log('');

    // Test 2: Upload profile picture
    console.log('2️⃣  Testing profile picture upload...');
    
    // Create a simple test image (1x1 pixel PNG)
    const testImageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );

    const form = new FormData();
    form.append('image', testImageBuffer, {
      filename: 'test-profile.png',
      contentType: 'image/png',
    });

    try {
      const uploadResponse = await axios.post(
        `${API_URL}/picture?userId=${USER_ID}`,
        form,
        {
          headers: {
            ...form.getHeaders(),
          },
        }
      );
      console.log('✅ Upload response:', JSON.stringify(uploadResponse.data, null, 2));
    } catch (uploadError) {
      console.error('❌ Upload failed:', uploadError.response?.data || uploadError.message);
      console.error('Status:', uploadError.response?.status);
      console.error('Full error:', JSON.stringify(uploadError.response?.data, null, 2));
    }

    console.log('');

    // Test 3: Get profile again to see if picture was updated
    console.log('3️⃣  Getting profile after upload...');
    const updatedProfileResponse = await axios.get(`${API_URL}?userId=${USER_ID}`);
    console.log('Profile picture URL:', updatedProfileResponse.data.profile?.data?.[0]?.profile_picture_url || 'Not set');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }

  console.log('\n============================================================');
  console.log('Test completed');
}

// Run the test
testProfilePictureUpload();
