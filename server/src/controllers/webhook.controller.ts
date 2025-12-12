import { Request, Response } from 'express';
import { WebhookEvent } from '../types';
import { processWebhookMessage } from '../services/webhook.service';
import webhookDistributor from '../services/webhook-distributor.service';

export const verifyWebhook = (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log('🔍 Webhook verification request:', {
    mode,
    token,
    challenge,
    expectedToken: process.env.META_VERIFY_TOKEN,
    tokensMatch: token === process.env.META_VERIFY_TOKEN
  });

  if (mode === 'subscribe' && token === process.env.META_VERIFY_TOKEN) {
    console.log('✅ Webhook verified successfully');
    res.status(200).send(challenge);
  } else {
    console.log('❌ Webhook verification failed');
    console.log('   Mode:', mode, '(expected: subscribe)');
    console.log('   Token:', token);
    console.log('   Expected:', process.env.META_VERIFY_TOKEN);
    res.sendStatus(403);
  }
};

export const handleWebhook = async (req: Request, res: Response) => {
  try {
    const body: WebhookEvent = req.body;

    if (body.object !== 'whatsapp_business_account') {
      return res.sendStatus(404);
    }

    // 分发 webhook 到对应的网站（异步，不阻塞响应）
    webhookDistributor.distributeWebhook(body).catch(error => {
      console.error('Error distributing webhook:', error);
    });

    for (const entry of body.entry) {
      for (const change of entry.changes) {
        // Handle incoming messages
        if (change.value.messages) {
          for (const message of change.value.messages) {
            // Handle request_welcome message type (Conversational Components)
            if (message.type === 'request_welcome') {
              console.log('👋 Welcome message request received from:', message.from);
              
              // Get userId from phone_number_id
              const User = require('../models/User').default;
              const ConversationalComponent = require('../models/ConversationalComponent').default;
              const users = await User.findAll();
              const userId = users.length > 0 ? users[0].id : null;
              
              if (userId) {
                // Check if there's a configured welcome message template
                const config = await ConversationalComponent.findOne({
                  where: {
                    userId,
                    phoneNumberId: change.value.metadata.phone_number_id,
                  },
                });
                
                if (config && config.welcomeMessageTemplate) {
                  // Send the configured welcome message
                  const axios = require('axios');
                  const accessToken = process.env.ACCESS_TOKEN;
                  
                  try {
                    await axios.post(
                      `https://graph.facebook.com/v21.0/${change.value.metadata.phone_number_id}/messages`,
                      {
                        messaging_product: 'whatsapp',
                        to: message.from,
                        text: { body: config.welcomeMessageTemplate },
                      },
                      {
                        headers: {
                          Authorization: `Bearer ${accessToken}`,
                          'Content-Type': 'application/json',
                        },
                      }
                    );
                    console.log('✅ Welcome message sent to:', message.from);
                  } catch (error: any) {
                    console.error('❌ Failed to send welcome message:', error.response?.data || error.message);
                  }
                } else {
                  console.log('ℹ️ No welcome message template configured');
                }
              }
            } else {
              // Process normal messages
              await processWebhookMessage(message, change.value.metadata);
            }
          }
        }
        
        // Handle message status updates (delivered, read, etc.)
        if (change.value.statuses) {
          const { processMessageStatus } = require('../services/webhook.service');
          for (const status of change.value.statuses) {
            await processMessageStatus(status, change.value.metadata);
          }
        }
        
        // Handle call events
        if (change.value.calls) {
          const { processCallWebhook } = require('../services/webhook.service');
          for (const call of change.value.calls) {
            await processCallWebhook(call, change.value.metadata);
          }
        }
        
        // Handle groups events
        if (change.field === 'group_lifecycle_update' || 
            change.field === 'group_participants_update' ||
            change.field === 'group_settings_update' ||
            change.field === 'group_status_update') {
          
          console.log('📨 Groups webhook received:', {
            field: change.field,
            phone_number_id: change.value.metadata?.phone_number_id
          });
          
          // Get userId from phone_number_id
          // For now, use the first user (similar to message handling)
          const User = require('../models/User').default;
          const users = await User.findAll();
          const userId = users.length > 0 ? users[0].id : null;
          
          if (userId) {
            const { processGroupsWebhook } = require('../services/groups-webhook.service');
            await processGroupsWebhook(change, userId);
          } else {
            console.warn('⚠️ No user found for groups webhook');
          }
        }
        
        // Handle order events
        if (change.value.messages) {
          for (const message of change.value.messages) {
            if (message.type === 'order') {
              console.log('🛒 Order received:', (message as any).order);
              
              const User = require('../models/User').default;
              const Order = require('../models/Order').default;
              const users = await User.findAll();
              const userId = users.length > 0 ? users[0].id : null;
              
              if (userId && (message as any).order) {
                const order = (message as any).order;
                const items = order.product_items || [];
                const totalAmount = items.reduce((sum: number, item: any) => {
                  return sum + (parseFloat(item.item_price) * item.quantity);
                }, 0);
                
                await Order.create({
                  user_id: userId,
                  order_id: message.id,
                  customer_phone: message.from,
                  items: items,
                  total_amount: totalAmount,
                  currency: items[0]?.currency || 'USD',
                  status: 'pending',
                });
                
                console.log('✅ Order saved to database');
              }
            }
          }
        }
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook error:', error);
    res.sendStatus(500);
  }
};
