require('dotenv').config();
const axios = require('axios');

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v18.0';
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

// Tier limits mapping
const TIER_LIMITS = {
  'TIER_1': 1000,
  'TIER_2': 10000,
  'TIER_3': 100000,
  'TIER_4': Infinity
};

// Quality rating descriptions
const QUALITY_DESCRIPTIONS = {
  'GREEN': '🟢 High Quality - Excellent performance',
  'YELLOW': '🟡 Medium Quality - Monitor closely',
  'RED': '🔴 Low Quality - Immediate action required',
  'UNKNOWN': '⚪ Unknown - Pending evaluation'
};

async function checkTierStatus() {
  console.log('🔍 Checking WhatsApp Tier Status\n');
  console.log('='.repeat(60));

  try {
    // Get phone number info including tier and quality
    console.log('\n📞 Fetching account information...');
    const response = await axios.get(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}`,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`
        },
        params: {
          fields: 'quality_rating,messaging_limit_tier,display_phone_number,verified_name'
        }
      }
    );

    const data = response.data;
    
    console.log('\n✅ Account Information:');
    console.log(`   Phone Number: ${data.display_phone_number || 'N/A'}`);
    console.log(`   Business Name: ${data.verified_name || 'N/A'}`);
    console.log(`   Account ID: ${data.id}`);

    // Tier Information
    const tier = data.messaging_limit_tier || 'TIER_1';
    const dailyLimit = TIER_LIMITS[tier];
    
    console.log('\n📊 Messaging Tier Information:');
    console.log(`   Current Tier: ${tier}`);
    console.log(`   Daily Limit: ${dailyLimit === Infinity ? 'Unlimited' : dailyLimit.toLocaleString()} conversations`);
    
    // Quality Rating
    const quality = data.quality_rating || 'UNKNOWN';
    const qualityDesc = QUALITY_DESCRIPTIONS[quality];
    
    console.log('\n⭐ Quality Rating:');
    console.log(`   Status: ${quality}`);
    console.log(`   ${qualityDesc}`);

    // Tier Upgrade Path
    console.log('\n🚀 Tier Upgrade Path:');
    if (tier === 'TIER_1') {
      console.log('   Current: Tier 1 (1,000/day)');
      console.log('   Next: Tier 2 (10,000/day)');
      console.log('   Requirements: Maintain high quality, low block rate');
    } else if (tier === 'TIER_2') {
      console.log('   Current: Tier 2 (10,000/day)');
      console.log('   Next: Tier 3 (100,000/day)');
      console.log('   Requirements: Excellent quality, very low block rate');
    } else if (tier === 'TIER_3') {
      console.log('   Current: Tier 3 (100,000/day)');
      console.log('   Next: Tier 4 (Unlimited)');
      console.log('   Requirements: Outstanding quality, minimal blocks');
    } else if (tier === 'TIER_4') {
      console.log('   🎉 You are at the highest tier!');
      console.log('   Unlimited marketing conversations per day');
    }

    // Recommendations
    console.log('\n💡 Recommendations:');
    if (quality === 'GREEN') {
      console.log('   ✅ Great job! Keep maintaining high quality');
      console.log('   ✅ Continue following best practices');
      console.log('   ✅ Monitor engagement rates');
    } else if (quality === 'YELLOW') {
      console.log('   ⚠️  Quality needs improvement');
      console.log('   • Review template content');
      console.log('   • Reduce sending frequency');
      console.log('   • Improve targeting');
    } else if (quality === 'RED') {
      console.log('   🔴 URGENT: Quality is low');
      console.log('   • Stop sending marketing messages temporarily');
      console.log('   • Review all templates for policy compliance');
      console.log('   • Check for high block/report rates');
      console.log('   • Contact WhatsApp support if needed');
    } else {
      console.log('   ℹ️  Quality rating pending');
      console.log('   • Continue sending messages');
      console.log('   • Rating will be available soon');
    }

    // Usage Guidelines
    console.log('\n📋 Usage Guidelines:');
    if (dailyLimit !== Infinity) {
      const safeZone = Math.floor(dailyLimit * 0.7);
      const warningZone = Math.floor(dailyLimit * 0.9);
      
      console.log(`   🟢 Safe Zone: 0 - ${safeZone.toLocaleString()} conversations`);
      console.log(`   🟡 Warning Zone: ${safeZone.toLocaleString()} - ${warningZone.toLocaleString()} conversations`);
      console.log(`   🔴 Critical Zone: ${warningZone.toLocaleString()} - ${dailyLimit.toLocaleString()} conversations`);
    } else {
      console.log('   🎉 No daily limits - Unlimited tier!');
    }

    // Important Notes
    console.log('\n📝 Important Notes:');
    console.log('   • Limits apply to MARKETING messages only');
    console.log('   • Utility and Authentication messages are unlimited');
    console.log('   • Limits reset daily at midnight UTC');
    console.log('   • Track your usage to avoid hitting limits');

    console.log('\n' + '='.repeat(60));
    console.log('✅ Tier check completed successfully!\n');

  } catch (error) {
    console.error('\n❌ Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Tip: Check your ACCESS_TOKEN in .env file');
    } else if (error.response?.status === 404) {
      console.log('\n💡 Tip: Check your PHONE_NUMBER_ID in .env file');
    }
    
    console.log('\n📚 Documentation:');
    console.log('   https://developers.facebook.com/docs/whatsapp/messaging-limits');
  }
}

// Run the check
checkTierStatus();
