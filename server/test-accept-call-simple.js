/**
 * 简单的接听测试脚本
 * 用于快速测试 WhatsApp 接听 API
 */

require('dotenv').config();
const axios = require('axios');

const GRAPH_API_URL = 'https://graph.facebook.com/v21.0';
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

async function acceptCall(callId, withSDP = false) {
  console.log(`\n📞 接听通话: ${callId}`);
  console.log(`模式: ${withSDP ? 'WebRTC (带 SDP)' : '简单模式 (无 SDP)'}`);
  
  const payload = {
    messaging_product: 'whatsapp',
    call_id: callId,
    action: 'accept',
  };
  
  // 如果需要 WebRTC，添加 SDP
  if (withSDP) {
    payload.session = {
      sdp_type: 'answer',
      sdp: 'v=0\r\no=- 123 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE 0\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\nc=IN IP4 0.0.0.0\r\na=rtcp:9 IN IP4 0.0.0.0\r\na=ice-ufrag:test\r\na=ice-pwd:testpass123456\r\na=fingerprint:sha-256 00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00\r\na=setup:active\r\na=mid:0\r\na=sendrecv\r\na=rtcp-mux\r\na=rtpmap:111 opus/48000/2\r\na=fmtp:111 minptime=10;useinbandfec=1',
    };
  }
  
  try {
    const response = await axios.post(
      `${GRAPH_API_URL}/${PHONE_NUMBER_ID}/calls`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    console.log('✅ 接听成功!');
    console.log('响应:', JSON.stringify(response.data, null, 2));
    
    if (response.data.session) {
      console.log('\n📡 收到 WhatsApp 的 SDP:');
      console.log('  Type:', response.data.session.sdp_type);
      console.log('  SDP:', response.data.session.sdp?.substring(0, 100) + '...');
    }
    
    return true;
  } catch (error) {
    console.log('❌ 接听失败!');
    
    if (error.response?.data) {
      const err = error.response.data.error;
      console.log('\n错误信息:');
      console.log('  Code:', err.code);
      console.log('  Message:', err.message);
      console.log('  Type:', err.type);
      
      // 常见错误解释
      if (err.code === 131009) {
        console.log('\n💡 提示: 需要提供 session 参数（SDP）');
        console.log('   使用: node test-accept-call-simple.js <call_id> --webrtc');
      } else if (err.code === 131047) {
        console.log('\n💡 提示: 需要先获取用户的通话权限');
      } else if (err.code === 131053) {
        console.log('\n💡 提示: 已达到通话限制');
      }
    } else {
      console.log('错误:', error.message);
    }
    
    return false;
  }
}

async function main() {
  console.log('🧪 WhatsApp 接听测试');
  console.log('===================\n');
  
  const callId = process.argv[2];
  const useWebRTC = process.argv.includes('--webrtc');
  
  if (!callId) {
    console.log('❌ 请提供 call_id\n');
    console.log('用法:');
    console.log('  node test-accept-call-simple.js <call_id>           # 简单接听');
    console.log('  node test-accept-call-simple.js <call_id> --webrtc  # WebRTC 接听\n');
    console.log('示例:');
    console.log('  node test-accept-call-simple.js wacid.HBgNMjkxNTU1NjA3MzUVAgASGBg...\n');
    console.log('步骤:');
    console.log('  1. 从手机拨打 WhatsApp 通话');
    console.log('  2. 查看服务器日志获取 call_id');
    console.log('  3. 在 30 秒内运行此脚本');
    process.exit(1);
  }
  
  const success = await acceptCall(callId, useWebRTC);
  
  if (success) {
    console.log('\n✅ 测试成功!');
    console.log('现在可以在手机上继续通话');
  } else {
    console.log('\n❌ 测试失败');
    console.log('请检查错误信息并重试');
  }
}

main();
