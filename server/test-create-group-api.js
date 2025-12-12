const axios = require('axios');

async function testCreateGroup() {
  try {
    console.log('Testing create group API...');
    
    const response = await axios.post('http://localhost:3002/api/groups', {
      subject: 'Test Group',
      description: 'This is a test group',
      phoneNumberId: '803320889535856',
      joinApprovalMode: 'auto_approve'
    });
    
    console.log('Success:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
  }
}

testCreateGroup();
