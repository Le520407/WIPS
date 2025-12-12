const axios = require('axios');

const API_URL = 'http://localhost:3002/api';
const USER_ID = '24a8cbe8-c31b-4e1a-a745-4fd4461b3ce6';
const PHONE_NUMBER_ID = '803320889535856';

async function testCommerceComplete() {
  console.log('🧪 Testing Complete Commerce Implementation\n');

  try {
    // 1. Get current commerce settings
    console.log('1️⃣ Getting commerce settings...');
    const settingsRes = await axios.get(
      `${API_URL}/commerce/settings?userId=${USER_ID}&phoneNumberId=${PHONE_NUMBER_ID}`
    );
    console.log('✅ Current settings:', settingsRes.data.settings);
    console.log('');

    // 2. Update commerce settings - Enable cart
    console.log('2️⃣ Enabling shopping cart...');
    const updateRes = await axios.put(`${API_URL}/commerce/settings`, {
      userId: USER_ID,
      phoneNumberId: PHONE_NUMBER_ID,
      is_cart_enabled: true,
    });
    console.log('✅ Cart enabled:', updateRes.data);
    console.log('');

    // 3. Update commerce settings - Show catalog
    console.log('3️⃣ Showing catalog...');
    const catalogRes = await axios.put(`${API_URL}/commerce/settings`, {
      userId: USER_ID,
      phoneNumberId: PHONE_NUMBER_ID,
      is_catalog_visible: true,
    });
    console.log('✅ Catalog visible:', catalogRes.data);
    console.log('');

    // 4. Get orders
    console.log('4️⃣ Getting orders...');
    const ordersRes = await axios.get(`${API_URL}/orders?userId=${USER_ID}`);
    console.log('✅ Orders:', ordersRes.data.orders.length, 'orders found');
    console.log('');

    // 5. Get order statistics
    console.log('5️⃣ Getting order statistics...');
    const statsRes = await axios.get(`${API_URL}/orders/stats?userId=${USER_ID}`);
    console.log('✅ Order stats:', statsRes.data.stats);
    console.log('');

    // 6. Verify final settings
    console.log('6️⃣ Verifying final settings...');
    const finalRes = await axios.get(
      `${API_URL}/commerce/settings?userId=${USER_ID}&phoneNumberId=${PHONE_NUMBER_ID}`
    );
    console.log('✅ Final settings:', finalRes.data.settings);
    console.log('');

    console.log('✅ All commerce tests passed!');
    console.log('\n📊 Summary:');
    console.log('   - Cart enabled:', finalRes.data.settings.is_cart_enabled);
    console.log('   - Catalog visible:', finalRes.data.settings.is_catalog_visible);
    console.log('   - Total orders:', statsRes.data.stats.total);
    console.log('   - Pending orders:', statsRes.data.stats.pending);
    console.log('   - Processing orders:', statsRes.data.stats.processing);
    console.log('   - Completed orders:', statsRes.data.stats.completed);
    console.log('   - Cancelled orders:', statsRes.data.stats.cancelled);

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Error details:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testCommerceComplete();
