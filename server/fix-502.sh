#!/bin/bash

echo "=========================================="
echo "Fixing 502 Error - Backend Not Listening"
echo "=========================================="
echo ""

cd /var/www/whatsapp-integration/server

echo "Step 1: Checking current status..."
pm2 show 5 | grep -E "status|uptime|restarts"
echo ""

echo "Step 2: Checking if code is compiled..."
if [ ! -d "dist" ] || [ ! -f "dist/index.js" ]; then
    echo "❌ Code not compiled. Building now..."
    npm run build
    if [ $? -eq 0 ]; then
        echo "✅ Build successful"
    else
        echo "❌ Build failed. Check errors above."
        exit 1
    fi
else
    echo "✅ dist folder exists"
    echo "Rebuilding to ensure latest code..."
    npm run build
fi
echo ""

echo "Step 3: Checking database connection..."
psql -U whatsapp_user -d whatsapp_platform -c "SELECT 1;" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Database connection OK"
else
    echo "⚠️  Database connection failed. Restarting PostgreSQL..."
    sudo systemctl restart postgresql
    sleep 3
    psql -U whatsapp_user -d whatsapp_platform -c "SELECT 1;" > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✅ Database connection OK after restart"
    else
        echo "❌ Database still not accessible. Check PostgreSQL logs."
    fi
fi
echo ""

echo "Step 4: Restarting PM2 process..."
pm2 restart 5
echo "Waiting 5 seconds for server to start..."
sleep 5
echo ""

echo "Step 5: Testing backend health endpoint..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3299/api/health)
if [ "$RESPONSE" = "200" ]; then
    echo "✅ SUCCESS! Backend is now responding on port 3299"
    echo ""
    curl http://localhost:3299/api/health
    echo ""
    echo ""
    echo "=========================================="
    echo "✅ Fix Complete!"
    echo "=========================================="
    echo "Your backend is now running correctly."
    echo "You can now test the frontend at:"
    echo "https://wa.acestartechsi.com/"
else
    echo "❌ Backend still not responding (HTTP $RESPONSE)"
    echo ""
    echo "Checking logs for errors..."
    pm2 logs 5 --lines 20 --nostream
    echo ""
    echo "=========================================="
    echo "❌ Fix Failed"
    echo "=========================================="
    echo "Please check the logs above for errors."
    echo "Common issues:"
    echo "1. Database connection failed"
    echo "2. Port 3299 already in use"
    echo "3. Missing dependencies"
    echo ""
    echo "Run this for more details:"
    echo "pm2 logs 5 --lines 50"
fi
