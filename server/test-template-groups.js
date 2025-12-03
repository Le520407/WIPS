/**
 * Template Groups Test Script
 * 
 * Tests the Template Groups functionality
 */

require('dotenv').config({ path: '.env' });
const axios = require('axios');

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com';
const API_VERSION = process.env.WHATSAPP_API_VERSION || 'v18.0';
const WABA_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

console.log('🔧 Configuration:');
console.log('WABA_ID:', WABA_ID);
console.log('API_VERSION:', API_VERSION);
console.log('ACCESS_TOKEN:', ACCESS_TOKEN ? `${ACCESS_TOKEN.substring(0, 20)}...` : 'NOT SET');
console.log('');

// Test 1: List existing template groups
async function listTemplateGroups() {
  try {
    console.log('📋 Test 1: List Template Groups');
    console.log('================================');
    
    const response = await axios.get(
      `${WHATSAPP_API_URL}/${API_VERSION}/${WABA_ID}/template_groups`,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`
        }
      }
    );
    
    console.log('✅ Success!');
    console.log('Groups found:', response.data.data?.length || 0);
    
    if (response.data.data && response.data.data.length > 0) {
      response.data.data.forEach((group, index) => {
        console.log(`\nGroup ${index + 1}:`);
        console.log('  ID:', group.id);
        console.log('  Name:', group.name);
        console.log('  Description:', group.description || 'N/A');
      });
    }
    
    console.log('');
    return response.data.data || [];
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    console.log('');
    return [];
  }
}

// Test 2: Get all templates (to get template IDs)
async function listTemplates() {
  try {
    console.log('📋 Test 2: List Templates (to get IDs)');
    console.log('======================================');
    
    const response = await axios.get(
      `${WHATSAPP_API_URL}/${API_VERSION}/${WABA_ID}/message_templates`,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`
        }
      }
    );
    
    console.log('✅ Success!');
    console.log('Templates found:', response.data.data?.length || 0);
    
    if (response.data.data && response.data.data.length > 0) {
      console.log('\nFirst 5 templates:');
      response.data.data.slice(0, 5).forEach((template, index) => {
        console.log(`\nTemplate ${index + 1}:`);
        console.log('  ID:', template.id);
        console.log('  Name:', template.name);
        console.log('  Status:', template.status);
        console.log('  Category:', template.category);
      });
    }
    
    console.log('');
    return response.data.data || [];
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    console.log('');
    return [];
  }
}

// Test 3: Create a template group
async function createTemplateGroup(name, description, templateIds) {
  try {
    console.log('📦 Test 3: Create Template Group');
    console.log('=================================');
    console.log('Name:', name);
    console.log('Description:', description);
    console.log('Template IDs:', templateIds);
    console.log('');
    
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${API_VERSION}/${WABA_ID}/template_groups`,
      {
        name,
        description,
        whatsapp_business_templates: templateIds
      },
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Success!');
    console.log('Group ID:', response.data.id);
    console.log('');
    return response.data.id;
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    console.log('');
    return null;
  }
}

// Test 4: Get a template group
async function getTemplateGroup(groupId) {
  try {
    console.log('📦 Test 4: Get Template Group');
    console.log('=============================');
    console.log('Group ID:', groupId);
    console.log('');
    
    const response = await axios.get(
      `${WHATSAPP_API_URL}/${API_VERSION}/${groupId}`,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`
        }
      }
    );
    
    console.log('✅ Success!');
    console.log('Name:', response.data.name);
    console.log('Description:', response.data.description);
    console.log('Created:', response.data.creation_time);
    console.log('Templates:', response.data.whatsapp_business_templates?.data?.length || 0);
    console.log('');
    return response.data;
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    console.log('');
    return null;
  }
}

// Test 5: Update a template group
async function updateTemplateGroup(groupId, updates) {
  try {
    console.log('📦 Test 5: Update Template Group');
    console.log('================================');
    console.log('Group ID:', groupId);
    console.log('Updates:', updates);
    console.log('');
    
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${API_VERSION}/${groupId}`,
      updates,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Success!');
    console.log('Result:', response.data);
    console.log('');
    return response.data;
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    console.log('');
    return null;
  }
}

// Test 6: Delete a template group
async function deleteTemplateGroup(groupId) {
  try {
    console.log('📦 Test 6: Delete Template Group');
    console.log('================================');
    console.log('Group ID:', groupId);
    console.log('');
    
    const response = await axios.delete(
      `${WHATSAPP_API_URL}/${API_VERSION}/${groupId}`,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`
        }
      }
    );
    
    console.log('✅ Success!');
    console.log('Result:', response.data);
    console.log('');
    return response.data;
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    console.log('');
    return null;
  }
}

// Main test flow
async function runTests() {
  console.log('🚀 Starting Template Groups Tests');
  console.log('==================================\n');
  
  // Test 1: List existing groups
  const existingGroups = await listTemplateGroups();
  
  // Test 2: Get templates
  const templates = await listTemplates();
  
  if (templates.length === 0) {
    console.log('⚠️ No templates found. Please create some templates first.');
    return;
  }
  
  // Get first 2-3 template IDs for testing
  const templateIds = templates.slice(0, Math.min(3, templates.length)).map(t => parseInt(t.id));
  
  // Test 3: Create a test group
  const groupId = await createTemplateGroup(
    'Test Group ' + Date.now(),
    'Test group created by test script',
    templateIds
  );
  
  if (!groupId) {
    console.log('⚠️ Failed to create group. Stopping tests.');
    return;
  }
  
  // Test 4: Get the group
  await getTemplateGroup(groupId);
  
  // Test 5: Update the group
  await updateTemplateGroup(groupId, {
    name: 'Updated Test Group ' + Date.now(),
    description: 'Updated description'
  });
  
  // Test 6: Delete the group
  await deleteTemplateGroup(groupId);
  
  console.log('✅ All tests completed!');
}

// Run the tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
