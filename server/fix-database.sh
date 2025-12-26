#!/bin/bash

echo "=========================================="
echo "修复数据库连接问题"
echo "=========================================="
echo ""

echo "步骤 1: 检查 PostgreSQL 状态..."
sudo systemctl status postgresql --no-pager | head -10
echo ""

echo "步骤 2: 启动 PostgreSQL（如果未运行）..."
sudo systemctl start postgresql
sleep 2
echo ""

echo "步骤 3: 测试数据库连接..."
psql -U whatsapp_user -d whatsapp_platform -c "SELECT 1;" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ 数据库连接成功"
else
    echo "❌ 数据库连接失败"
    echo ""
    echo "尝试创建数据库和用户..."
    
    # 切换到 postgres 用户创建数据库
    sudo -u postgres psql << EOF
-- 创建用户（如果不存在）
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'whatsapp_user') THEN
        CREATE USER whatsapp_user WITH PASSWORD '123';
    END IF;
END
\$\$;

-- 创建数据库（如果不存在）
SELECT 'CREATE DATABASE whatsapp_platform OWNER whatsapp_user'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'whatsapp_platform')\gexec

-- 授予权限
GRANT ALL PRIVILEGES ON DATABASE whatsapp_platform TO whatsapp_user;
EOF

    echo ""
    echo "再次测试连接..."
    psql -U whatsapp_user -d whatsapp_platform -c "SELECT 1;" > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✅ 数据库连接成功"
    else
        echo "❌ 仍然无法连接数据库"
        echo ""
        echo "请检查："
        echo "1. PostgreSQL 是否正在运行: sudo systemctl status postgresql"
        echo "2. 用户密码是否正确: server/.env 中的 DB_PASSWORD"
        echo "3. PostgreSQL 配置: /etc/postgresql/*/main/pg_hba.conf"
        exit 1
    fi
fi
echo ""

echo "步骤 4: 检查 .env 配置..."
cd /var/www/whatsapp-integration/server
if [ -f ".env" ]; then
    echo "数据库配置:"
    grep "^DB_" .env
    grep "^DATABASE_URL" .env
else
    echo "❌ .env 文件不存在"
    exit 1
fi
echo ""

echo "步骤 5: 重启后端..."
pm2 restart 5
echo "等待 5 秒让服务器启动..."
sleep 5
echo ""

echo "步骤 6: 检查日志..."
pm2 logs 5 --lines 10 --nostream
echo ""

echo "步骤 7: 测试后端健康检查..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3299/api/health)
if [ "$RESPONSE" = "200" ]; then
    echo "✅ 成功！后端现在正在响应"
    echo ""
    curl http://localhost:3299/api/health
    echo ""
    echo ""
    echo "=========================================="
    echo "✅ 修复完成！"
    echo "=========================================="
    echo "你的后端现在正常运行了。"
    echo "可以测试前端: https://wa.acestartechsi.com/"
else
    echo "❌ 后端仍未响应 (HTTP $RESPONSE)"
    echo ""
    echo "查看完整日志:"
    echo "pm2 logs 5 --lines 50"
fi
