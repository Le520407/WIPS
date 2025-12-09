require('dotenv').config();
const axios = require('axios');

const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

async function checkCallSettings() {
  try {
    console.log('📞 Checking Call Settings...\n');
    console.log('Phone Number ID:', PHONE_NUMBER_ID);
    
    const response = await axios.get(
      `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/settings`,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`
        }
      }
    );

    console.log('\n✅ Call Settings Retrieved Successfully!\n');
    
    if (response.data.calling) {
      const calling = response.data.calling;
      
      console.log('📊 Current Call Settings:');
      console.log('========================');
      console.log('Status:', calling.status);
      console.log('Call Icon Visibility:', calling.call_icon_visibility);
      console.log('Callback Permission:', calling.callback_permission_status);
      
      if (calling.call_hours) {
        console.log('\n⏰ Business Hours:');
        console.log('Status:', calling.call_hours.status);
        console.log('Timezone:', calling.call_hours.timezone_id);
        
        if (calling.call_hours.weekly_operating_hours) {
          console.log('\n📅 Weekly Schedule:');
          calling.call_hours.weekly_operating_hours.forEach(schedule => {
            console.log(`  ${schedule.day_of_week}: ${schedule.open_time} - ${schedule.close_time}`);
          });
        }
        
        if (calling.call_hours.holiday_schedule && calling.call_hours.holiday_schedule.length > 0) {
          console.log('\n🎉 Holiday Schedule:');
          calling.call_hours.holiday_schedule.forEach(holiday => {
            console.log(`  ${holiday.date}: ${holiday.start_time} - ${holiday.end_time}`);
          });
        }
      }
      
      if (calling.restrictions) {
        console.log('\n⚠️  RESTRICTIONS DETECTED:');
        calling.restrictions.restrictions_list.forEach(restriction => {
          console.log('Type:', restriction.type);
          console.log('Reason:', restriction.reason);
          console.log('Expiration:', new Date(restriction.expiration * 1000).toISOString());
        });
      }
      
      console.log('\n💡 Important Notes:');
      console.log('==================');
      console.log('1. Settings are active on the SERVER SIDE immediately');
      console.log('2. WhatsApp clients may take up to 7 DAYS to reflect changes');
      console.log('3. To force immediate refresh in WhatsApp:');
      console.log('   - Open chat with your business number');
      console.log('   - Open the chat info page (tap on business name)');
      console.log('   - The call button should appear there');
      
    } else {
      console.log('❌ No calling settings found');
      console.log('You may need to enable Calling API first');
    }
    
  } catch (error) {
    console.error('❌ Error checking call settings:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
  }
}

checkCallSettings();
