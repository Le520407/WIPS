require('dotenv').config();
const axios = require('axios');

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com';
const API_VERSION = process.env.WHATSAPP_API_VERSION || 'v18.0';
const BUSINESS_ACCOUNT_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

async function listTemplates() {
  try {
    const response = await axios.get(
      `${WHATSAPP_API_URL}/${API_VERSION}/${BUSINESS_ACCOUNT_ID}/message_templates`,
      {
        headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` }
      }
    );
    
    const templates = response.data.data || [];
    
    console.log(`\n📋 Found ${templates.length} templates:\n`);
    
    templates.forEach((template, index) => {
      console.log(`${index + 1}. Name: ${template.name}`);
      console.log(`   Status: ${template.status}`);
      console.log(`   Language: ${template.language}`);
      console.log(`   Category: ${template.category}`);
      console.log('');
    });
    
    // Show templates in review
    const inReview = templates.filter(t => t.status === 'PENDING' || t.status === 'IN_REVIEW');
    if (inReview.length > 0) {
      console.log(`\n⏳ Templates in review (${inReview.length}):`);
      inReview.forEach(t => console.log(`   - ${t.name}`));
    }
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

listTemplates();
