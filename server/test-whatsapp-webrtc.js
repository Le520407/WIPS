/**
 * WhatsApp + WebRTC 集成测试
 * 测试接听 WhatsApp 来电的完整流程
 */

require('dotenv').config();
const axios = require('axios');

const GRAPH_API_URL = 'https://graph.facebook.com/v21.0';
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

// 模拟 SDP answer（实际应该由 WebRTC 生成）
const MOCK_SDP = `v=0
o=- 4611731400430051336 2 IN IP4 127.0.0.1
s=-
t=0 0
a=group:BUNDLE 0
a=extmap-allow-mixed
a=msid-semantic: WMS
m=audio 9 UDP/TLS/RTP/SAVPF 111 63 103 104 9 0 8 106 105 13 110 112 113 126
c=IN IP4 0.0.0.0
a=rtcp:9 IN IP4 0.0.0.0
a=ice-ufrag:test
a=ice-pwd:testpassword1234567890
a=ice-options:trickle
a=fingerprint:sha-256 00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00
a=setup:active
a=mid:0
a=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level
a=extmap:2 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time
a=extmap:3 http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01
a=extmap:4 urn:ietf:params:rtp-hdrext:sdes:mid
a=sendrecv
a=msid:- {audio-track-id}
a=rtcp-mux
a=rtpmap:111 opus/48000/2
a=rtcp-fb:111 transport-cc
a=fmtp:111 minptime=10;useinbandfec=1
a=rtpmap:63 red/48000/2
a=fmtp:63 111/111
a=rtpmap:103 ISAC/16000
a=rtpmap:104 ISAC/32000
a=rtpmap:9 G722/8000
a=rtpmap:0 PCMU/8000
a=rtpmap:8 PCMA/8000
a=rtpmap:106 CN/32000
a=rtpmap:105 CN/16000
a=rtpmap:13 CN/8000
a=rtpmap:110 telephone-event/48000
a=rtpmap:112 telephone-event/32000
a=rtpmap:113 telephone-event/16000
a=rtpmap:126 telephone-event/8000`;

async function testAcceptCall(callId) {
  console.log('\n📞 测试接听 WhatsApp 来电...');
  console.log('Call ID:', callId);
  
  try {
    // 测试 1: 不带 SDP 的接听（简单模式）
    console.log('\n--- 测试 1: 简单接听（无 WebRTC）---');
    try {
      const response1 = await axios.post(
        `${GRAPH_API_URL}/${PHONE_NUMBER_ID}/calls`,
        {
          messaging_product: 'whatsapp',
          call_id: callId,
          action: 'accept',
        },
        {
          headers: {
            'Authorization': `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      console.log('✅ 简单接听成功:', response1.data);
    } catch (error) {
      console.log('❌ 简单接听失败:', error.response?.data || error.message);
    }
    
    // 测试 2: 带 SDP 的接听（WebRTC 模式）
    console.log('\n--- 测试 2: WebRTC 接听（带 SDP）---');
    try {
      const response2 = await axios.post(
        `${GRAPH_API_URL}/${PHONE_NUMBER_ID}/calls`,
        {
          messaging_product: 'whatsapp',
          call_id: callId,
          action: 'accept',
          session: {
            sdp_type: 'answer',
            sdp: MOCK_SDP,
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      console.log('✅ WebRTC 接听成功:', response2.data);
      
      // 检查是否返回了 SDP
      if (response2.data.session) {
        console.log('\n📡 收到 WhatsApp 的 SDP:');
        console.log('  Type:', response2.data.session.sdp_type);
        console.log('  SDP length:', response2.data.session.sdp?.length || 0);
      }
    } catch (error) {
      console.log('❌ WebRTC 接听失败:', error.response?.data || error.message);
      
      // 详细错误信息
      if (error.response?.data?.error) {
        const err = error.response.data.error;
        console.log('\n错误详情:');
        console.log('  Code:', err.code);
        console.log('  Message:', err.message);
        console.log('  Type:', err.type);
        console.log('  Error subcode:', err.error_subcode);
        console.log('  FBTrace ID:', err.fbtrace_id);
      }
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

async function testCallInfo(callId) {
  console.log('\n📋 获取通话信息...');
  
  try {
    const response = await axios.get(
      `${GRAPH_API_URL}/${callId}`,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
        },
      }
    );
    
    console.log('✅ 通话信息:', response.data);
  } catch (error) {
    console.log('❌ 获取失败:', error.response?.data || error.message);
  }
}

// 主函数
async function main() {
  console.log('🧪 WhatsApp + WebRTC 集成测试');
  console.log('================================\n');
  
  // 从命令行获取 call_id
  const callId = process.argv[2];
  
  if (!callId) {
    console.log('❌ 请提供 call_id');
    console.log('\n用法:');
    console.log('  node test-whatsapp-webrtc.js <call_id>');
    console.log('\n示例:');
    console.log('  node test-whatsapp-webrtc.js wacid.HBgNMjkxNTU1NjA3MzUVAgASGBg...');
    console.log('\n提示:');
    console.log('  1. 从手机发起通话');
    console.log('  2. 查看 webhook 日志获取 call_id');
    console.log('  3. 运行此脚本测试接听');
    process.exit(1);
  }
  
  // 测试接听
  await testAcceptCall(callId);
  
  // 测试获取通话信息
  await testCallInfo(callId);
  
  console.log('\n✅ 测试完成');
}

main();
