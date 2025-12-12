const axios = require('axios');

const API_URL = 'http://localhost:3002/api';
let adminToken = '';

async function testAdminSystem() {
  console.log('🧪 Testing Admin System\n');

  try {
    // 1. Login as Super Admin
    console.log('1️⃣ Logging in as Super Admin...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@whatsapp-platform.com',
      password: 'admin123456',
    });
    adminToken = loginRes.data.token;
    console.log('✅ Logged in successfully');
    console.log(`   User: ${loginRes.data.user.name} (${loginRes.data.user.role})\n`);

    const headers = { Authorization: `Bearer ${adminToken}` };

    // 2. Get Dashboard Stats
    console.log('2️⃣ Getting dashboard stats...');
    const statsRes = await axios.get(`${API_URL}/admin/dashboard/stats`, { headers });
    console.log('✅ Dashboard stats:', statsRes.data.stats);
    console.log('');

    // 3. Get All Accounts
    console.log('3️⃣ Getting all accounts...');
    const accountsRes = await axios.get(`${API_URL}/admin/accounts`, { headers });
    console.log(`✅ Found ${accountsRes.data.accounts.length} accounts`);
    const defaultAccount = accountsRes.data.accounts[0];
    console.log(`   - ${defaultAccount.name} (${defaultAccount.status})`);
    console.log('');

    // 4. Create New Account
    console.log('4️⃣ Creating new account...');
    const newAccountRes = await axios.post(
      `${API_URL}/admin/accounts`,
      {
        name: 'Test Business Account',
        type: 'business',
        whatsapp_business_account_id: '123456789',
        phone_number_id: '987654321',
        access_token: 'test_token_123',
      },
      { headers }
    );
    console.log('✅ Account created:', newAccountRes.data.account.name);
    const newAccountId = newAccountRes.data.account.id;
    console.log('');

    // 5. Get All Users
    console.log('5️⃣ Getting all users...');
    const usersRes = await axios.get(`${API_URL}/admin/users`, { headers });
    console.log(`✅ Found ${usersRes.data.users.length} users`);
    usersRes.data.users.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - ${user.role}`);
    });
    console.log('');

    // 6. Create New User
    console.log('6️⃣ Creating new user...');
    const newUserRes = await axios.post(
      `${API_URL}/admin/users`,
      {
        email: 'agent@test.com',
        password: 'password123',
        name: 'Test Agent',
        role: 'agent',
      },
      { headers }
    );
    console.log('✅ User created:', newUserRes.data.user.name);
    const newUserId = newUserRes.data.user.id;
    console.log('');

    // 7. Assign User to Account
    console.log('7️⃣ Assigning user to account...');
    const assignRes = await axios.post(
      `${API_URL}/admin/accounts/${newAccountId}/users`,
      {
        user_id: newUserId,
        role: 'agent',
        permissions: ['messages.view', 'messages.send'],
      },
      { headers }
    );
    console.log('✅ User assigned to account');
    console.log('');

    // 8. Get All Permissions
    console.log('8️⃣ Getting all permissions...');
    const permsRes = await axios.get(`${API_URL}/admin/permissions`, { headers });
    console.log(`✅ Found ${permsRes.data.permissions.length} permissions`);
    const categories = [...new Set(permsRes.data.permissions.map(p => p.category))];
    console.log(`   Categories: ${categories.join(', ')}`);
    console.log('');

    // 9. Get Role Permissions
    console.log('9️⃣ Getting agent role permissions...');
    const rolePermsRes = await axios.get(`${API_URL}/admin/roles/agent/permissions`, { headers });
    console.log(`✅ Agent has ${rolePermsRes.data.permissions.length} permissions:`);
    rolePermsRes.data.permissions.forEach(p => {
      console.log(`   - ${p.name}: ${p.description}`);
    });
    console.log('');

    // 10. Get Audit Logs
    console.log('🔟 Getting audit logs...');
    const logsRes = await axios.get(`${API_URL}/admin/audit-logs?limit=5`, { headers });
    console.log(`✅ Found ${logsRes.data.logs.length} recent logs:`);
    logsRes.data.logs.forEach(log => {
      console.log(`   - ${log.action} ${log.resource_type} by ${log.User?.name || 'Unknown'}`);
    });
    console.log('');

    // 11. Update User
    console.log('1️⃣1️⃣ Updating user role...');
    const updateUserRes = await axios.put(
      `${API_URL}/admin/users/${newUserId}`,
      {
        role: 'manager',
      },
      { headers }
    );
    console.log('✅ User role updated to:', updateUserRes.data.user.role);
    console.log('');

    // 12. Get Account Details
    console.log('1️⃣2️⃣ Getting account details...');
    const accountDetailRes = await axios.get(`${API_URL}/admin/accounts/${newAccountId}`, { headers });
    console.log('✅ Account details:');
    console.log(`   - Name: ${accountDetailRes.data.account.name}`);
    console.log(`   - Status: ${accountDetailRes.data.account.status}`);
    console.log(`   - Users: ${accountDetailRes.data.users.length}`);
    console.log('');

    console.log('✅ All tests passed!\n');
    console.log('📊 Summary:');
    console.log(`   - Accounts: ${accountsRes.data.accounts.length + 1}`);
    console.log(`   - Users: ${usersRes.data.users.length + 1}`);
    console.log(`   - Permissions: ${permsRes.data.permissions.length}`);
    console.log(`   - Audit Logs: ${logsRes.data.logs.length}`);

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Error details:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testAdminSystem();
