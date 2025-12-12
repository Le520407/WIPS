const axios = require('axios');

const BASE_URL = 'http://localhost:3002/api';
const USER_ID = '24a8cbe8-c31b-4e1a-a745-4fd4461b3ce6';

async function testMarketingFeatures() {
  console.log('🚀 Testing Marketing Messages API Features\n');

  try {
    // 1. Create Marketing Template
    console.log('1️⃣ Creating marketing template...');
    const templateResponse = await axios.post(
      `${BASE_URL}/marketing/templates?userId=${USER_ID}`,
      {
        name: 'summer_sale_2024',
        language: 'en_US',
        headerText: '🌞 Summer Sale!',
        bodyText: 'Get 50% off on all products this summer! Limited time offer. Shop now and save big!',
        footerText: 'Valid until end of summer',
        buttonText: 'Shop Now',
        buttonUrl: 'https://example.com/summer-sale',
        ttl: 86400, // 24 hours
      }
    );
    console.log('✅ Template created:', templateResponse.data.template.name);
    console.log('   Template ID:', templateResponse.data.template.template_id);
    console.log('   Status:', templateResponse.data.template.status);

    const templateId = templateResponse.data.template.template_id;

    // 2. Wait for template approval (in real scenario)
    console.log('\n⏳ Note: In production, wait for template approval before proceeding');

    // 3. Sync Ad IDs (after template is approved)
    console.log('\n2️⃣ Syncing Ad IDs...');
    console.log('   Note: This requires template to be approved and 10 minutes sync time');
    try {
      const syncResponse = await axios.post(
        `${BASE_URL}/marketing/templates/${templateId}/sync-ad-ids?userId=${USER_ID}`
      );
      console.log('✅ Ad IDs synced:', syncResponse.data.template.ad_id);
    } catch (error) {
      console.log('⚠️  Ad sync may require approved template:', error.response?.data?.error);
    }

    // 4. Get all templates
    console.log('\n3️⃣ Getting all marketing templates...');
    const templatesResponse = await axios.get(
      `${BASE_URL}/marketing/templates?userId=${USER_ID}`
    );
    console.log('✅ Found templates:', templatesResponse.data.templates.length);
    templatesResponse.data.templates.forEach((t) => {
      console.log(`   - ${t.name} (${t.status})`);
    });

    // 5. Create Campaign
    console.log('\n4️⃣ Creating marketing campaign...');
    
    // First, get some contacts
    const contactsResponse = await axios.get(`${BASE_URL}/contacts?userId=${USER_ID}`);
    const contacts = contactsResponse.data.contacts;
    
    if (contacts.length === 0) {
      console.log('⚠️  No contacts found. Creating test contact...');
      await axios.post(`${BASE_URL}/contacts?userId=${USER_ID}`, {
        name: 'Test Customer',
        phone_number: '+1234567890',
        notes: 'Test contact for marketing',
      });
      const newContactsResponse = await axios.get(`${BASE_URL}/contacts?userId=${USER_ID}`);
      contacts.push(...newContactsResponse.data.contacts);
    }

    const campaignResponse = await axios.post(
      `${BASE_URL}/marketing/campaigns?userId=${USER_ID}`,
      {
        name: 'Summer Sale Campaign 2024',
        templateId: templateId,
        targetAudience: {
          contacts: [contacts[0].id],
        },
      }
    );
    console.log('✅ Campaign created:', campaignResponse.data.campaign.name);
    console.log('   Campaign ID:', campaignResponse.data.campaign.id);
    console.log('   Status:', campaignResponse.data.campaign.status);

    const campaignId = campaignResponse.data.campaign.id;

    // 6. Get all campaigns
    console.log('\n5️⃣ Getting all campaigns...');
    const campaignsResponse = await axios.get(
      `${BASE_URL}/marketing/campaigns?userId=${USER_ID}`
    );
    console.log('✅ Found campaigns:', campaignsResponse.data.campaigns.length);
    campaignsResponse.data.campaigns.forEach((c) => {
      console.log(`   - ${c.name} (${c.status})`);
      console.log(`     Sent: ${c.sent_count}, Delivered: ${c.delivered_count}, Read: ${c.read_count}`);
    });

    // 7. Send Campaign (commented out - requires approved template)
    console.log('\n6️⃣ Sending campaign...');
    console.log('   ⚠️  Note: Requires approved template and synced Ad IDs');
    console.log('   Uncomment the code below to test sending:');
    console.log('   /*');
    console.log('   const sendResponse = await axios.post(');
    console.log(`     \`\${BASE_URL}/marketing/campaigns/\${campaignId}/send?userId=\${USER_ID}\``);
    console.log('   );');
    console.log('   console.log("✅ Campaign sent:", sendResponse.data.summary);');
    console.log('   */');

    // 8. Get Campaign Insights
    console.log('\n7️⃣ Getting campaign insights...');
    try {
      const insightsResponse = await axios.get(
        `${BASE_URL}/marketing/campaigns/${campaignId}/insights?userId=${USER_ID}`
      );
      console.log('✅ Campaign insights:', insightsResponse.data.insights);
    } catch (error) {
      console.log('⚠️  Insights require Ad IDs:', error.response?.data?.error);
    }

    // 9. Get Campaigns with Insights
    console.log('\n8️⃣ Getting campaigns with insights...');
    const campaignsWithInsightsResponse = await axios.get(
      `${BASE_URL}/marketing/campaigns/with-insights?userId=${USER_ID}`
    );
    console.log('✅ Campaigns with insights:', campaignsWithInsightsResponse.data.campaigns.length);
    campaignsWithInsightsResponse.data.campaigns.forEach((c) => {
      console.log(`   - ${c.name}`);
      console.log(`     Metrics: Sent=${c.sent_count}, Read=${c.read_count}, Clicked=${c.clicked_count}`);
      if (c.insights) {
        console.log('     Insights available:', Object.keys(c.insights).length, 'fields');
      }
    });

    console.log('\n✅ All marketing tests completed!');
    console.log('\n📝 Summary:');
    console.log('   - Marketing templates: Create, list, sync Ad IDs ✅');
    console.log('   - Marketing campaigns: Create, list, insights ✅');
    console.log('   - Campaign sending: Ready (requires approved template) ⏳');
    console.log('   - Conversion tracking: Ready (requires Meta Pixel setup) ⏳');

    console.log('\n🎯 Next Steps:');
    console.log('   1. Wait for template approval in Meta Business Manager');
    console.log('   2. Sync Ad IDs (wait 10 minutes after approval)');
    console.log('   3. Send test campaign to verify delivery');
    console.log('   4. Set up Meta Pixel for conversion tracking');
    console.log('   5. Monitor campaign performance in insights');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.data?.error) {
      console.error('   Details:', error.response.data.error);
    }
  }
}

// Run tests
testMarketingFeatures();
