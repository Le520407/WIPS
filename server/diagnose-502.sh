#!/bin/bash

echo "=========================================="
echo "502 Error Diagnostic Script"
echo "=========================================="
echo ""

echo "1. Checking PM2 Process Status..."
pm2 show 5
echo ""

echo "2. Checking Recent Logs (Last 30 lines)..."
pm2 logs 5 --lines 30 --nostream
echo ""

echo "3. Checking if port 3299 is listening..."
netstat -tulpn | grep 3299
if [ $? -ne 0 ]; then
    echo "❌ Port 3299 is NOT listening"
else
    echo "✅ Port 3299 is listening"
fi
echo ""

echo "4. Checking all Node.js processes..."
netstat -tulpn | grep node
echo ""

echo "5. Testing backend health endpoint..."
curl -v http://localhost:3299/api/health
echo ""

echo "6. Checking PostgreSQL status..."
sudo systemctl status postgresql --no-pager | head -10
echo ""

echo "7. Testing database connection..."
psql -U whatsapp_user -d whatsapp_platform -c "SELECT 1;" 2>&1
echo ""

echo "8. Checking .env file exists..."
if [ -f "/var/www/whatsapp-integration/server/.env" ]; then
    echo "✅ .env file exists"
    echo "PORT setting:"
    grep "^PORT=" /var/www/whatsapp-integration/server/.env
else
    echo "❌ .env file NOT found"
fi
echo ""

echo "9. Checking if dist folder exists (compiled code)..."
if [ -d "/var/www/whatsapp-integration/server/dist" ]; then
    echo "✅ dist folder exists"
    ls -lh /var/www/whatsapp-integration/server/dist/ | head -5
else
    echo "❌ dist folder NOT found - code might not be compiled"
fi
echo ""

echo "=========================================="
echo "Diagnostic Complete"
echo "=========================================="
