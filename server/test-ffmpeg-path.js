/**
 * 测试 FFmpeg PATH 配置
 */

const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function testFFmpeg() {
  console.log('🔍 测试 FFmpeg PATH 配置\n');
  
  // 显示当前 PATH
  console.log('📋 当前 PATH:');
  console.log(process.env.PATH?.split(';').filter(p => p.includes('ffmpeg') || p.includes('scoop')).join('\n'));
  console.log('');
  
  // 测试 ffmpeg 命令
  console.log('🧪 测试 1: ffmpeg');
  try {
    const { stdout } = await execAsync('ffmpeg -version');
    console.log('✅ ffmpeg 可用');
    const version = stdout.match(/ffmpeg version ([^\s]+)/)?.[1];
    console.log(`   版本: ${version}\n`);
  } catch (error) {
    console.log('❌ ffmpeg 不可用');
    console.log(`   错误: ${error.message}\n`);
  }
  
  // 测试 ffmpeg.exe 命令
  console.log('🧪 测试 2: ffmpeg.exe');
  try {
    const { stdout } = await execAsync('ffmpeg.exe -version');
    console.log('✅ ffmpeg.exe 可用');
    const version = stdout.match(/ffmpeg version ([^\s]+)/)?.[1];
    console.log(`   版本: ${version}\n`);
  } catch (error) {
    console.log('❌ ffmpeg.exe 不可用');
    console.log(`   错误: ${error.message}\n`);
  }
  
  // 测试 Scoop 路径
  console.log('🧪 测试 3: Scoop FFmpeg 完整路径');
  const scoopPath = process.env.USERPROFILE + '\\scoop\\shims\\ffmpeg.exe';
  try {
    const { stdout } = await execAsync(`"${scoopPath}" -version`);
    console.log('✅ Scoop FFmpeg 可用');
    const version = stdout.match(/ffmpeg version ([^\s]+)/)?.[1];
    console.log(`   版本: ${version}`);
    console.log(`   路径: ${scoopPath}\n`);
  } catch (error) {
    console.log('❌ Scoop FFmpeg 不可用');
    console.log(`   路径: ${scoopPath}`);
    console.log(`   错误: ${error.message}\n`);
  }
  
  // 显示解决方案
  console.log('💡 解决方案:');
  console.log('1. 关闭所有 PowerShell/CMD 窗口');
  console.log('2. 打开新的 PowerShell');
  console.log('3. 运行: ffmpeg -version');
  console.log('4. 如果成功，重启服务器: npm run dev');
  console.log('5. 如果失败，运行: scoop install ffmpeg');
}

testFFmpeg().catch(console.error);
