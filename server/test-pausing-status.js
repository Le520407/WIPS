require('dotenv').config();
const axios = require('axios');

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v18.0';
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

async function testPausingStatus() {
  console.log('🧪 Testing Template Pausing Status\n');
  console.log('='.repeat(60));

  try {
    // 1. Get all templates
    console.log('\n📋 Step 1: Fetching all templates...');
    const templatesResponse = await axios.get(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/message_templates`,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`
        },
        params: {
          fields: 'name,status,quality_score,language,category,components'
        }
      }
    );

    const templates = templatesResponse.data.data;
    console.log(`✅ Found ${templates.length} templates\n`);

    // 2. Check for paused templates
    console.log('🔍 Step 2: Checking for paused templates...\n');
    
    let pausedCount = 0;
    let flaggedCount = 0;

    templates.forEach((template, index) => {
      const isPaused = template.status === 'PAUSED';
      const isFlagged = template.status === 'FLAGGED';
      const qualityScore = template.quality_score?.score || 'UNKNOWN';

      if (isPaused || isFlagged) {
        console.log(`${index + 1}. ${template.name}`);
        console.log(`   Status: ${template.status}`);
        console.log(`   Quality: ${qualityScore}`);
        console.log(`   Language: ${template.language}`);
        console.log(`   Category: ${template.category}`);
        
        if (isPaused) pausedCount++;
        if (isFlagged) flaggedCount++;
        
        console.log('');
      }
    });

    // 3. Summary
    console.log('='.repeat(60));
    console.log('\n📊 Summary:');
    console.log(`   Total Templates: ${templates.length}`);
    console.log(`   Paused: ${pausedCount}`);
    console.log(`   Flagged: ${flaggedCount}`);
    console.log(`   Active: ${templates.length - pausedCount - flaggedCount}`);

    // 4. Quality Score Distribution
    console.log('\n📈 Quality Score Distribution:');
    const qualityDist = {
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
      UNKNOWN: 0
    };

    templates.forEach(t => {
      const score = t.quality_score?.score || 'UNKNOWN';
      qualityDist[score] = (qualityDist[score] || 0) + 1;
    });

    console.log(`   🟢 HIGH: ${qualityDist.HIGH}`);
    console.log(`   🟡 MEDIUM: ${qualityDist.MEDIUM}`);
    console.log(`   🔴 LOW: ${qualityDist.LOW}`);
    console.log(`   ⚪ UNKNOWN: ${qualityDist.UNKNOWN}`);

    // 5. Recommendations
    if (pausedCount > 0 || flaggedCount > 0) {
      console.log('\n⚠️  Action Required:');
      console.log('   • Review paused/flagged templates');
      console.log('   • Check for policy violations');
      console.log('   • Improve template content');
      console.log('   • Consider creating new templates');
    } else {
      console.log('\n✅ All templates are active!');
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Test completed successfully!\n');

  } catch (error) {
    console.error('\n❌ Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Tip: Check your ACCESS_TOKEN in .env file');
    }
  }
}

// Run the test
testPausingStatus();
