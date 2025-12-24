# 快速设置 HTTPS 开发环境

## 问题
Facebook 要求使用 HTTPS，但你在 `http://localhost:5174` 运行。

## 解决方案（5分钟搞定）

### 1️⃣ 启动前端 Ngrok

打开**新的命令行窗口**，运行：

```bash
ngrok http 5174
```

你会看到：
```
Forwarding  https://xxxx-xxxx-xxxx.ngrok-free.app -> http://localhost:5174
```

**复制这个 HTTPS URL！** 👆

### 2️⃣ 配置 Meta Dashboard

访问：https://developers.facebook.com/apps/1964783984342192/settings/basic/

#### A. App Domains
添加（不要 https://）：
```
xxxx-xxxx-xxxx.ngrok-free.app
```

#### B. Website
添加：
```
https://xxxx-xxxx-xxxx.ngrok-free.app
```

点击 **Save Changes**

### 3️⃣ 配置 Facebook Login

访问：https://developers.facebook.com/apps/1964783984342192/fb-login/settings/

在 **Valid OAuth Redirect URIs** 添加：
```
https://xxxx-xxxx-xxxx.ngrok-free.app/login
https://xxxx-xxxx-xxxx.ngrok-free.app/
```

点击 **Save Changes**

### 4️⃣ 更新 server/.env

打开 `server/.env`，修改：

```env
CLIENT_URL=https://xxxx-xxxx-xxxx.ngrok-free.app
```

（替换成你的 ngrok URL）

### 5️⃣ 重启服务器

```bash
# 停止当前服务器 (Ctrl+C)
# 然后重新启动
cd server
npm run dev
```

### 6️⃣ 测试！

访问（用 ngrok URL，不是 localhost）：
```
https://xxxx-xxxx-xxxx.ngrok-free.app/login
```

点击 **"WhatsApp Business Embedded Signup"** 按钮

应该可以看到 Facebook 登录弹窗了！✅

---

## 当前运行的服务

你需要同时运行：

1. ✅ **后端服务器**: `localhost:3299`
2. ✅ **前端服务器**: `localhost:5174`
3. ✅ **后端 Ngrok**: `https://blockish-calculatedly-kaleb.ngrok-free.dev` → 3299
4. 🆕 **前端 Ngrok**: `https://xxxx-xxxx-xxxx.ngrok-free.app` → 5174

## 命令行窗口布局

```
窗口 1: cd server && npm run dev
窗口 2: cd client && npm run dev
窗口 3: ngrok http 3299 (已运行)
窗口 4: ngrok http 5174 (新开)
```

---

## 注意事项

⚠️ **每次重启 ngrok，URL 会变！**

如果你关闭了 ngrok 再重新打开，URL 会不一样，需要：
1. 重新在 Meta Dashboard 更新配置
2. 重新更新 `server/.env` 的 `CLIENT_URL`
3. 重启服务器

💡 **建议**：开发时保持 ngrok 一直运行，不要关闭。

---

## 快速检查清单

- [ ] 运行 `ngrok http 5174`
- [ ] 复制 ngrok HTTPS URL
- [ ] Meta Dashboard → Settings → Basic → 添加 App Domain
- [ ] Meta Dashboard → Settings → Basic → 添加 Website URL
- [ ] Meta Dashboard → Facebook Login → Settings → 添加 OAuth Redirect URIs
- [ ] 更新 `server/.env` 的 `CLIENT_URL`
- [ ] 重启服务器
- [ ] 用 ngrok URL 访问（不是 localhost）
- [ ] 测试 Embedded Signup 按钮

完成！🎉
