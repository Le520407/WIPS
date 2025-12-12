/**
 * Test Commerce/E-commerce Features
 * Tests: Commerce Settings, Product Messages, Catalog Management
 */

require('dotenv').config();
const axios = require('axios');

const API_URL = 'http://localhost:3002';
const USER_ID = '24a8cbe8-c31b-4e1a-a745-4fd4461b3ce6';
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID || '803320889535856';
const CATALOG_ID = process.env.CATALOG_ID || 'YOUR_CATALOG_ID';
const TEST_PHONE = process.env.TEST_PHONE_NUMBER || '+1234567890';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

async function testCommerceSettings() {
  console.log('\n⚙️  Testing Commerce Settings');
  console.log('='.repeat(60));
  
  try {
    // Get current settings
    const getRes = await api.get(`/api/commerce/settings?userId=${USER_ID}&phoneNumberId=${PHONE_NUMBER_ID}`);
    console.log('✅ GET commerce settings:', getRes.data.settings);
    
    // Update settings
    const updateRes = await api.put('/api/commerce/settings', {
      userId: USER_ID,
      phoneNumberId: PHONE_NUMBER_ID,
      is_cart_enabled: true,
      is_catalog_visible: true
    });
    console.log('✅ UPDATE commerce settings:', updateRes.data.success);
    
    return true;
  } catch (error) {
    console.error('❌ Commerce settings test failed:', error.response?.data || error.message);
    return false;
  }
}

async function testCatalogMessage() {
  console.log('\n📦 Testing Catalog Message');
  console.log('='.repeat(60));
  
  try {
    const res = await api.post('/api/commerce/messages/catalog', {
      phoneNumberId: PHONE_NUMBER_ID,
      to: TEST_PHONE,
      bodyText: 'Check out our full catalog! Browse and add items to your cart.',
      footerText: 'Shop with us today!'
    });
    console.log('✅ Catalog message sent:', res.data.result.messages[0].id);
    return true;
  } catch (error) {
    console.error('❌ Catalog message test failed:', error.response?.data || error.message);
    return false;
  }
}

async function testSingleProductMessage() {
  console.log('\n🛍️  Testing Single Product Message');
  console.log('='.repeat(60));
  
  if (CATALOG_ID === 'YOUR_CATALOG_ID') {
    console.log('⚠️  Skipped: Please set CATALOG_ID in .env file');
    return null;
  }
  
  try {
    const res = await api.post('/api/commerce/messages/single-product', {
      phoneNumberId: PHONE_NUMBER_ID,
      to: TEST_PHONE,
      catalogId: CATALOG_ID,
      productRetailerId: 'PRODUCT_SKU_001',
      bodyText: 'Check out this amazing product!',
      footerText: 'Limited stock available'
    });
    console.log('✅ Single product message sent:', res.data.result.messages[0].id);
    return true;
  } catch (error) {
    console.error('❌ Single product test failed:', error.response?.data || error.message);
    return false;
  }
}

async function testMultiProductMessage() {
  console.log('\n🛒 Testing Multi-Product Message');
  console.log('='.repeat(60));
  
  if (CATALOG_ID === 'YOUR_CATALOG_ID') {
    console.log('⚠️  Skipped: Please set CATALOG_ID in .env file');
    return null;
  }
  
  try {
    const res = await api.post('/api/commerce/messages/multi-product', {
      phoneNumberId: PHONE_NUMBER_ID,
      to: TEST_PHONE,
      catalogId: CATALOG_ID,
      headerText: 'Our Best Sellers',
      bodyText: 'Browse our top products and add them to your cart!',
      sections: [
        {
          title: 'Featured Items',
          product_items: [
            { product_retailer_id: 'PRODUCT_SKU_001' },
            { product_retailer_id: 'PRODUCT_SKU_002' }
          ]
        },
        {
          title: 'New Arrivals',
          product_items: [
            { product_retailer_id: 'PRODUCT_SKU_003' }
          ]
        }
      ],
      footerText: 'Free shipping on orders over $50'
    });
    console.log('✅ Multi-product message sent:', res.data.result.messages[0].id);
    return true;
  } catch (error) {
    console.error('❌ Multi-product test failed:', error.response?.data || error.message);
    return false;
  }
}

async function testCatalogInfo() {
  console.log('\n📊 Testing Catalog Info');
  console.log('='.repeat(60));
  
  if (CATALOG_ID === 'YOUR_CATALOG_ID') {
    console.log('⚠️  Skipped: Please set CATALOG_ID in .env file');
    return null;
  }
  
  try {
    const res = await api.get(`/api/commerce/catalogs/${CATALOG_ID}`);
    console.log('✅ Catalog info:', res.data.catalog);
    return true;
  } catch (error) {
    console.error('❌ Catalog info test failed:', error.response?.data || error.message);
    return false;
  }
}

async function testGetProducts() {
  console.log('\n📦 Testing Get Products');
  console.log('='.repeat(60));
  
  if (CATALOG_ID === 'YOUR_CATALOG_ID') {
    console.log('⚠️  Skipped: Please set CATALOG_ID in .env file');
    return null;
  }
  
  try {
    const res = await api.get(`/api/commerce/catalogs/${CATALOG_ID}/products?limit=10`);
    console.log(`✅ Found ${res.data.products.length} products`);
    if (res.data.products.length > 0) {
      console.log('   First product:', res.data.products[0].name);
    }
    return true;
  } catch (error) {
    console.error('❌ Get products test failed:', error.response?.data || error.message);
    return false;
  }
}

async function testOrderManagement() {
  console.log('\n📋 Testing Order Management');
  console.log('='.repeat(60));
  
  try {
    // Get orders
    const getRes = await api.get(`/api/orders?userId=${USER_ID}`);
    console.log(`✅ GET orders: Found ${getRes.data.orders.length} order(s)`);
    
    // Get order stats
    const statsRes = await api.get(`/api/orders/stats?userId=${USER_ID}`);
    console.log('✅ Order stats:', statsRes.data.stats);
    
    return true;
  } catch (error) {
    console.error('❌ Order management test failed:', error.response?.data || error.message);
    return false;
  }
}

async function runTests() {
  console.log('🧪 Testing E-commerce Features');
  console.log('='.repeat(60));
  console.log('User ID:', USER_ID);
  console.log('Phone Number ID:', PHONE_NUMBER_ID);
  console.log('Catalog ID:', CATALOG_ID);
  console.log('='.repeat(60));
  
  const results = {
    commerceSettings: await testCommerceSettings(),
    catalogMessage: await testCatalogMessage(),
    singleProduct: await testSingleProductMessage(),
    multiProduct: await testMultiProductMessage(),
    catalogInfo: await testCatalogInfo(),
    getProducts: await testGetProducts(),
    orderManagement: await testOrderManagement()
  };
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 Final Results:');
  Object.entries(results).forEach(([test, result]) => {
    const status = result === null ? '⏭️  SKIP' : result ? '✅ PASS' : '❌ FAIL';
    console.log(`  ${test}: ${status}`);
  });
  console.log('='.repeat(60));
  
  const tested = Object.values(results).filter(r => r !== null);
  const passed = tested.filter(r => r === true).length;
  const failed = tested.filter(r => r === false).length;
  
  console.log(`\n📈 Summary: ${passed} passed, ${failed} failed, ${Object.values(results).filter(r => r === null).length} skipped`);
  
  if (CATALOG_ID === 'YOUR_CATALOG_ID') {
    console.log('\n💡 Tip: Set CATALOG_ID in your .env file to test product features');
    console.log('   You can create a catalog in Meta Commerce Manager');
  }
}

runTests().catch(console.error);
