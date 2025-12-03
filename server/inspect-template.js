require('dotenv').config();
const axios = require('axios');

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com';
const API_VERSION = process.env.WHATSAPP_API_VERSION || 'v18.0';
const BUSINESS_ACCOUNT_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

async function inspectTemplate(templateName) {
  try {
    console.log(`\n🔍 Inspecting template: ${templateName}\n`);
    
    const response = await axios.get(
      `${WHATSAPP_API_URL}/${API_VERSION}/${BUSINESS_ACCOUNT_ID}/message_templates`,
      {
        params: {
          name: templateName
        },
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`
        }
      }
    );

    const templates = response.data.data;
    
    if (templates.length === 0) {
      console.log('❌ Template not found');
      return;
    }

    const template = templates[0];
    
    console.log('📋 Template Details:');
    console.log('---');
    console.log('Name:', template.name);
    console.log('Status:', template.status);
    console.log('Language:', template.language);
    console.log('Category:', template.category);
    console.log('\n📝 Components:');
    console.log(JSON.stringify(template.components, null, 2));
    
    // Analyze parameters
    console.log('\n🔢 Parameter Analysis:');
    template.components.forEach((component, index) => {
      if (component.type === 'BODY') {
        const text = component.text;
        const params = text.match(/\{\{\d+\}\}/g) || [];
        console.log(`  Body text: "${text}"`);
        console.log(`  Parameters found: ${params.length}`);
        if (params.length > 0) {
          console.log(`  Parameters: ${params.join(', ')}`);
        }
      }
    });
    
    // Show how to send this template
    console.log('\n📤 How to send this template:');
    const bodyComponent = template.components.find(c => c.type === 'BODY');
    if (bodyComponent) {
      const params = (bodyComponent.text.match(/\{\{\d+\}\}/g) || []).length;
      if (params > 0) {
        console.log(`\nThis template requires ${params} parameter(s).`);
        console.log('\nExample request body:');
        const exampleComponents = [{
          type: 'body',
          parameters: Array(params).fill(0).map((_, i) => ({
            type: 'text',
            text: `Example value ${i + 1}`
          }))
        }];
        console.log(JSON.stringify({
          messaging_product: 'whatsapp',
          to: '60105520735',
          type: 'template',
          template: {
            name: template.name,
            language: { code: template.language },
            components: exampleComponents
          }
        }, null, 2));
      } else {
        console.log('\nThis template has no parameters.');
        console.log('\nExample request body:');
        console.log(JSON.stringify({
          messaging_product: 'whatsapp',
          to: '60105520735',
          type: 'template',
          template: {
            name: template.name,
            language: { code: template.language },
            components: []
          }
        }, null, 2));
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Get template name from command line or use default
const templateName = process.argv[2] || 'testing';
inspectTemplate(templateName);
