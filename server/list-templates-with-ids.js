/**
 * List All Templates with Their IDs
 * 
 * This script lists all templates and shows their correct IDs
 * for use in template groups
 */

require('dotenv').config({ path: './.env' });
const axios = require('axios');

const WHATSAPP_API_URL = 'https://graph.facebook.com';
const API_VERSION = process.env.WHATSAPP_API_VERSION || 'v21.0';
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WABA_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;

async function listTemplates() {
  console.log('\n📋 Listing All Templates with IDs\n');
  console.log('═══════════════════════════════════════════════════════\n');
  
  if (!ACCESS_TOKEN) {
    console.error('❌ Error: WHATSAPP_ACCESS_TOKEN not found');
    return;
  }
  
  if (!WABA_ID) {
    console.error('❌ Error: WHATSAPP_BUSINESS_ACCOUNT_ID not found');
    return;
  }
  
  try {
    const response = await axios.get(
      `${WHATSAPP_API_URL}/${API_VERSION}/${WABA_ID}/message_templates`,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`
        },
        params: {
          fields: 'id,name,status,category,language',
          limit: 100
        }
      }
    );
    
    const templates = response.data.data || [];
    
    if (templates.length === 0) {
      console.log('⚠️  No templates found\n');
      return;
    }
    
    console.log(`Found ${templates.length} template(s):\n`);
    
    // Group by status
    const approved = templates.filter(t => t.status === 'APPROVED');
    const pending = templates.filter(t => t.status === 'PENDING');
    const rejected = templates.filter(t => t.status === 'REJECTED');
    
    if (approved.length > 0) {
      console.log('✅ APPROVED Templates (can be used in groups):');
      console.log('─────────────────────────────────────────────────────');
      approved.forEach((template, index) => {
        console.log(`\n${index + 1}. ${template.name}`);
        console.log(`   ID: ${template.id}`);
        console.log(`   Category: ${template.category}`);
        console.log(`   Language: ${template.language}`);
        console.log(`   Status: ${template.status}`);
      });
      console.log('\n');
    }
    
    if (pending.length > 0) {
      console.log('⏳ PENDING Templates (cannot be used yet):');
      console.log('─────────────────────────────────────────────────────');
      pending.forEach((template, index) => {
        console.log(`\n${index + 1}. ${template.name}`);
        console.log(`   ID: ${template.id}`);
        console.log(`   Status: ${template.status}`);
      });
      console.log('\n');
    }
    
    if (rejected.length > 0) {
      console.log('❌ REJECTED Templates (cannot be used):');
      console.log('─────────────────────────────────────────────────────');
      rejected.forEach((template, index) => {
        console.log(`\n${index + 1}. ${template.name}`);
        console.log(`   ID: ${template.id}`);
        console.log(`   Status: ${template.status}`);
      });
      console.log('\n');
    }
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n💡 To create a template group, use the IDs from APPROVED templates');
    console.log('   Example: [' + approved.slice(0, 2).map(t => `"${t.id}"`).join(', ') + ']\n');
    
    // Show example for creating a group
    if (approved.length > 0) {
      console.log('📝 Example API call:');
      console.log('─────────────────────────────────────────────────────');
      console.log(JSON.stringify({
        name: "My Template Group",
        description: "Group description",
        whatsapp_business_templates: approved.slice(0, 2).map(t => ({ id: t.id }))
      }, null, 2));
      console.log('\n');
    }
    
  } catch (error) {
    console.error('\n❌ Error fetching templates:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Message:', error.message);
    }
  }
}

listTemplates();
