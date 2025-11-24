# WhatsApp Integration Platform - 设置指南

## 快速开始

### 1. 安装依赖

项目已经安装好所有依赖。如果需要重新安装：

```bash
# 安装根目录依赖
npm install

# 安装服务器依赖
cd server
npm install

# 安装客户端依赖
cd ../client
npm install
```

### 2. 配置环境变量

#### 服务器配置 (server/.env)

已创建 `server/.env` 文件，请修改以下配置：

```env
# Meta/Facebook 配置
META_APP_ID=你的Meta应用ID
META_APP_SECRET=你的Meta应用密钥
META_VERIFY_TOKEN=你的Webhook验证令牌（自定义）
WHATSAPP_BUSINESS_ACCOUNT_ID=你的WhatsApp商业账号ID
WHATSAPP_PHONE_NUMBER_ID=你的电话号码ID
WHATSAPP_ACCESS_TOKEN=你的WhatsApp访问令牌

# JWT 密钥（请修改为随机字符串）
JWT_SECRET=your_jwt_secret_key_change_this_in_production

# 其他配置保持默认即可
```

#### 客户端配置 (client/.env)

已创建 `client/.env` 文件，请修改：

```env
VITE_API_URL=http://localhost:3001
VITE_META_APP_ID=你的Meta应用ID（与服务器相同）
```

### 3. 获取 Meta 凭证

#### 步骤 1: 创建 Meta 应用

1. 访问 [Meta for Developers](https://developers.facebook.com/)
2. 点击 "My Apps" > "Create App"
3. 选择 "Business" 类型
4. 填写应用名称和联系邮箱

#### 步骤 2: 添加 WhatsApp 产品

1. 在应用仪表板，点击 "Add Product"
2. 找到 "WhatsApp" 并点击 "Set Up"
3. 按照向导完成设置

#### 步骤 3: 获取凭证

**App ID 和 App Secret:**
- 在应用仪表板 > Settings > Basic
- 复制 "App ID" 和 "App Secret"

**WhatsApp Business Account ID:**
- WhatsApp > Getting Started
- 查看 "Business Account ID"

**Phone Number ID:**
- WhatsApp > Getting Started
- 在测试号码下方找到 "Phone Number ID"

**Access Token:**
- WhatsApp > Getting Started
- 点击 "Generate Token"
- 复制临时令牌（24小时有效）
- 生产环境需要生成永久令牌

#### 步骤 4: 配置 Webhook

1. WhatsApp > Configuration
2. 设置 Webhook URL: `https://你的域名.com/webhooks/whatsapp`
3. 设置 Verify Token: 与 `.env` 中的 `META_VERIFY_TOKEN` 相同
4. 订阅字段: `messages`, `message_status`

**注意:** 开发环境可以使用 ngrok 等工具创建公网 URL

### 4. 启动应用

#### 方式 1: 同时启动前后端（推荐）

```bash
npm run dev
```

#### 方式 2: 分别启动

**启动服务器:**
```bash
cd server
npm run dev
```

**启动客户端:**
```bash
cd client
npm run dev
```

### 5. 访问应用

- **前端:** http://localhost:5173
- **后端 API:** http://localhost:3001
- **健康检查:** http://localhost:3001/health

## 功能说明

### 已实现功能

✅ Facebook OAuth 登录
✅ WhatsApp Business API 集成
✅ 消息发送接口
✅ 模板管理接口
✅ Webhook 接收和验证
✅ Dashboard 统计
✅ 响应式 UI

### 待实现功能（TODO）

- [ ] 数据库集成（PostgreSQL/MongoDB）
- [ ] 消息持久化存储
- [ ] 实时消息推送（WebSocket）
- [ ] 媒体文件上传
- [ ] 模板审核状态同步
- [ ] 用户权限管理
- [ ] 消息搜索和过滤

## 开发提示

### 测试 Webhook

使用 ngrok 创建公网隧道：

```bash
# 安装 ngrok
# 访问 https://ngrok.com/ 下载

# 启动隧道
ngrok http 3001

# 复制 HTTPS URL 并在 Meta 配置中设置
```

### 测试消息发送

```bash
curl -X POST http://localhost:3001/api/messages/send \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "8613800138000",
    "message": "Hello from WhatsApp Platform!",
    "type": "text"
  }'
```

### 数据库设置（可选）

如果要添加数据库支持：

**PostgreSQL:**
```bash
# 安装 PostgreSQL
# 创建数据库
createdb whatsapp_platform

# 更新 .env 中的 DATABASE_URL
```

**MongoDB:**
```bash
# 安装 MongoDB
# 启动服务
mongod

# 更新 .env 中的 DATABASE_URL
DATABASE_URL=mongodb://localhost:27017/whatsapp_platform
```

## 故障排除

### 端口被占用

如果端口 3001 或 5173 被占用，修改：
- 服务器: `server/.env` 中的 `PORT`
- 客户端: `client/vite.config.ts` 中的 `server.port`

### TypeScript 错误

```bash
# 清理并重新安装
rm -rf node_modules package-lock.json
npm install
```

### CORS 错误

确保 `server/.env` 中的 `CLIENT_URL` 与客户端地址匹配。

## 生产部署

### 构建应用

```bash
# 构建服务器
cd server
npm run build

# 构建客户端
cd ../client
npm run build
```

### 环境变量

生产环境需要更新：
- `NODE_ENV=production`
- `CLIENT_URL=https://你的域名.com`
- `JWT_SECRET=强随机字符串`
- 使用永久 Access Token

### 推荐部署平台

- **前端:** Vercel, Netlify, Cloudflare Pages
- **后端:** Railway, Render, Heroku, AWS
- **数据库:** Supabase, PlanetScale, MongoDB Atlas

## 支持

如有问题，请检查：
1. 所有环境变量是否正确配置
2. Meta 应用是否正确设置
3. Webhook URL 是否可访问
4. Access Token 是否有效

祝开发顺利！🚀
