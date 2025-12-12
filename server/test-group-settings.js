/**
 * Test script for Group Settings Management
 * 
 * Tests:
 * 1. Update group subject
 * 2. Update group description
 * 3. Update both subject and description
 * 4. Get/Reset invite link
 * 5. Handle validation errors
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

// Configuration
const config = {
  phoneNumberId: process.env.PHONE_NUMBER_ID || 'YOUR_PHONE_NUMBER_ID',
  groupId: process.env.TEST_GROUP_ID || 'YOUR_GROUP_ID', // Use existing group
};

console.log('🧪 Group Settings Management Test\n');
console.log('Configuration:', {
  phoneNumberId: config.phoneNumberId,
  groupId: config.groupId,
});
console.log('\n' + '='.repeat(60) + '\n');

/**
 * Test 1: Get Current Group Settings
 */
async function testGetGroupSettings() {
  console.log('📋 Test 1: Get Current Group Settings');
  console.log('-'.repeat(60));

  try {
    const response = await axios.get(`${BASE_URL}/groups/${config.groupId}`, {
      params: {
        phoneNumberId: config.phoneNumberId,
      },
    });

    console.log('✅ Success!');
    console.log('\nCurrent Settings:');
    console.log('- Subject:', response.data.group.subject);
    console.log('- Description:', response.data.group.description || '(none)');
    console.log('- Participants:', response.data.group.total_participant_count);
    console.log('- Suspended:', response.data.group.suspended);

    return response.data.group;
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Test 2: Update Group Subject
 */
async function testUpdateSubject() {
  console.log('\n📋 Test 2: Update Group Subject');
  console.log('-'.repeat(60));

  const newSubject = `Test Group ${Date.now()}`;

  try {
    const response = await axios.post(`${BASE_URL}/groups/${config.groupId}`, {
      phoneNumberId: config.phoneNumberId,
      subject: newSubject,
    });

    console.log('✅ Success!');
    console.log('New subject:', newSubject);
    console.log('Response:', JSON.stringify(response.data, null, 2));

    return response.data;
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Test 3: Update Group Description
 */
async function testUpdateDescription() {
  console.log('\n📋 Test 3: Update Group Description');
  console.log('-'.repeat(60));

  const newDescription = `Updated description at ${new Date().toISOString()}`;

  try {
    const response = await axios.post(`${BASE_URL}/groups/${config.groupId}`, {
      phoneNumberId: config.phoneNumberId,
      description: newDescription,
    });

    console.log('✅ Success!');
    console.log('New description:', newDescription);
    console.log('Response:', JSON.stringify(response.data, null, 2));

    return response.data;
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Test 4: Update Both Subject and Description
 */
async function testUpdateBoth() {
  console.log('\n📋 Test 4: Update Both Subject and Description');
  console.log('-'.repeat(60));

  const newSubject = `Complete Update ${Date.now()}`;
  const newDescription = `Both fields updated at ${new Date().toISOString()}`;

  try {
    const response = await axios.post(`${BASE_URL}/groups/${config.groupId}`, {
      phoneNumberId: config.phoneNumberId,
      subject: newSubject,
      description: newDescription,
    });

    console.log('✅ Success!');
    console.log('New subject:', newSubject);
    console.log('New description:', newDescription);
    console.log('Response:', JSON.stringify(response.data, null, 2));

    return response.data;
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Test 5: Get Invite Link
 */
async function testGetInviteLink() {
  console.log('\n📋 Test 5: Get Invite Link');
  console.log('-'.repeat(60));

  try {
    const response = await axios.get(`${BASE_URL}/groups/${config.groupId}/invite-link`, {
      params: {
        phoneNumberId: config.phoneNumberId,
      },
    });

    console.log('✅ Success!');
    console.log('Invite link:', response.data.invite_link);

    return response.data;
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Test 6: Reset Invite Link
 */
async function testResetInviteLink() {
  console.log('\n📋 Test 6: Reset Invite Link');
  console.log('-'.repeat(60));

  try {
    const response = await axios.post(`${BASE_URL}/groups/${config.groupId}/invite-link`, {
      phoneNumberId: config.phoneNumberId,
    });

    console.log('✅ Success!');
    console.log('New invite link:', response.data.invite_link);
    console.log('\n⚠️  Note: Old invite link is now invalid');

    return response.data;
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Test 7: Validation - Subject Too Long
 */
async function testSubjectTooLong() {
  console.log('\n📋 Test 7: Validation - Subject Too Long (>128 chars)');
  console.log('-'.repeat(60));

  const longSubject = 'A'.repeat(129); // 129 characters

  try {
    await axios.post(`${BASE_URL}/groups/${config.groupId}`, {
      phoneNumberId: config.phoneNumberId,
      subject: longSubject,
    });

    console.log('❌ Should have failed but succeeded');
  } catch (error) {
    console.log('✅ Correctly rejected long subject');
    console.log('Error:', error.response?.data?.error || error.message);
  }
}

/**
 * Test 8: Validation - Description Too Long
 */
async function testDescriptionTooLong() {
  console.log('\n📋 Test 8: Validation - Description Too Long (>2048 chars)');
  console.log('-'.repeat(60));

  const longDescription = 'A'.repeat(2049); // 2049 characters

  try {
    await axios.post(`${BASE_URL}/groups/${config.groupId}`, {
      phoneNumberId: config.phoneNumberId,
      description: longDescription,
    });

    console.log('❌ Should have failed but succeeded');
  } catch (error) {
    console.log('✅ Correctly rejected long description');
    console.log('Error:', error.response?.data?.error || error.message);
  }
}

/**
 * Test 9: Error Handling - Invalid Group ID
 */
async function testInvalidGroupId() {
  console.log('\n📋 Test 9: Error Handling - Invalid Group ID');
  console.log('-'.repeat(60));

  try {
    await axios.post(`${BASE_URL}/groups/invalid-group-id`, {
      phoneNumberId: config.phoneNumberId,
      subject: 'Test',
    });

    console.log('❌ Should have failed but succeeded');
  } catch (error) {
    console.log('✅ Correctly handled invalid group ID');
    console.log('Error:', error.response?.data?.error || error.message);
  }
}

/**
 * Test 10: Error Handling - No Updates Provided
 */
async function testNoUpdates() {
  console.log('\n📋 Test 10: Error Handling - No Updates Provided');
  console.log('-'.repeat(60));

  try {
    await axios.post(`${BASE_URL}/groups/${config.groupId}`, {
      phoneNumberId: config.phoneNumberId,
      // No subject or description
    });

    console.log('❌ Should have failed but succeeded');
  } catch (error) {
    console.log('✅ Correctly rejected empty update');
    console.log('Error:', error.response?.data?.error || error.message);
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('🚀 Starting Group Settings Tests...\n');

  try {
    // Test 1: Get current settings
    const currentSettings = await testGetGroupSettings();

    // Test 2-4: Update settings (optional - uncomment to test)
    console.log('\n⚠️  Skipping update tests (uncomment to run)');
    // await testUpdateSubject();
    // await testUpdateDescription();
    // await testUpdateBoth();

    // Test 5: Get invite link
    await testGetInviteLink();

    // Test 6: Reset invite link (optional - uncomment to test)
    console.log('\n⚠️  Skipping invite link reset test (uncomment to run)');
    // await testResetInviteLink();

    // Test 7-10: Validation and error handling
    await testSubjectTooLong();
    await testDescriptionTooLong();
    await testInvalidGroupId();
    await testNoUpdates();

    console.log('\n' + '='.repeat(60));
    console.log('✅ All tests completed!');
    console.log('='.repeat(60));

    console.log('\n📝 Summary:');
    console.log('- Current subject:', currentSettings.subject);
    console.log('- Current description:', currentSettings.description || '(none)');
    console.log('- Validation limits: Subject (128 chars), Description (2048 chars)');

  } catch (error) {
    console.log('\n' + '='.repeat(60));
    console.log('❌ Tests failed');
    console.log('='.repeat(60));
    process.exit(1);
  }
}

// Run tests
runTests();

/**
 * Usage:
 * 
 * 1. Set environment variables:
 *    export PHONE_NUMBER_ID=your_phone_number_id
 *    export TEST_GROUP_ID=your_group_id
 * 
 * 2. Run the test:
 *    node server/test-group-settings.js
 * 
 * Notes:
 * - Update tests are commented out by default to prevent accidental changes
 * - Uncomment the update tests when you're ready to test them
 * - Subject max length: 128 characters
 * - Description max length: 2048 characters
 * - Resetting invite link invalidates the old link
 */
