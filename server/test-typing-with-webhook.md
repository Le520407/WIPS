# Typing Indicator 测试指南

## 📋 前提条件

Typing indicator 需要一个 **incoming message_id**（从用户接收的消息）。

## 🧪 测试方法

### 方法 1: 手动测试（推荐）

1. **从手机发送消息**
   - 打开 WhatsApp
   - 发送任意消息到你的 WhatsApp Business 号码
   - 例如: "Hello"

2. **查看 Webhook 日志**
   - 检查服务器控制台
   - 找到接收到的消息日志
   - 复制 `message_id`（格式: `wamid.HBg...`）

3. **使用 message_id 测试**
   ```bash
   # 编辑 test-typing-direct.js
   # 将 MESSAGE_ID 替换为你复制的 ID
   node test-typing-direct.js
   ```

4. **查看效果**
   - 在手机上查看 WhatsApp
   - 应该看到 "typing..." 指示器
   - 持续 25 秒或直到发送消息

### 方法 2: 自动响应（实际应用）

在 webhook 中自动触发 typing indicator：

```typescript
// webhook.service.ts
if (message.type === 'text') {
  // 显示 typing indicator
  await sendTypingIndicator(message.from, message.id);
  
  // 处理消息（例如：查询数据库、调用 AI 等）
  await processMessage(message);
  
  // 发送回复
  await sendWhatsAppMessage(message.from, response);
}
```

## 📝 测试脚本使用

### test-typing-direct.js

直接调用 WhatsApp API：

```bash
# 1. 从手机发送消息
# 2. 获取 message_id
# 3. 编辑脚本中的 MESSAGE_ID
# 4. 运行测试
node test-typing-direct.js
```

### test-typing-indicator.js

通过我们的 API 测试：

```bash
# 1. 确保服务器运行中
npm run dev

# 2. 从手机发送消息
# 3. 获取 message_id
# 4. 编辑脚本中的 MESSAGE_ID
# 5. 运行测试
node test-typing-indicator.js
```

## 🎯 实际应用场景

### 客服自动回复

```typescript
// 当收到用户消息时
webhook.on('message', async (message) => {
  // 1. 立即显示 typing indicator
  await sendTypingIndicator(message.from, message.id);
  
  // 2. 处理消息（可能需要几秒钟）
  const response = await processUserQuery(message.text);
  
  // 3. 发送回复（typing indicator 自动消失）
  await sendWhatsAppMessage(message.from, response);
});
```

### AI 聊天机器人

```typescript
// 当收到用户消息时
webhook.on('message', async (message) => {
  // 显示 typing indicator
  await sendTypingIndicator(message.from, message.id);
  
  // 调用 AI API（可能需要几秒钟）
  const aiResponse = await callOpenAI(message.text);
  
  // 发送 AI 回复
  await sendWhatsAppMessage(message.from, aiResponse);
});
```

## ⚠️ 注意事项

1. **只能用于接收的消息** - 不能主动发送
2. **自动消失** - 25 秒后自动消失
3. **一次性** - 每个 message_id 只能使用一次
4. **需要 webhook** - 实际应用中需要配置 webhook

## 🔍 调试技巧

### 查看最近接收的消息

```sql
-- 在数据库中查询
SELECT message_id, from_number, content, created_at 
FROM messages 
WHERE from_number != '803320889535856'  -- 不是我们发送的
ORDER BY created_at DESC 
LIMIT 5;
```

### Webhook 日志

查看服务器控制台输出：
```
📨 Received message:
  From: 60105520735
  Message ID: wamid.HBgLNjAxMDU1MjA3MzUVAgARGBI...
  Type: text
  Content: Hello
```

## ✅ 成功标志

测试成功时你会看到：

1. **API 响应**
   ```json
   {
     "success": true
   }
   ```

2. **手机上的效果**
   - 消息被标记为已读（双蓝勾）
   - 显示 "typing..." 指示器
   - 持续约 25 秒

## 📚 相关文档

- [TYPING_INDICATOR_FINDINGS.md](./TYPING_INDICATOR_FINDINGS.md) - 详细调查结果
- [WhatsApp API 文档](https://developers.facebook.com/docs/whatsapp/cloud-api/typing-indicators)

---

**提示**: 在生产环境中，建议在 webhook 处理函数中自动触发 typing indicator，而不是手动调用。
