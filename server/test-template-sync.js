require('dotenv').config();
const axios = require('axios');

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com';
const API_VERSION = process.env.WHATSAPP_API_VERSION || 'v18.0';
const BUSINESS_ACCOUNT_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

console.log('🧪 Testing Template Sync...\n');

async function testTemplateSync() {
  try {
    console.log('📡 Fetching templates from WhatsApp API...');
    const response = await axios.get(
      `${WHATSAPP_API_URL}/${API_VERSION}/${BUSINESS_ACCOUNT_ID}/message_templates`,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`
        }
      }
    );

    const templates = response.data.data || [];
    console.log(`✅ Found ${templates.length} templates\n`);

    if (templates.length === 0) {
      console.log('⚠️ No templates found in your WhatsApp Business Account');
      console.log('💡 Create templates first in Meta Business Manager or through your platform');
      return;
    }

    console.log('📋 Template List:');
    console.log('─'.repeat(80));
    
    templates.forEach((template, index) => {
      console.log(`\n${index + 1}. ${template.name}`);
      console.log(`   Status: ${template.status}`);
      console.log(`   Language: ${template.language}`);
      console.log(`   Category: ${template.category}`);
      
      if (template.components) {
        const bodyComponent = template.components.find(c => c.type === 'BODY');
        if (bodyComponent) {
          const preview = bodyComponent.text.substring(0, 60);
          console.log(`   Body: ${preview}${bodyComponent.text.length > 60 ? '...' : ''}`);
        }
      }
    });

    console.log('\n' + '─'.repeat(80));
    
    // Count by status
    const approved = templates.filter(t => t.status === 'APPROVED').length;
    const pending = templates.filter(t => t.status === 'PENDING').length;
    const rejected = templates.filter(t => t.status === 'REJECTED').length;
    
    console.log('\n📊 Summary:');
    console.log(`   ✅ APPROVED: ${approved}`);
    console.log(`   🟡 PENDING: ${pending}`);
    console.log(`   ❌ REJECTED: ${rejected}`);
    console.log(`   📝 TOTAL: ${templates.length}`);

    if (approved > 0) {
      console.log('\n✨ You have approved templates! Click "Sync Status" in your platform to see them.');
    }

  } catch (error) {
    console.error('\n❌ Error fetching templates:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', JSON.stringify(error.response.data, null, 2));
      
      if (error.response.status === 190) {
        console.log('\n💡 Your Access Token is invalid or expired.');
        console.log('   1. Go to Meta Business Manager');
        console.log('   2. Generate a new Access Token');
        console.log('   3. Update your .env file');
      }
    } else {
      console.error(error.message);
    }
  }
}

testTemplateSync();
