/**
 * Test script for Business Profile API
 * 
 * This script tests:
 * 1. Get business profile
 * 2. Update business profile
 * 3. Get business verticals
 * 
 * Usage:
 *   node test-business-profile.js
 */

require('dotenv').config();
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3002';
const TOKEN = 'test-token'; // Replace with your actual token

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json'
  }
});

async function testGetProfile() {
  console.log('\n📋 Test 1: Get Business Profile');
  console.log('='.repeat(60));
  
  try {
    const response = await api.get('/api/business-profile');
    console.log('✅ Success!');
    console.log('Profile:', JSON.stringify(response.data.profile, null, 2));
    return response.data.profile.data[0];
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    return null;
  }
}

async function testGetVerticals() {
  console.log('\n📋 Test 2: Get Business Verticals');
  console.log('='.repeat(60));
  
  try {
    const response = await api.get('/api/business-profile/verticals');
    console.log('✅ Success!');
    console.log(`Found ${response.data.verticals.length} categories:`);
    response.data.verticals.slice(0, 5).forEach(v => {
      console.log(`  - ${v.label} (${v.value})`);
    });
    console.log(`  ... and ${response.data.verticals.length - 5} more`);
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
  }
}

async function testUpdateProfile() {
  console.log('\n📋 Test 3: Update Business Profile');
  console.log('='.repeat(60));
  
  const updateData = {
    about: 'We are here to help! 24/7 support available.',
    description: 'Your trusted partner for all your business needs. We provide excellent service and support.',
    email: 'contact@mybusiness.com',
    address: '123 Business Street, Tech City, TC 12345',
    vertical: 'PROF_SERVICES',
    websites: ['https://mybusiness.com', 'https://support.mybusiness.com']
  };
  
  try {
    const response = await api.put('/api/business-profile', updateData);
    console.log('✅ Success!');
    console.log('Result:', response.data);
    
    // Verify the update
    console.log('\n🔍 Verifying update...');
    const profile = await testGetProfile();
    if (profile) {
      console.log('\n✅ Profile updated successfully!');
      console.log('  About:', profile.about);
      console.log('  Description:', profile.description);
      console.log('  Email:', profile.email);
      console.log('  Address:', profile.address);
      console.log('  Category:', profile.vertical);
      console.log('  Websites:', profile.websites);
    }
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
  }
}

async function runTests() {
  console.log('🧪 Testing Business Profile API');
  console.log('='.repeat(60));
  console.log('API URL:', API_URL);
  console.log('='.repeat(60));
  
  try {
    // Test 1: Get current profile
    await testGetProfile();
    
    // Test 2: Get available verticals
    await testGetVerticals();
    
    // Test 3: Update profile
    await testUpdateProfile();
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ All tests completed!');
    console.log('='.repeat(60));
    
    console.log('\n📝 Next steps:');
    console.log('1. Open http://localhost:5174/business-profile in your browser');
    console.log('2. Update your business information');
    console.log('3. Upload a profile picture');
    console.log('4. Save changes');
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

// Run the tests
runTests();
