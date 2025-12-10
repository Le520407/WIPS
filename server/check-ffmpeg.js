/**
 * FFmpeg 检测脚本
 * 检查 FFmpeg 是否正确安装并可用
 */

const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function checkFFmpeg() {
  console.log('🔍 检查 FFmpeg 安装状态...\n');

  try {
    // 检查 FFmpeg 是否可用
    const { stdout, stderr } = await execAsync('ffmpeg -version');
    
    console.log('✅ FFmpeg 已安装！\n');
    
    // 提取版本信息
    const versionMatch = stdout.match(/ffmpeg version ([^\s]+)/);
    if (versionMatch) {
      console.log(`📦 版本: ${versionMatch[1]}`);
    }
    
    // 检查是否支持 libopus
    if (stdout.includes('libopus')) {
      console.log('✅ 支持 Opus 编码器（用于 OGG 转换）');
    } else {
      console.log('⚠️  警告: 不支持 Opus 编码器');
    }
    
    console.log('\n📋 完整版本信息:');
    console.log('─'.repeat(60));
    console.log(stdout.split('\n').slice(0, 5).join('\n'));
    console.log('─'.repeat(60));
    
    console.log('\n✅ 语音录音功能已就绪！');
    console.log('\n📝 下一步:');
    console.log('1. 重启服务器 (如果还在运行)');
    console.log('2. 打开 Messages 页面');
    console.log('3. 点击 Voice 按钮测试录音');
    console.log('4. 检查服务器日志应显示 "Audio converted successfully"');
    
  } catch (error) {
    console.log('❌ FFmpeg 未安装或不可用\n');
    console.log('错误信息:', error.message);
    
    console.log('\n📋 安装步骤:');
    console.log('─'.repeat(60));
    console.log('1. 访问: https://www.gyan.dev/ffmpeg/builds/');
    console.log('2. 下载: ffmpeg-release-essentials.zip');
    console.log('3. 解压到: C:\\ffmpeg');
    console.log('4. 添加到 PATH: C:\\ffmpeg\\bin');
    console.log('5. 重启命令行窗口');
    console.log('6. 运行: ffmpeg -version');
    console.log('─'.repeat(60));
    
    console.log('\n📖 详细指南: docs/12-10/FFMPEG_INSTALL_WINDOWS.md');
    
    process.exit(1);
  }
}

// 运行检测
checkFFmpeg().catch(console.error);
