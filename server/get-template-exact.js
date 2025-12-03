require('dotenv').config();
const axios = require('axios');

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com';
const API_VERSION = process.env.WHATSAPP_API_VERSION || 'v18.0';
const BUSINESS_ACCOUNT_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

async function getAllTemplates() {
  try {
    console.log('\n📋 Fetching all templates...\n');
    
    const response = await axios.get(
      `${WHATSAPP_API_URL}/${API_VERSION}/${BUSINESS_ACCOUNT_ID}/message_templates`,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`
        }
      }
    );

    const templates = response.data.data;
    
    // Find templates with "testing" in the name
    const testingTemplates = templates.filter(t => t.name.includes('testing') || t.name === 'testing');
    
    console.log(`Found ${testingTemplates.length} template(s) matching "testing":\n`);
    
    testingTemplates.forEach((template, index) => {
      console.log(`\n${index + 1}. Template: ${template.name}`);
      console.log(`   Status: ${template.status}`);
      console.log(`   Language: ${template.language}`);
      console.log(`   Category: ${template.category}`);
      
      const bodyComponent = template.components.find(c => c.type === 'BODY');
      if (bodyComponent) {
        console.log(`   Body: "${bodyComponent.text}"`);
        const params = (bodyComponent.text.match(/\{\{\d+\}\}/g) || []).length;
        console.log(`   Parameters: ${params}`);
      }
      console.log('   ---');
    });
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

getAllTemplates();
