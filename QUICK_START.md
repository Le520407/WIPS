# 快速开始指南

## ✅ 当前状态

应用已成功启动！

- **前端:** http://localhost:5173
- **后端:** http://localhost:3001
- **状态:** ✅ 运行中

## 🚀 下一步

### 1. 配置 Meta 凭证

打开 `server/.env` 文件，填写你的 Meta 凭证：

```env
META_APP_ID=你的应用ID
META_APP_SECRET=你的应用密钥
WHATSAPP_BUSINESS_ACCOUNT_ID=你的商业账号ID
WHATSAPP_PHONE_NUMBER_ID=你的电话号码ID
WHATSAPP_ACCESS_TOKEN=你的访问令牌
```

打开 `client/.env` 文件：

```env
VITE_META_APP_ID=你的应用ID（与上面相同）
```

### 2. 获取 Meta 凭证

访问 [Meta for Developers](https://developers.facebook.com/)

1. 创建应用（Business 类型）
2. 添加 WhatsApp 产品
3. 在 WhatsApp > Getting Started 获取：
   - Business Account ID
   - Phone Number ID
   - Access Token（点击 Generate Token）
4. 在 Settings > Basic 获取：
   - App ID
   - App Secret

### 3. 测试应用

1. 打开浏览器访问 http://localhost:5173
2. 点击 "使用 Facebook 登录"
3. 完成 OAuth 授权流程

### 4. 配置 Webhook（可选）

如果需要接收 WhatsApp 消息：

1. 安装 ngrok: https://ngrok.com/
2. 运行: `ngrok http 3001`
3. 复制 HTTPS URL
4. 在 Meta > WhatsApp > Configuration 设置：
   - Callback URL: `https://你的ngrok地址/webhooks/whatsapp`
   - Verify Token: 在 `server/.env` 中设置 `META_VERIFY_TOKEN`
   - 订阅: messages, message_status

## 📁 项目结构

```
whatsapp-integration-platform/
├── client/              # React 前端
│   ├── src/
│   │   ├── pages/      # 页面组件
│   │   ├── components/ # 可复用组件
│   │   ├── services/   # API 服务
│   │   └── contexts/   # React Context
│   └── .env            # 前端环境变量
├── server/             # Node.js 后端
│   ├── src/
│   │   ├── controllers/# 控制器
│   │   ├── routes/     # 路由
│   │   ├── services/   # 业务逻辑
│   │   └── middleware/ # 中间件
│   └── .env            # 后端环境变量
└── README.md           # 项目文档
```

## 🔧 常用命令

```bash
# 同时启动前后端
npm run dev

# 单独启动服务器
cd server && npm run dev

# 单独启动客户端
cd client && npm run dev

# 构建生产版本
cd server && npm run build
cd client && npm run build
```

## 📚 主要功能

### 已实现
- ✅ Facebook OAuth 登录
- ✅ WhatsApp 消息发送
- ✅ 模板管理
- ✅ Dashboard 统计
- ✅ Webhook 接收

### 待开发
- ⏳ 数据库集成
- ⏳ 消息历史记录
- ⏳ 实时消息推送
- ⏳ 媒体文件支持

## 🐛 故障排除

### 前端无法连接后端
- 检查 `client/.env` 中的 `VITE_API_URL`
- 确保后端在 3001 端口运行

### Facebook 登录失败
- 检查 `META_APP_ID` 是否正确
- 确保应用在 Meta 控制台中已激活

### Webhook 验证失败
- 确保 `META_VERIFY_TOKEN` 与 Meta 配置一致
- 检查 Webhook URL 是否可公网访问

## 📖 详细文档

查看 `SETUP.md` 获取完整设置指南。

## 🎉 开始使用

现在你可以：
1. 访问 http://localhost:5173
2. 使用 Facebook 登录
3. 开始发送 WhatsApp 消息！

祝你使用愉快！🚀
