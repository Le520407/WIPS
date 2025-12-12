const axios = require('axios');
require('dotenv').config();

const API_URL = 'http://localhost:3002/api';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '803320889535856';

let authToken = '';

async function login() {
  console.log('🔐 Logging in...');
  try {
    const response = await axios.post(`${API_URL}/auth/test-login`, {
      email: 'test@whatsapp-platform.com',
    });
    authToken = response.data.token;
    console.log('✅ Logged in successfully');
    return response.data;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    throw error;
  }
}

async function getConfiguration() {
  console.log('\n📖 Getting current configuration...');
  try {
    const response = await axios.get(
      `${API_URL}/conversational-components/${PHONE_NUMBER_ID}`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    console.log('✅ Configuration retrieved:');
    console.log(JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('❌ Failed to get configuration:', error.response?.data || error.message);
    throw error;
  }
}

async function updateConfiguration() {
  console.log('\n💾 Updating configuration...');
  
  const config = {
    enableWelcomeMessage: true,
    prompts: [
      'Book a flight',
      'Plan a vacation',
      'Check hotel availability',
      'Get travel tips',
    ],
    commands: [
      {
        command_name: 'book',
        command_description: 'Book flights, hotels, or rental cars',
      },
      {
        command_name: 'help',
        command_description: 'Get help with your booking',
      },
      {
        command_name: 'status',
        command_description: 'Check your booking status',
      },
    ],
    welcomeMessageTemplate: 'Welcome to our travel service! How can we help you today?',
  };

  try {
    const response = await axios.post(
      `${API_URL}/conversational-components/${PHONE_NUMBER_ID}`,
      config,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    console.log('✅ Configuration updated successfully');
    console.log(JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('❌ Failed to update configuration:', error.response?.data || error.message);
    throw error;
  }
}

async function toggleWelcomeMessage(enable) {
  console.log(`\n🔄 ${enable ? 'Enabling' : 'Disabling'} welcome message...`);
  try {
    const response = await axios.post(
      `${API_URL}/conversational-components/${PHONE_NUMBER_ID}/welcome`,
      { enable },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    console.log(`✅ Welcome message ${enable ? 'enabled' : 'disabled'}`);
    console.log(JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('❌ Failed to toggle welcome message:', error.response?.data || error.message);
    throw error;
  }
}

async function setIceBreakers() {
  console.log('\n🧊 Setting ice breakers...');
  
  const prompts = [
    'Get started',
    'View services',
    'Contact support',
  ];

  try {
    const response = await axios.post(
      `${API_URL}/conversational-components/${PHONE_NUMBER_ID}/ice-breakers`,
      { prompts },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    console.log('✅ Ice breakers set successfully');
    console.log(JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('❌ Failed to set ice breakers:', error.response?.data || error.message);
    throw error;
  }
}

async function setCommands() {
  console.log('\n⚡ Setting commands...');
  
  const commands = [
    {
      command_name: 'start',
      command_description: 'Start a new conversation',
    },
    {
      command_name: 'help',
      command_description: 'Get help and support',
    },
  ];

  try {
    const response = await axios.post(
      `${API_URL}/conversational-components/${PHONE_NUMBER_ID}/commands`,
      { commands },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    console.log('✅ Commands set successfully');
    console.log(JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('❌ Failed to set commands:', error.response?.data || error.message);
    throw error;
  }
}

async function syncFromMeta() {
  console.log('\n🔄 Syncing from Meta...');
  try {
    const response = await axios.post(
      `${API_URL}/conversational-components/${PHONE_NUMBER_ID}/sync`,
      {},
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    console.log('✅ Synced from Meta successfully');
    console.log(JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('❌ Failed to sync from Meta:', error.response?.data || error.message);
    // This might fail if not configured on Meta yet, which is okay
    console.log('ℹ️ This is expected if you haven\'t configured on Meta yet');
  }
}

async function runTests() {
  console.log('🚀 Starting Conversational Components Tests\n');
  console.log('=' .repeat(60));

  try {
    // 1. Login
    await login();

    // 2. Get current configuration
    await getConfiguration();

    // 3. Update full configuration
    await updateConfiguration();

    // 4. Get configuration again to verify
    await getConfiguration();

    // 5. Toggle welcome message
    await toggleWelcomeMessage(false);
    await toggleWelcomeMessage(true);

    // 6. Set ice breakers
    await setIceBreakers();

    // 7. Set commands
    await setCommands();

    // 8. Sync from Meta (might fail if not configured)
    await syncFromMeta();

    // 9. Final configuration check
    await getConfiguration();

    console.log('\n' + '='.repeat(60));
    console.log('✅ All tests completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Open the frontend at http://localhost:5173/conversational-components');
    console.log('2. Configure your ice breakers and commands');
    console.log('3. Test on WhatsApp by:');
    console.log('   - Deleting existing chat with your business number');
    console.log('   - Starting a new chat to see ice breakers');
    console.log('   - Typing "/" to see commands');
  } catch (error) {
    console.error('\n❌ Tests failed:', error.message);
    process.exit(1);
  }
}

runTests();
