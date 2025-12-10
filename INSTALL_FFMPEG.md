# ⚠️ 需要安装 FFmpeg

## 🔴 当前问题
语音录音功能无法正常工作 - 手机收不到语音消息

## 🔍 原因
服务器没有安装 FFmpeg，WebM 文件无法转换为 WhatsApp 支持的 OGG 格式

## ✅ 解决方案：安装 FFmpeg（5分钟）

### 快速安装步骤

1. **下载 FFmpeg**
   - 访问: https://www.gyan.dev/ffmpeg/builds/
   - 下载: `ffmpeg-release-essentials.zip` (约 80 MB)

2. **解压文件**
   - 解压下载的 ZIP 文件
   - 将文件夹重命名为 `ffmpeg`
   - 移动到 `C:\ffmpeg`
   - 确保路径是: `C:\ffmpeg\bin\ffmpeg.exe`

3. **添加到系统 PATH**
   - 按 `Win + X`，选择"系统"
   - 点击"高级系统设置"
   - 点击"环境变量"
   - 在"系统变量"中找到 `Path`，点击"编辑"
   - 点击"新建"
   - 输入: `C:\ffmpeg\bin`
   - 点击"确定"保存所有窗口

4. **验证安装**
   - 打开**新的**命令行窗口（重要！）
   - 运行: `ffmpeg -version`
   - 应该看到版本信息

5. **检测 FFmpeg**
   ```bash
   cd server
   node check-ffmpeg.js
   ```

6. **重启服务器**
   ```bash
   # 停止当前服务器 (Ctrl+C)
   npm run dev
   ```

7. **测试录音**
   - 打开 Messages 页面
   - 点击 Voice 按钮
   - 录音并发送
   - 检查手机是否收到

## 📖 详细文档

- **安装指南**: `docs/12-10/FFMPEG_INSTALL_WINDOWS.md`
- **问题诊断**: `docs/12-10/VOICE_FFMPEG_REQUIRED.md`
- **完整文档**: `docs/12-10/VOICE_NO_FFMPEG_SOLUTION.md`

## 🔧 检测脚本

运行以下命令检查 FFmpeg 状态：
```bash
cd server
node check-ffmpeg.js
```

## ⏱️ 预计时间
- 下载: 2 分钟
- 安装: 2 分钟
- 配置: 1 分钟
- **总计: 5 分钟**

---

**创建时间**: 2024年12月10日
