# API 测试指南

## 健康检查

```bash
curl http://localhost:3001/health
```

响应：
```json
{
  "status": "ok",
  "timestamp": "2024-11-24T..."
}
```

## 认证 API

### Facebook 登录

```bash
curl -X POST http://localhost:3001/api/auth/facebook \
  -H "Content-Type: application/json" \
  -d '{
    "accessToken": "YOUR_FACEBOOK_ACCESS_TOKEN"
  }'
```

响应：
```json
{
  "token": "JWT_TOKEN",
  "user": {
    "id": "user_id",
    "facebookId": "fb_id",
    "name": "User Name",
    "email": "user@example.com"
  }
}
```

### 获取当前用户

```bash
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 消息 API

### 发送消息

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

响应：
```json
{
  "success": true,
  "messageId": "wamid.xxx"
}
```

### 获取消息列表

```bash
curl http://localhost:3001/api/messages \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 获取对话列表

```bash
curl http://localhost:3001/api/messages/conversations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 模板 API

### 获取模板列表

```bash
curl http://localhost:3001/api/templates \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 创建模板

```bash
curl -X POST http://localhost:3001/api/templates \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "welcome_message",
    "language": "zh_CN",
    "category": "MARKETING",
    "components": [
      {
        "type": "BODY",
        "text": "欢迎使用我们的服务！"
      }
    ]
  }'
```

### 更新模板

```bash
curl -X PUT http://localhost:3001/api/templates/TEMPLATE_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "updated_template"
  }'
```

### 删除模板

```bash
curl -X DELETE http://localhost:3001/api/templates/TEMPLATE_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Dashboard API

### 获取统计数据

```bash
curl http://localhost:3001/api/dashboard/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

响应：
```json
{
  "stats": {
    "totalMessages": 0,
    "totalConversations": 0,
    "activeConversations": 0,
    "templatesCount": 0,
    "messagesThisWeek": 0,
    "messagesThisMonth": 0
  }
}
```

## Webhook API

### Webhook 验证（GET）

Meta 会发送 GET 请求验证 Webhook：

```bash
curl "http://localhost:3001/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=YOUR_VERIFY_TOKEN&hub.challenge=CHALLENGE_STRING"
```

如果 verify_token 正确，返回 challenge 字符串。

### Webhook 接收（POST）

Meta 发送消息事件：

```bash
curl -X POST http://localhost:3001/webhooks/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "id": "BUSINESS_ACCOUNT_ID",
      "changes": [{
        "value": {
          "messaging_product": "whatsapp",
          "metadata": {
            "display_phone_number": "15551234567",
            "phone_number_id": "PHONE_NUMBER_ID"
          },
          "messages": [{
            "from": "8613800138000",
            "id": "wamid.xxx",
            "timestamp": "1234567890",
            "type": "text",
            "text": {
              "body": "Hello"
            }
          }]
        },
        "field": "messages"
      }]
    }]
  }'
```

## 使用 Postman

1. 导入以下环境变量：
   - `BASE_URL`: http://localhost:3001
   - `JWT_TOKEN`: 登录后获取的 token

2. 在请求头添加：
   - `Authorization`: Bearer {{JWT_TOKEN}}
   - `Content-Type`: application/json

## 错误响应

所有错误响应格式：

```json
{
  "error": "错误描述"
}
```

常见状态码：
- `200`: 成功
- `400`: 请求参数错误
- `401`: 未授权（token 无效或缺失）
- `403`: 禁止访问
- `404`: 资源不存在
- `500`: 服务器错误

## 测试流程

1. **健康检查**: 确保服务器运行
2. **登录**: 获取 JWT token
3. **测试 API**: 使用 token 调用其他接口
4. **Webhook**: 使用 ngrok 测试 Webhook 接收

## 注意事项

- 所有需要认证的接口都需要在 Header 中添加 `Authorization: Bearer TOKEN`
- 电话号码格式: 国家码 + 号码（如：8613800138000）
- 时间戳使用 ISO 8601 格式
- 所有请求和响应都使用 JSON 格式
