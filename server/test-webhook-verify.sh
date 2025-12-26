#!/bin/bash

echo "🔍 Testing Webhook Verification Endpoint..."
echo ""
echo "Testing URL: https://wa.acestartechsi.com/api/webhook"
echo "Verify Token: my_webhook_verify_token_123"
echo ""

# Test the webhook verification endpoint
curl -X GET "https://wa.acestartechsi.com/api/webhook?hub.mode=subscribe&hub.verify_token=my_webhook_verify_token_123&hub.challenge=test_challenge_12345" \
  -H "Content-Type: application/json" \
  -v

echo ""
echo ""
echo "✅ If you see 'test_challenge_12345' in the response, the webhook is working correctly!"
echo "❌ If you see an error, check the server logs: pm2 logs 5"
