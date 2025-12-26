#!/bin/bash

echo "🔍 Webhook Diagnostics"
echo "===================="
echo ""

echo "1️⃣ Checking if server is running..."
pm2 status | grep whatsapp
echo ""

echo "2️⃣ Checking .env file for META_VERIFY_TOKEN..."
grep "META_VERIFY_TOKEN" /var/www/whatsapp-integration/server/.env
echo ""

echo "3️⃣ Testing webhook endpoint locally..."
curl -s "http://localhost:3299/api/webhook?hub.mode=subscribe&hub.verify_token=my_webhook_verify_token_123&hub.challenge=test123"
echo ""
echo ""

echo "4️⃣ Testing webhook endpoint via HTTPS..."
curl -s "https://wa.acestartechsi.com/api/webhook?hub.mode=subscribe&hub.verify_token=my_webhook_verify_token_123&hub.challenge=test123"
echo ""
echo ""

echo "5️⃣ Checking recent server logs..."
pm2 logs 5 --lines 20 --nostream
echo ""

echo "===================="
echo "✅ Diagnostics complete!"
echo ""
echo "Expected result: Both curl commands should return 'test123'"
echo "If not, check the logs above for errors"
