const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const API_URL = 'http://localhost:3002';
const TEST_PHONE = process.env.TEST_PHONE_NUMBER || '+60105520735';
const JWT_SECRET = process.env.JWT_SECRET || 'astsi_jwt_secret_key_2024_production_ready';

async function testAddress() {
  try {
    console.log('🧪 Testing Address Messages...\n');

    // Generate token
    const userId = '24a8cbe8-c31b-4e1a-a745-4fd4461b3ce6';
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
    console.log('✅ Generated auth token\n');

    // Test 1: Send home address
    console.log('📝 Test 1: Sending home address...');
    const homeAddress = await axios.post(
      `${API_URL}/api/messages/send-address`,
      {
        to: TEST_PHONE,
        name: 'John Doe',
        address: {
          street: '123 Main Street',
          city: 'Kuala Lumpur',
          state: 'Wilayah Persekutuan',
          zip: '50000',
          country: 'Malaysia',
          country_code: 'MY',
          type: 'HOME'
        }
      },
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    console.log('✅ Home address sent:', homeAddress.data);
    console.log('');

    // Wait 2 seconds
    console.log('⏳ Waiting 2 seconds...\n');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 2: Send work address
    console.log('📝 Test 2: Sending work address...');
    const workAddress = await axios.post(
      `${API_URL}/api/messages/send-address`,
      {
        to: TEST_PHONE,
        name: 'ACME Corporation',
        address: {
          street: '456 Business Avenue, Suite 100',
          city: 'Petaling Jaya',
          state: 'Selangor',
          zip: '47800',
          country: 'Malaysia',
          country_code: 'MY',
          type: 'WORK'
        }
      },
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    console.log('✅ Work address sent:', workAddress.data);
    console.log('');

    // Wait 2 seconds
    console.log('⏳ Waiting 2 seconds...\n');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 3: Send minimal address
    console.log('📝 Test 3: Sending minimal address...');
    const minimalAddress = await axios.post(
      `${API_URL}/api/messages/send-address`,
      {
        to: TEST_PHONE,
        name: 'Coffee Shop',
        address: {
          street: '789 Coffee Lane',
          city: 'Penang',
          country: 'Malaysia'
        }
      },
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    console.log('✅ Minimal address sent:', minimalAddress.data);
    console.log('');

    console.log('✅ All tests passed!');
    console.log('\n💡 Check your WhatsApp to see the address messages!');
    console.log('📱 You can tap on the address to open it in Maps');

  } catch (error) {
    console.error('❌ Test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testAddress();
