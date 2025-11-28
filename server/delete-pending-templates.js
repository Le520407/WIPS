require('dotenv').config();
const axios = require('axios');

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com';
const API_VERSION = process.env.WHATSAPP_API_VERSION || 'v18.0';
const BUSINESS_ACCOUNT_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

async function deleteTemplate(templateName) {
  try {
    const response = await axios.delete(
      `${WHATSAPP_API_URL}/${API_VERSION}/${BUSINESS_ACCOUNT_ID}/message_templates`,
      {
        params: { name: templateName },
        headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` }
      }
    );
    console.log(`✅ Deleted: ${templateName}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to delete ${templateName}:`, error.response?.data?.error?.message || error.message);
    return false;
  }
}

async function main() {
  console.log('🗑️  Deleting pending templates...\n');
  
  // List of templates to delete (PENDING templates)
  const templatesToDelete = [
    'test_template_1764204806394',
    'test_template_1764204078371'
  ];

  console.log(`Found ${templatesToDelete.length} templates to delete:\n`);
  templatesToDelete.forEach(name => console.log(`  - ${name}`));
  console.log('\nStarting deletion...\n');

  let successCount = 0;
  let failCount = 0;

  for (const templateName of templatesToDelete) {
    const success = await deleteTemplate(templateName);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    // Wait a bit between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n📊 Summary:');
  console.log(`✅ Successfully deleted: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📝 Total: ${templatesToDelete.length}`);
}

main().catch(console.error);
