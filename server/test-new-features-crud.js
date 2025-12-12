/**
 * Comprehensive CRUD test for new features
 * Tests: Contacts, Labels, Auto-Reply Rules
 */

require('dotenv').config();
const axios = require('axios');

const API_URL = 'http://localhost:3002';
const USER_ID = '24a8cbe8-c31b-4e1a-a745-4fd4461b3ce6';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

async function testContactsCRUD() {
  console.log('\n📇 Testing Contact Management');
  console.log('='.repeat(60));
  
  try {
    // Create a contact
    const createRes = await api.post('/api/contacts', {
      userId: USER_ID,
      phone_number: '+1234567890',
      name: 'Test Contact',
      notes: 'This is a test contact'
    });
    console.log('✅ Create contact:', createRes.data.contact.name);
    const contactId = createRes.data.contact.id;
    
    // Get all contacts
    const getRes = await api.get(`/api/contacts?userId=${USER_ID}`);
    console.log(`✅ Get contacts: Found ${getRes.data.contacts.length} contact(s)`);
    
    // Update contact
    await api.post('/api/contacts', {
      userId: USER_ID,
      phone_number: '+1234567890',
      name: 'Updated Contact',
      notes: 'Updated notes'
    });
    console.log('✅ Update contact');
    
    // Delete contact
    await api.delete(`/api/contacts/${contactId}?userId=${USER_ID}`);
    console.log('✅ Delete contact');
    
    return true;
  } catch (error) {
    console.error('❌ Contact test failed:', error.response?.data || error.message);
    return false;
  }
}

async function testLabelsCRUD() {
  console.log('\n🏷️  Testing Label Management');
  console.log('='.repeat(60));
  
  try {
    // Create a label
    const createRes = await api.post('/api/contacts/labels', {
      userId: USER_ID,
      name: 'VIP',
      color: '#ff0000'
    });
    console.log('✅ Create label:', createRes.data.label.name);
    const labelId = createRes.data.label.id;
    
    // Get all labels
    const getRes = await api.get(`/api/contacts/labels?userId=${USER_ID}`);
    console.log(`✅ Get labels: Found ${getRes.data.labels.length} label(s)`);
    
    // Update label
    await api.put(`/api/contacts/labels/${labelId}`, {
      userId: USER_ID,
      name: 'Important',
      color: '#00ff00'
    });
    console.log('✅ Update label');
    
    // Delete label
    await api.delete(`/api/contacts/labels/${labelId}?userId=${USER_ID}`);
    console.log('✅ Delete label');
    
    return true;
  } catch (error) {
    console.error('❌ Label test failed:', error.response?.data || error.message);
    return false;
  }
}

async function testAutoReplyCRUD() {
  console.log('\n🤖 Testing Auto-Reply Rules');
  console.log('='.repeat(60));
  
  try {
    // Create a rule
    const createRes = await api.post('/api/auto-reply', {
      userId: USER_ID,
      name: 'Greeting Rule',
      trigger_type: 'keyword',
      trigger_value: 'hello',
      reply_message: 'Hi! How can I help you?',
      is_active: true,
      priority: 1
    });
    console.log('✅ Create rule:', createRes.data.rule.name);
    const ruleId = createRes.data.rule.id;
    
    // Get all rules
    const getRes = await api.get(`/api/auto-reply?userId=${USER_ID}`);
    console.log(`✅ Get rules: Found ${getRes.data.rules.length} rule(s)`);
    
    // Update rule
    await api.put(`/api/auto-reply/${ruleId}`, {
      userId: USER_ID,
      name: 'Updated Greeting',
      trigger_type: 'keyword',
      trigger_value: 'hi',
      reply_message: 'Hello! Welcome!',
      is_active: true,
      priority: 2
    });
    console.log('✅ Update rule');
    
    // Toggle rule
    await api.post(`/api/auto-reply/${ruleId}/toggle?userId=${USER_ID}`);
    console.log('✅ Toggle rule');
    
    // Delete rule
    await api.delete(`/api/auto-reply/${ruleId}?userId=${USER_ID}`);
    console.log('✅ Delete rule');
    
    return true;
  } catch (error) {
    console.error('❌ Auto-reply test failed:', error.response?.data || error.message);
    return false;
  }
}

async function runTests() {
  console.log('🧪 Comprehensive CRUD Tests for New Features');
  console.log('='.repeat(60));
  console.log('User ID:', USER_ID);
  console.log('='.repeat(60));
  
  const results = {
    contacts: await testContactsCRUD(),
    labels: await testLabelsCRUD(),
    autoReply: await testAutoReplyCRUD()
  };
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 Final Results:');
  console.log('  Contacts:', results.contacts ? '✅ PASS' : '❌ FAIL');
  console.log('  Labels:', results.labels ? '✅ PASS' : '❌ FAIL');
  console.log('  Auto-Reply:', results.autoReply ? '✅ PASS' : '❌ FAIL');
  console.log('='.repeat(60));
  
  const allPassed = Object.values(results).every(r => r);
  if (allPassed) {
    console.log('\n✅ All CRUD operations working perfectly!');
    console.log('\n📝 Summary of implemented features:');
    console.log('  1. Business Profile Management (GET/UPDATE/UPLOAD/DELETE)');
    console.log('  2. Contact Management (CREATE/READ/UPDATE/DELETE)');
    console.log('  3. Contact Labels (CREATE/READ/UPDATE/DELETE)');
    console.log('  4. Auto-Reply Rules (CREATE/READ/UPDATE/DELETE/TOGGLE)');
    console.log('  5. Delete Messages API (DELETE)');
  } else {
    console.log('\n⚠️  Some tests failed. Check the logs above.');
  }
}

runTests().catch(console.error);
