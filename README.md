# WhatsApp Integration Platform

WhatsApp Business API 集成平台，支持 Facebook 登录、消息管理和模板功能。

## ✨ 功能特性

- ✅ **Demo 模式** - 无需 Meta 认证即可测试所有功能
- ✅ Facebook OAuth 登录
- ✅ WhatsApp Business API 集成
- ✅ 实时消息收发
- ✅ 消息模板管理
- ✅ Dashboard 数据统计
- ✅ Webhook 事件处理

## 🎭 立即体验 Demo 模式

**无需任何配置，立即测试！**

1. 访问 http://localhost:5173/login
2. 点击 "使用 Demo 模式登录"
3. 开始体验所有功能

详细说明请查看 [DEMO_MODE.md](DEMO_MODE.md)

## 🚀 快速开始

### 当前状态

应用已成功启动并运行在：
- **前端:** http://localhost:5173
- **后端:** http://localhost:3001

### 两种使用方式

#### 方式 1: Demo 模式（推荐新手）
- ✅ 无需配置
- ✅ 一键登录
- ✅ 模拟所有功能
- 📖 查看 [DEMO_MODE.md](DEMO_MODE.md)

#### 方式 2: 正常模式（需要 Meta 认证）
1. 编辑 `server/.env` 和 `client/.env` 文件
2. 填写你的 Meta 应用凭证
3. 重启服务器
4. 📖 查看 [QUICK_START.md](QUICK_START.md)

## 📚 文档

### 快速开始
- **[🎭 Demo 模式指南](docs/11-26/DEMO_MODE.md)** - 无需配置，立即体验
- **[🚀 快速开始](docs/11-26/QUICK_START.md)** - 5分钟快速上手
- **[⚡ Webhook 快速设置](docs/11-27/QUICK_WEBHOOK_SETUP.md)** - 5分钟配置消息接收

### 详细指南
- **[📘 完整设置指南](docs/11-26/SETUP.md)** - 详细配置说明
- **[📡 Webhook 设置指南](docs/11-27/WEBHOOK_SETUP_GUIDE.md)** - 完整的 Webhook 配置
- **[📸 Webhook 可视化指南](docs/11-27/WEBHOOK_VISUAL_GUIDE.md)** - 图文并茂的设置步骤

### 其他文档
- **[🧪 API 测试文档](docs/11-26/API_TESTING.md)** - API 接口测试
- **[📋 文档索引](docs/11-26/README.md)** - 所有文档列表

## 🛠 技术栈

**Frontend:** React 18 + TypeScript + Vite + Tailwind CSS  
**Backend:** Node.js + Express + TypeScript  
**API:** Meta WhatsApp Business API

## 📁 项目结构

```
whatsapp-integration-platform/
├── client/              # React 前端应用
│   ├── src/
│   │   ├── pages/      # 页面组件（Dashboard, Messages, Templates）
│   │   ├── components/ # 可复用组件（Layout, PrivateRoute）
│   │   ├── services/   # API 服务
│   │   └── contexts/   # React Context（Auth）
│   └── .env            # 前端环境变量
├── server/             # Node.js 后端应用
│   ├── src/
│   │   ├── controllers/# 业务控制器
│   │   ├── routes/     # API 路由
│   │   ├── services/   # 业务逻辑（WhatsApp, Facebook, Webhook）
│   │   └── middleware/ # 中间件（Auth）
│   └── .env            # 后端环境变量
└── README.md
```

## 🔧 常用命令

```bash
# 同时启动前后端（推荐）
npm run dev

# 单独启动
cd server && npm run dev  # 后端
cd client && npm run dev  # 前端

# 构建生产版本
cd server && npm run build
cd client && npm run build
```

## 🌐 主要 API 端点

### 认证
- `POST /api/auth/facebook` - Facebook 登录
- `GET /api/auth/me` - 获取当前用户

### 消息
- `GET /api/messages` - 获取消息列表
- `POST /api/messages/send` - 发送消息
- `GET /api/messages/conversations` - 获取对话列表

### 模板
- `GET /api/templates` - 获取模板列表
- `POST /api/templates` - 创建模板
- `PUT /api/templates/:id` - 更新模板
- `DELETE /api/templates/:id` - 删除模板

### Dashboard
- `GET /api/dashboard/stats` - 获取统计数据

### Webhook
- `GET /webhooks/whatsapp` - Webhook 验证
- `POST /webhooks/whatsapp` - 接收 WhatsApp 事件

## 📝 待开发功能

- [ ] 数据库集成（PostgreSQL/MongoDB）
- [ ] 消息历史记录持久化
- [ ] 实时消息推送（WebSocket）
- [ ] 媒体文件上传和发送
- [ ] 模板审核状态同步
- [ ] 用户权限管理
- [ ] 消息搜索和过滤

## 🐛 故障排除

常见问题请查看 [SETUP.md](SETUP.md) 的故障排除部分。

## 📄 License

MIT

---

**开始使用:** 访问 http://localhost:5173 并使用 Facebook 登录！🎉
