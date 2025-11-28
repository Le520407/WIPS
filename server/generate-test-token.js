// 生成测试 token
const jwt = require('jsonwebtoken');
require('dotenv').config();

const userId = '24a8cbe8-c31b-4e1a-a745-4fd4461b3ce6'; // test@whatsapp-platform.com
const JWT_SECRET = process.env.JWT_SECRET || 'astsi_jwt_secret_key_2024_production_ready';

const token = jwt.sign(
  { userId },
  JWT_SECRET,
  { expiresIn: '7d' }
);

console.log('\n🔑 Test Token for test@whatsapp-platform.com:');
console.log(token);
console.log('\n📋 Use this token in your browser console:');
console.log(`localStorage.setItem('token', '${token}');`);
console.log('\nThen refresh the page.');
