import { Request, Response } from 'express';
import { WebhookEvent } from '../types';
import { processWebhookMessage } from '../services/webhook.service';

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

    for (const entry of body.entry) {
      for (const change of entry.changes) {
        // Handle incoming messages
        if (change.value.messages) {
          for (const message of change.value.messages) {
            await processWebhookMessage(message, change.value.metadata);
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
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook error:', error);
    res.sendStatus(500);
  }
};
