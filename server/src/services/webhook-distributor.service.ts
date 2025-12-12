import axios from 'axios';
import { Op } from 'sequelize';
import Website from '../models/Website';
import MessageLog from '../models/MessageLog';

interface WebhookPayload {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        messages?: any[];
        statuses?: any[];
      };
      field: string;
    }>;
  }>;
}

class WebhookDistributorService {
  /**
   * 分发 webhook 到对应的网站
   */
  async distributeWebhook(payload: WebhookPayload): Promise<void> {
    try {
      const phoneNumberId = payload.entry[0]?.changes[0]?.value?.metadata?.phone_number_id;

      if (!phoneNumberId) {
        console.log('No phone number ID in webhook payload');
        return;
      }

      // 查找对应的网站
      const websites = await Website.findAll({
        where: {
          phone_number_id: phoneNumberId,
          is_active: true,
        },
      });

      if (websites.length === 0) {
        console.log(`No active website found for phone number ID: ${phoneNumberId}`);
        return;
      }

      // 分发到所有匹配的网站
      const distributionPromises = websites.map(website =>
        this.forwardWebhook(website, payload)
      );

      await Promise.allSettled(distributionPromises);
    } catch (error) {
      console.error('Error distributing webhook:', error);
      throw error;
    }
  }

  /**
   * 转发 webhook 到指定网站
   */
  private async forwardWebhook(website: Website, payload: WebhookPayload): Promise<void> {
    if (!website.webhook_url) {
      console.log(`Website ${website.name} has no webhook URL configured`);
      return;
    }

    try {
      const response = await axios.post(website.webhook_url, payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Source': 'whatsapp-integration-platform',
          'X-Website-Id': website.id,
        },
        timeout: 10000, // 10 seconds timeout
      });

      console.log(`Webhook forwarded to ${website.name}: ${response.status}`);

      // 记录成功的转发
      await this.logWebhookDelivery(website.id, payload, 'success', response.status);
    } catch (error: any) {
      console.error(`Failed to forward webhook to ${website.name}:`, error.message);

      // 记录失败的转发
      await this.logWebhookDelivery(
        website.id,
        payload,
        'failed',
        error.response?.status || 0,
        error.message
      );

      // 实现重试逻辑
      await this.retryWebhook(website, payload, 1);
    }
  }

  /**
   * 重试 webhook 转发
   */
  private async retryWebhook(
    website: Website,
    payload: WebhookPayload,
    attempt: number,
    maxAttempts: number = 3
  ): Promise<void> {
    if (attempt >= maxAttempts) {
      console.log(`Max retry attempts reached for ${website.name}`);
      return;
    }

    // 指数退避：2^attempt 秒
    const delay = Math.pow(2, attempt) * 1000;
    await new Promise(resolve => setTimeout(resolve, delay));

    try {
      const response = await axios.post(website.webhook_url!, payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Source': 'whatsapp-integration-platform',
          'X-Website-Id': website.id,
          'X-Retry-Attempt': attempt.toString(),
        },
        timeout: 10000,
      });

      console.log(`Webhook retry ${attempt} succeeded for ${website.name}`);
      await this.logWebhookDelivery(website.id, payload, 'success', response.status, `Retry ${attempt}`);
    } catch (error: any) {
      console.error(`Webhook retry ${attempt} failed for ${website.name}`);
      await this.retryWebhook(website, payload, attempt + 1, maxAttempts);
    }
  }

  /**
   * 记录 webhook 转发日志
   */
  private async logWebhookDelivery(
    websiteId: string,
    payload: WebhookPayload,
    status: 'success' | 'failed',
    statusCode: number,
    errorMessage?: string
  ): Promise<void> {
    try {
      // 提取消息信息
      const messages = payload.entry[0]?.changes[0]?.value?.messages || [];
      const statuses = payload.entry[0]?.changes[0]?.value?.statuses || [];

      // 记录每条消息
      for (const message of messages) {
        await MessageLog.create({
          website_id: websiteId,
          message_id: message.id,
          direction: 'inbound',
          status: status === 'success' ? 'delivered' : 'failed',
        } as any);
      }

      // 记录状态更新
      for (const statusUpdate of statuses) {
        await MessageLog.create({
          website_id: websiteId,
          message_id: statusUpdate.id,
          direction: 'outbound',
          status: statusUpdate.status,
        } as any);
      }
    } catch (error) {
      console.error('Error logging webhook delivery:', error);
    }
  }

  /**
   * 获取 webhook 转发统计
   */
  async getWebhookStats(websiteId: string, days: number = 7): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await MessageLog.findAll({
      where: {
        website_id: websiteId,
        created_at: {
          [Op.gte]: startDate,
        },
      },
    });

    const stats = {
      total: logs.length,
      success: logs.filter(log => log.status === 'delivered' || log.status === 'read').length,
      failed: logs.filter(log => log.status === 'failed').length,
      byDay: {} as Record<string, { success: number; failed: number }>,
    };

    // 按天统计
    logs.forEach(log => {
      const day = log.created_at.toISOString().split('T')[0];
      if (!stats.byDay[day]) {
        stats.byDay[day] = { success: 0, failed: 0 };
      }
      if (log.status === 'delivered' || log.status === 'read') {
        stats.byDay[day].success++;
      } else {
        stats.byDay[day].failed++;
      }
    });

    return stats;
  }
}

export default new WebhookDistributorService();
