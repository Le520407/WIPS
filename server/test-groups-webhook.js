/**
 * Groups Webhook 测试脚本
 * 
 * 测试 Groups API 的 webhook 事件处理
 * 
 * 使用方法:
 * node test-groups-webhook.js
 */

require('dotenv').config();
const axios = require('axios');

const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:3002/webhook';
const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || 'your_verify_token';

// 测试数据
const TEST_GROUP_ID = '120363123456789012@g.us';
const TEST_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const TEST_WA_ID = '1234567890';

console.log('🧪 Groups Webhook 测试脚本');
console.log('================================\n');
console.log('配置信息:');
console.log('- Webhook URL:', WEBHOOK_URL);
console.log('- Phone Number ID:', TEST_PHONE_NUMBER_ID);
console.log('- Test Group ID:', TEST_GROUP_ID);
console.log('\n================================\n');

/**
 * 发送 webhook 事件到服务器
 */
async function sendWebhook(webhookData) {
  try {
    console.log('📤 发送 webhook...');
    console.log('数据:', JSON.stringify(webhookData, null, 2));
    
    const response = await axios.post(WEBHOOK_URL, webhookData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Webhook 发送成功');
    console.log('状态码:', response.status);
    return true;
  } catch (error) {
    console.error('❌ Webhook 发送失败');
    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('响应:', error.response.data);
    } else {
      console.error('错误:', error.message);
    }
    return false;
  }
}

/**
 * 测试 1: 群组创建成功
 */
async function testGroupCreateSuccess() {
  console.log('\n📝 测试 1: 群组创建成功');
  console.log('----------------------------');
  
  const webhook = {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: 'WHATSAPP_ACCOUNT_ID',
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: '1234567890',
                phone_number_id: TEST_PHONE_NUMBER_ID
              },
              groups: [
                {
                  timestamp: Math.floor(Date.now() / 1000).toString(),
                  group_id: TEST_GROUP_ID,
                  type: 'group_create',
                  request_id: 'req_123',
                  subject: 'Test Group',
                  description: 'This is a test group',
                  invite_link: 'https://chat.whatsapp.com/ABC123',
                  join_approval_mode: 'auto_approve'
                }
              ]
            },
            field: 'group_lifecycle_update'
          }
        ]
      }
    ]
  };
  
  await sendWebhook(webhook);
}

/**
 * 测试 2: 群组创建失败
 */
async function testGroupCreateFail() {
  console.log('\n📝 测试 2: 群组创建失败');
  console.log('----------------------------');
  
  const webhook = {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: 'WHATSAPP_ACCOUNT_ID',
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: '1234567890',
                phone_number_id: TEST_PHONE_NUMBER_ID
              },
              groups: [
                {
                  timestamp: Math.floor(Date.now() / 1000).toString(),
                  type: 'group_create',
                  subject: 'Failed Group',
                  description: 'This group failed to create',
                  request_id: 'req_456',
                  group_id: TEST_GROUP_ID + '_fail',
                  errors: [
                    {
                      code: '100',
                      message: 'Invalid parameter',
                      title: 'Invalid Parameter',
                      error_data: {
                        details: 'Subject is too long'
                      }
                    }
                  ]
                }
              ]
            },
            field: 'group_lifecycle_update'
          }
        ]
      }
    ]
  };
  
  await sendWebhook(webhook);
}

/**
 * 测试 3: 参与者加入群组
 */
async function testParticipantAdded() {
  console.log('\n📝 测试 3: 参与者加入群组');
  console.log('----------------------------');
  
  const webhook = {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: 'WHATSAPP_ACCOUNT_ID',
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: '1234567890',
                phone_number_id: TEST_PHONE_NUMBER_ID
              },
              groups: [
                {
                  timestamp: Math.floor(Date.now() / 1000).toString(),
                  group_id: TEST_GROUP_ID,
                  type: 'group_participants_add',
                  reason: 'invite_link',
                  added_participants: [
                    {
                      wa_id: TEST_WA_ID
                    },
                    {
                      wa_id: '9876543210'
                    }
                  ]
                }
              ]
            },
            field: 'group_participants_update'
          }
        ]
      }
    ]
  };
  
  await sendWebhook(webhook);
}

/**
 * 测试 4: 参与者离开群组
 */
async function testParticipantRemoved() {
  console.log('\n📝 测试 4: 参与者离开群组');
  console.log('----------------------------');
  
  const webhook = {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: 'WHATSAPP_ACCOUNT_ID',
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: '1234567890',
                phone_number_id: TEST_PHONE_NUMBER_ID
              },
              groups: [
                {
                  timestamp: Math.floor(Date.now() / 1000).toString(),
                  group_id: TEST_GROUP_ID,
                  type: 'group_participants_remove',
                  removed_participants: [
                    {
                      wa_id: TEST_WA_ID
                    }
                  ],
                  initiated_by: 'participant'
                }
              ]
            },
            field: 'group_participants_update'
          }
        ]
      }
    ]
  };
  
  await sendWebhook(webhook);
}

/**
 * 测试 5: 群组设置更新成功
 */
async function testGroupSettingsUpdate() {
  console.log('\n📝 测试 5: 群组设置更新成功');
  console.log('----------------------------');
  
  const webhook = {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: 'WHATSAPP_ACCOUNT_ID',
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: '1234567890',
                phone_number_id: TEST_PHONE_NUMBER_ID
              },
              groups: [
                {
                  timestamp: Math.floor(Date.now() / 1000).toString(),
                  group_id: TEST_GROUP_ID,
                  type: 'group_settings_update',
                  request_id: 'req_789',
                  group_subject: {
                    text: 'Updated Test Group',
                    update_successful: true
                  },
                  group_description: {
                    text: 'Updated description',
                    update_successful: true
                  }
                }
              ]
            },
            field: 'group_settings_update'
          }
        ]
      }
    ]
  };
  
  await sendWebhook(webhook);
}

/**
 * 测试 6: 群组状态更新 - 暂停
 */
async function testGroupSuspended() {
  console.log('\n📝 测试 6: 群组暂停');
  console.log('----------------------------');
  
  const webhook = {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: 'WHATSAPP_ACCOUNT_ID',
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: '1234567890',
                phone_number_id: TEST_PHONE_NUMBER_ID
              },
              groups: [
                {
                  timestamp: Math.floor(Date.now() / 1000).toString(),
                  type: 'group_suspend',
                  group_id: TEST_GROUP_ID
                }
              ]
            },
            field: 'group_status_update'
          }
        ]
      }
    ]
  };
  
  await sendWebhook(webhook);
}

/**
 * 测试 7: 群组状态更新 - 恢复
 */
async function testGroupSuspendCleared() {
  console.log('\n📝 测试 7: 群组恢复');
  console.log('----------------------------');
  
  const webhook = {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: 'WHATSAPP_ACCOUNT_ID',
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: '1234567890',
                phone_number_id: TEST_PHONE_NUMBER_ID
              },
              groups: [
                {
                  timestamp: Math.floor(Date.now() / 1000).toString(),
                  type: 'group_suspend_cleared',
                  group_id: TEST_GROUP_ID
                }
              ]
            },
            field: 'group_status_update'
          }
        ]
      }
    ]
  };
  
  await sendWebhook(webhook);
}

/**
 * 测试 8: 群组删除成功
 */
async function testGroupDeleteSuccess() {
  console.log('\n📝 测试 8: 群组删除成功');
  console.log('----------------------------');
  
  const webhook = {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: 'WHATSAPP_ACCOUNT_ID',
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: '1234567890',
                phone_number_id: TEST_PHONE_NUMBER_ID
              },
              groups: [
                {
                  timestamp: Math.floor(Date.now() / 1000).toString(),
                  group_id: TEST_GROUP_ID,
                  type: 'group_delete',
                  request_id: 'req_999'
                }
              ]
            },
            field: 'group_lifecycle_update'
          }
        ]
      }
    ]
  };
  
  await sendWebhook(webhook);
}

/**
 * 运行所有测试
 */
async function runAllTests() {
  console.log('🚀 开始运行所有测试...\n');
  
  // 等待函数
  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  
  try {
    // 测试 1: 群组创建成功
    await testGroupCreateSuccess();
    await wait(1000);
    
    // 测试 2: 群组创建失败
    await testGroupCreateFail();
    await wait(1000);
    
    // 测试 3: 参与者加入
    await testParticipantAdded();
    await wait(1000);
    
    // 测试 4: 参与者离开
    await testParticipantRemoved();
    await wait(1000);
    
    // 测试 5: 群组设置更新
    await testGroupSettingsUpdate();
    await wait(1000);
    
    // 测试 6: 群组暂停
    await testGroupSuspended();
    await wait(1000);
    
    // 测试 7: 群组恢复
    await testGroupSuspendCleared();
    await wait(1000);
    
    // 测试 8: 群组删除
    await testGroupDeleteSuccess();
    
    console.log('\n================================');
    console.log('✅ 所有测试完成！');
    console.log('================================\n');
    
  } catch (error) {
    console.error('\n❌ 测试过程中出错:', error.message);
  }
}

// 运行测试
runAllTests();
