# WhatsApp Business Platform - 项目交接文档

**交接日期**: 2024年12月31日  
**项目名称**: WhatsApp Business Platform Integration  
**生产环境**: https://wa.acestartechsi.com/

---

## 📋 目录

1. [项目概述](#项目概述)
2. [技术栈](#技术栈)
3. [服务器信息](#服务器信息)
4. [项目结构](#项目结构)
5. [核心功能](#核心功能)
6. [当前状态](#当前状态)
7. [已知问题](#已知问题)
8. [常用命令](#常用命令)
9. [重要配置](#重要配置)
10. [文档索引](#文档索引)
11. [联系信息](#联系信息)

---

## 项目概述

这是一个基于 WhatsApp Business Platform API 的完整消息管理平台，支持：
- 多用户管理
- 消息收发（文本、图片、视频、音频、文档、位置、联系人、贴纸等）
- 模板消息管理
- 通话功能（WebRTC）
- 群组管理
- 自动回复
- 营销活动
- 电商功能
- 管理员系统

### 业务价值
- 企业可以通过 WhatsApp 与客户沟通
- 支持多个网站/业务使用同一个平台
- 提供完整的消息历史和分析

---

## 技术栈

### 前端
- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **UI**: Tailwind CSS
- **状态管理**: React Context
- **路由**: React Router v6
- **HTTP 客户端**: Axios

### 后端
- **运行时**: Node.js
- **框架**: Express.js + TypeScript
- **ORM**: Sequelize
- **数据库**: PostgreSQL
- **认证**: JWT + bcrypt
- **WebSocket**: Socket.io (用于实时消息)
- **进程管理**: PM2

### 第三方服务
- **WhatsApp API**: Meta Graph API v18.0
- **Facebook Login**: OAuth 2.0
- **Embedded Signup**: Meta 嵌入式注册流程

---

## 服务器信息

### 生产服务器
```
主机: srv889839
IP: [需要从公司获取]
域名: wa.acestartechsi.com
SSH: root@srv889839
```

### 目录结构
```
/var/www/whatsapp-integration/
├── client/          # 前端代码
│   ├── dist/       # 构建产物
│   └── src/        # 源代码
├── server/         # 后端代码
│   ├── src/        # 源代码
│   └── dist/       # 编译后的 JS
├── docs/           # 项目文档
└── MetaDocs/       # Meta API 官方文档
```

### 服务状态
```bash
# 查看 PM2 进程
pm2 list

# 查看日志
pm2 logs whatsapp

# 重启服务
pm2 restart whatsapp

# 查看 Nginx 状态
systemctl status nginx
```

### 端口配置
- **后端**: 3299
- **前端**: 通过 Nginx 代理到 80/443
- **数据库**: 5432 (PostgreSQL)

---

## 项目结构

### 前端 (`client/`)
```
client/
├── src/
│   ├── components/      # 可复用组件
│   │   ├── chat/       # 聊天相关组件
│   │   └── ...
│   ├── pages/          # 页面组件
│   ├── contexts/       # React Context
│   ├── hooks/          # 自定义 Hooks
│   ├── services/       # API 服务
│   ├── utils/          # 工具函数
│   └── styles/         # 样式文件
├── index.html
├── vite.config.ts
└── package.json
```

### 后端 (`server/`)
```
server/
├── src/
│   ├── controllers/    # 控制器
│   ├── models/         # Sequelize 模型
│   ├── routes/         # 路由定义
│   ├── services/       # 业务逻辑
│   ├── middleware/     # 中间件
│   ├── utils/          # 工具函数
│   └── index.ts        # 入口文件
├── *.js               # 维护脚本
├── .env               # 环境变量
└── package.json
```

---

## 核心功能

### 1. 用户认证
- **Embedded Signup**: Meta 嵌入式注册（OAuth 流程）
- **密码登录**: 传统用户名密码登录
- **JWT Token**: 7天有效期

**重要文件**:
- `server/src/controllers/auth.controller.ts`
- `client/src/pages/DemoLogin.tsx`
- `client/src/contexts/AuthContext.tsx`

### 2. 消息功能
支持的消息类型：
- 文本消息
- 图片、视频、音频、文档
- 位置消息
- 联系人卡片
- 贴纸
- 回复消息
- Reaction（表情回应）

**重要文件**:
- `server/src/controllers/message.controller.ts`
- `server/src/services/whatsapp.service.ts`
- `client/src/pages/Messages.tsx`
- `client/src/components/chat/ChatBubble.tsx`

### 3. 模板消息
- 创建、编辑、删除模板
- 模板审核状态跟踪
- 模板分组管理
- 发送模板消息

**重要文件**:
- `server/src/controllers/template.controller.ts`
- `client/src/pages/Templates.tsx`
- `client/src/pages/TemplateGroups.tsx`

### 4. 通话功能
- WebRTC 视频/音频通话
- SIP 集成
- 通话质量监控
- 未接来电管理

**重要文件**:
- `server/src/controllers/call.controller.ts`
- `client/src/components/WebRTCCall.tsx`
- `client/src/hooks/useWebRTC.ts`

### 5. 群组管理
- 创建/管理群组
- 群组邀请链接
- 加入请求审批
- 群组消息

**重要文件**:
- `server/src/controllers/groups.controller.ts`
- `client/src/pages/Groups.tsx`
- `client/src/pages/GroupDetail.tsx`

### 6. 管理员系统
- 用户管理
- 账户管理
- 权限控制
- 使用统计

**重要文件**:
- `server/src/controllers/admin.controller.ts`
- `client/src/pages/AdminDashboard.tsx`
- `client/src/pages/UserManagement.tsx`

---

## 当前状态

### ✅ 已完成功能
1. 完整的消息收发系统
2. 模板消息管理
3. 用户认证（密码登录）
4. WebRTC 通话功能
5. 群组管理
6. 管理员系统
7. 自动回复规则
8. 营销活动管理
9. 电商功能
10. Webhook 集成

### ⚠️ 需要注意的问题

#### 1. Embedded Signup 问题（重要！）
**状态**: 部分功能受限

**问题描述**:
- 用户完成 Embedded Signup 后遇到 Error 200
- 原因：用户的 Facebook 账号没有权限使用 Meta App
- 已添加用户为测试用户，但 Meta 系统可能需要时间同步

**临时解决方案**:
使用密码登录代替 Embedded Signup
```bash
cd /var/www/whatsapp-integration/server
node delete-user-and-setup-password.js
```

**长期解决方案**:
1. 等待 Meta 权限同步（可能需要几小时到几天）
2. 或使用 System User Token（永久不过期）
3. 或修复 Meta App 配置

**相关文档**:
- `docs/12-31/EMBEDDED_SIGNUP_DUPLICATE_FIX.md`
- `docs/12-31/DAILY_REPORT_2024-12-31_CN.md`

#### 2. 数据库用户状态
当前有 2 个用户：
1. **test@whatsapp-platform.com** ✅
   - 完整配置，可正常使用
   - WABA ID: 673274279136021
   - Phone Number ID: 803320889535856

2. **whatsapp_1767086593038@business.com** ❌
   - 需要删除（配置错误）

**清理命令**:
```bash
cd /var/www/whatsapp-integration/server
node delete-user-and-setup-password.js
```

#### 3. Access Token 管理
- 当前使用 60 天有效期的 Long-lived Token
- 需要定期更新（建议使用 System User Token）

**检查 Token**:
```bash
cd /var/www/whatsapp-integration/server
node verify-access-token.js
```

---

## 常用命令

### 服务器操作
```bash
# SSH 登录
ssh root@srv889839

# 进入项目目录
cd /var/www/whatsapp-integration

# 查看 PM2 进程
pm2 list
pm2 logs whatsapp
pm2 restart whatsapp

# 查看 Nginx 日志
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# 重启 Nginx
systemctl restart nginx
```

### 后端开发
```bash
cd server

# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 生产模式
npm start

# 数据库脚本
node check-user-whatsapp-config.js    # 检查用户配置
node verify-access-token.js           # 验证 token
node merge-duplicate-users.js         # 合并重复用户
```

### 前端开发
```bash
cd client

# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 预览构建
npm run preview
```

### 数据库操作
```bash
# 连接数据库
psql -U whatsapp_user -d whatsapp_platform

# 常用查询
SELECT * FROM users;
SELECT * FROM messages ORDER BY "createdAt" DESC LIMIT 10;
SELECT * FROM templates;
```

---

## 重要配置

### 环境变量 (`server/.env`)
```env
# Meta/Facebook
META_APP_ID=1964783984342192
META_APP_SECRET=6ede29236f994a2afcf13dac8b78124d
META_VERIFY_TOKEN=my_webhook_verify_token_123

# WhatsApp
WHATSAPP_BUSINESS_ACCOUNT_ID=673274279136021
WHATSAPP_PHONE_NUMBER_ID=803320889535856
WHATSAPP_ACCESS_TOKEN=[60天有效期的token]

# 数据库
DATABASE_URL=postgresql://whatsapp_user:123@localhost:5432/whatsapp_platform
DB_HOST=localhost
DB_PORT=5432
DB_NAME=whatsapp_platform
DB_USER=whatsapp_user
DB_PASSWORD=123

# JWT
JWT_SECRET=astsi_jwt_secret_key_2024_production_ready
JWT_EXPIRES_IN=7d

# 服务器
PORT=3299
NODE_ENV=development
CLIENT_URL=http://localhost:5174
```

### Nginx 配置
位置: `/etc/nginx/sites-available/whatsapp`

关键配置：
- 前端静态文件: `/var/www/whatsapp-integration/client/dist`
- API 代理: `http://localhost:3299`
- SSL 证书: Let's Encrypt

### PM2 配置
```bash
# 查看配置
pm2 show whatsapp

# 当前配置
Name: whatsapp
Script: /var/www/whatsapp-integration/server/dist/index.js
Instances: 1
Mode: fork
```

---

## 文档索引

### 快速开始
- `README.md` - 项目总览
- `docs/12-23/快速执行指南.md` - 快速上手指南

### 功能文档
- `docs/12-15/` - 消息功能完整文档
- `docs/12-10/` - 群组功能文档
- `docs/12-09/` - 通话功能文档
- `docs/12-12/` - 管理员系统文档
- `docs/12-11/` - 网站集成文档

### 部署文档
- `docs/12-15/GIT_DEPLOYMENT_GUIDE.md` - Git 部署指南
- `docs/12-15/BUILD_ON_SERVER_GUIDE.md` - 服务器构建指南
- `docs/12-23/PRODUCTION_SETUP_COMPLETE.md` - 生产环境配置

### 问题排查
- `docs/12-31/DAILY_REPORT_2024-12-31_CN.md` - 最新问题和修复
- `docs/12-31/EMBEDDED_SIGNUP_DUPLICATE_FIX.md` - Embedded Signup 问题
- `docs/12-23/TOKEN_ISSUE_SOLUTION_CN.md` - Token 问题解决方案
- `.kiro/steering/database-conventions.md` - 数据库命名规范

### Meta API 文档
- `MetaDocs/` - Meta 官方 API 文档（本地副本）
- [Meta for Developers](https://developers.facebook.com/docs/whatsapp)

---

## 数据库结构

### 核心表
```sql
-- 用户表
users (
  id UUID PRIMARY KEY,
  email VARCHAR,
  name VARCHAR,
  facebook_id VARCHAR,
  whatsapp_account_id VARCHAR,
  phone_number_id VARCHAR,
  access_token TEXT,
  password_hash VARCHAR,
  role VARCHAR,
  status VARCHAR,
  "createdAt" TIMESTAMP,
  "updatedAt" TIMESTAMP
)

-- 消息表
messages (
  id UUID PRIMARY KEY,
  user_id UUID,
  conversation_id VARCHAR,
  message_id VARCHAR,
  type VARCHAR,
  content TEXT,
  status VARCHAR,
  direction VARCHAR,
  "createdAt" TIMESTAMP,
  "updatedAt" TIMESTAMP
)

-- 模板表
templates (
  id UUID PRIMARY KEY,
  user_id UUID,
  name VARCHAR,
  category VARCHAR,
  language VARCHAR,
  status VARCHAR,
  components JSONB,
  "createdAt" TIMESTAMP,
  "updatedAt" TIMESTAMP
)
```

**重要**: 
- Sequelize 使用 **camelCase** 命名时间戳字段：`createdAt`, `updatedAt`
- SQL 查询中必须用双引号：`"createdAt"`
- 详见：`.kiro/steering/database-conventions.md`

---

## 常见问题

### 1. 如何添加新用户？
```bash
# 方法 1: 使用密码登录
cd /var/www/whatsapp-integration/server
node set-test-password.js

# 方法 2: 等待 Embedded Signup 修复
# 参考: docs/12-31/EMBEDDED_SIGNUP_DUPLICATE_FIX.md
```

### 2. 如何更新 Access Token？
```bash
cd /var/www/whatsapp-integration/server
node verify-access-token.js      # 检查当前 token
node extend-access-token.js      # 延长 token 有效期
```

### 3. 如何查看用户配置？
```bash
cd /var/www/whatsapp-integration/server
node check-user-whatsapp-config.js
```

### 4. 如何重启服务？
```bash
pm2 restart whatsapp
pm2 logs whatsapp --lines 100
```

### 5. 如何部署新代码？
```bash
# 后端
cd /var/www/whatsapp-integration/server
git pull
npm install
npm run build
pm2 restart whatsapp

# 前端
cd /var/www/whatsapp-integration/client
git pull
npm install
npm run build
# Nginx 会自动使用新的 dist/ 目录
```

### 6. 数据库连接失败？
```bash
# 检查 PostgreSQL 状态
systemctl status postgresql

# 重启 PostgreSQL
systemctl restart postgresql

# 测试连接
psql -U whatsapp_user -d whatsapp_platform
```

---

## 安全注意事项

### 敏感信息
1. **不要提交到 Git**:
   - `server/.env`
   - `client/.env`
   - 任何包含 token 或密码的文件

2. **定期更新**:
   - Access Token（60天过期）
   - JWT Secret（如果泄露）
   - 数据库密码

3. **访问控制**:
   - 服务器 SSH 密钥
   - Meta App Secret
   - 数据库凭证

### Meta App 配置
- **App ID**: 1964783984342192
- **App Dashboard**: https://developers.facebook.com/apps/1964783984342192
- **需要的权限**: 
  - whatsapp_business_management
  - whatsapp_business_messaging
  - business_management

---

## 下一步建议

### 短期（1-2周）
1. ✅ 修复 Embedded Signup Error 200
   - 等待 Meta 权限同步
   - 或实施 System User Token 方案

2. 清理数据库
   - 删除重复/无效用户
   - 运行 `merge-duplicate-users.js`

3. 监控 Token 有效期
   - 设置自动提醒
   - 考虑自动续期机制

### 中期（1-3个月）
1. 实施 System User Token
   - 永久不过期
   - 更安全的权限管理

2. 添加监控和告警
   - 服务器健康检查
   - API 调用限制监控
   - 错误日志聚合

3. 性能优化
   - 数据库查询优化
   - 添加缓存层（Redis）
   - CDN 配置

### 长期（3-6个月）
1. 多租户架构
   - 完善多用户隔离
   - 资源配额管理

2. 高可用性
   - 数据库主从复制
   - 负载均衡
   - 自动故障转移

3. 功能扩展
   - AI 自动回复
   - 高级分析报表
   - 第三方集成（CRM、ERP）

---

## 联系信息

### Meta 支持
- **开发者文档**: https://developers.facebook.com/docs/whatsapp
- **支持中心**: https://developers.facebook.com/support
- **社区论坛**: https://stackoverflow.com/questions/tagged/whatsapp-business-api

### 项目资源
- **代码仓库**: [需要提供 Git URL]
- **项目管理**: [需要提供项目管理工具链接]
- **团队沟通**: [需要提供团队沟通渠道]

### 紧急联系
- **服务器提供商**: [需要提供联系方式]
- **域名注册商**: [需要提供联系方式]
- **数据库备份**: [需要提供备份位置]

---

## 附录

### A. 有用的脚本
所有维护脚本位于 `server/` 目录：

```bash
# 用户管理
check-user-whatsapp-config.js      # 检查用户配置
delete-user-and-setup-password.js  # 删除用户并设置密码
merge-duplicate-users.js           # 合并重复用户
set-test-password.js               # 设置测试密码

# Token 管理
verify-access-token.js             # 验证 token
extend-access-token.js             # 延长 token
diagnose-access-token.js           # 诊断 token 问题

# 数据库维护
create-new-database.js             # 创建新数据库
rebuild-admin-tables.js            # 重建管理员表
fix-user-roles.js                  # 修复用户角色

# 调试工具
check-messages.js                  # 检查消息
check-reactions.js                 # 检查 reactions
debug-reaction.js                  # 调试 reaction
```

### B. 代码规范
- **TypeScript**: 严格模式
- **ESLint**: 使用项目配置
- **Prettier**: 自动格式化
- **命名规范**:
  - 文件名：kebab-case
  - 组件名：PascalCase
  - 函数名：camelCase
  - 常量：UPPER_SNAKE_CASE

### C. Git 工作流
```bash
# 创建功能分支
git checkout -b feature/your-feature-name

# 提交代码
git add .
git commit -m "feat: your feature description"

# 推送到远程
git push origin feature/your-feature-name

# 合并到主分支（需要 code review）
# 使用 Pull Request
```

---

## 结语

这个项目已经实现了 WhatsApp Business Platform 的大部分核心功能。当前主要的挑战是 Embedded Signup 的 Meta App 权限问题，但已经有临时解决方案（密码登录）。

项目文档非常完整，几乎每个功能都有详细的实现文档和测试指南。建议新接手的同事：

1. 先阅读 `README.md` 了解项目概况
2. 查看 `docs/12-31/DAILY_REPORT_2024-12-31_CN.md` 了解最新状态
3. 运行 `check-user-whatsapp-config.js` 检查当前配置
4. 阅读相关功能的文档（在 `docs/` 目录下）

如有任何问题，可以参考 `docs/` 目录下的详细文档，或查看代码中的注释。

祝工作顺利！🚀

---

**文档版本**: 1.0  
**最后更新**: 2024年12月31日  
**维护者**: [交接人姓名]
