#!/bin/bash

# 部署前端回滚修复
# 这个脚本会在服务器上更新 DemoLogin.tsx 并重新构建前端

echo "=========================================="
echo "部署 Embedded Signup 回滚修复"
echo "=========================================="

# 1. 进入项目目录
cd /var/www/whatsapp-integration

echo ""
echo "✅ 当前目录: $(pwd)"

# 2. 备份当前的 DemoLogin.tsx
echo ""
echo "📦 备份当前文件..."
cp client/src/pages/DemoLogin.tsx client/src/pages/DemoLogin.tsx.backup.$(date +%Y%m%d_%H%M%S)

# 3. 更新 DemoLogin.tsx (回滚到 response_type: 'code')
echo ""
echo "📝 更新 DemoLogin.tsx..."
cat > /tmp/demologin_fix.txt << 'EOF'
    window.FB.login(
      function(response: any) {
        if (response.authResponse) {
          const { code } = response.authResponse;
          if (code) {
            handleEmbeddedSignupCallback(code);
          } else {
            alert('No authorization code received. Please try again.');
            setLoading(false);
          }
        } else {
          alert('WhatsApp connection was cancelled. Please try again.');
          setLoading(false);
        }
      },
      {
        config_id: '3910307729262069',
        response_type: 'code',
        override_default_response_type: true,
        extras: {
          setup: {},
          featureType: '',
          sessionInfoVersion: 2
        }
      }
    );
EOF

# 使用 sed 替换文件中的内容
# 注意: 这个方法比较简单，如果文件结构变化可能需要手动编辑
echo "⚠️  请手动编辑文件或使用 git pull 更新"

# 4. 进入 client 目录
cd client

# 5. 重新构建前端
echo ""
echo "🔨 重新构建前端..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 前端构建成功!"
else
    echo ""
    echo "❌ 前端构建失败!"
    exit 1
fi

# 6. 完成
echo ""
echo "=========================================="
echo "✅ 部署完成!"
echo "=========================================="
echo ""
echo "下一步:"
echo "1. 清除浏览器缓存 (Ctrl+Shift+R)"
echo "2. 测试 Embedded Signup"
echo ""
echo "如果还有问题，检查:"
echo "- pm2 logs whatsapp"
echo "- 浏览器控制台错误"
echo ""
