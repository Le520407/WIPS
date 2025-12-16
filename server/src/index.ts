import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import sequelize from './config/database';
import authRoutes from './routes/auth.routes';
import messageRoutes from './routes/message.routes';
import templateRoutes from './routes/template.routes';
import webhookRoutes from './routes/webhook.routes';
import webhookConfigRoutes from './routes/webhook-config.routes';
import callRoutes from './routes/call.routes';
import callSettingsRoutes from './routes/call-settings.routes';
import callPermissionRoutes from './routes/call-permission.routes';
import notificationRoutes from './routes/notification.routes';
import callQualityRoutes from './routes/call-quality.routes';
import missedCallRoutes from './routes/missed-call.routes';
import callLimitRoutes from './routes/call-limit.routes';
import callButtonRoutes from './routes/call-button.routes';
import callAnalyticsRoutes from './routes/call-analytics.routes';
import dashboardRoutes from './routes/dashboard.routes';
import sipRoutes from './routes/sip.routes';
import groupsRoutes from './routes/groups.routes';
import websiteRoutes from './routes/website.routes';
import publicApiRoutes from './routes/public-api.routes';
import usageStatsRoutes from './routes/usage-stats.routes';
import businessProfileRoutes from './routes/business-profile.routes';
import contactRoutes from './routes/contact.routes';
import autoReplyRoutes from './routes/auto-reply.routes';
import commerceRoutes from './routes/commerce.routes';
import orderRoutes from './routes/order.routes';
import marketingRoutes from './routes/marketing.routes';
import adminRoutes from './routes/admin.routes';
import conversationalComponentsRoutes from './routes/conversational-components.routes';
import blockUsersRoutes from './routes/block-users.routes';
import authTemplateRoutes from './routes/auth-template.routes';
import phoneNumberRoutes from './routes/phone-number.routes';
import twoStepVerificationRoutes from './routes/two-step-verification.routes';
import phoneRegistrationRoutes from './routes/phone-registration.routes';
import signalingService from './services/signaling.service';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3299;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/call-settings', callSettingsRoutes);
app.use('/api/call', callPermissionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/call/quality', callQualityRoutes);
app.use('/api/call/limits', callLimitRoutes);
app.use('/api/call/button', callButtonRoutes);
app.use('/api/call/analytics', callAnalyticsRoutes);
app.use('/api/missed-calls', missedCallRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/sip', sipRoutes);
app.use('/api/groups', groupsRoutes);
app.use('/api/business-profile', businessProfileRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/auto-reply', autoReplyRoutes);
app.use('/api/commerce', commerceRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/marketing', marketingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/conversational-components', conversationalComponentsRoutes);
app.use('/api/block-users', blockUsersRoutes);
app.use('/api/auth-templates', authTemplateRoutes);
app.use('/api/phone-number', phoneNumberRoutes);
app.use('/api/two-step-verification', twoStepVerificationRoutes);
app.use('/api/phone-registration', phoneRegistrationRoutes);
app.use('/api', websiteRoutes);
app.use('/api/webhooks', webhookConfigRoutes);
app.use('/webhooks', webhookRoutes);
// Public API routes (requires API key authentication)
app.use('/api/v1', publicApiRoutes);
// Usage statistics routes
app.use('/api/stats', usageStatsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize database and start server
async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');

    // Sync models (no alter to avoid conflicts)
    await sequelize.sync({ alter: false });
    console.log('✅ Database models synced');

    // Initialize WebRTC signaling service
    signalingService.initialize(httpServer);

    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 WhatsApp Platform API ready`);
      console.log(`🎥 WebRTC Signaling Server ready`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown handling
process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down gracefully...');
  
  try {
    // Close HTTP server
    httpServer.close(() => {
      console.log('✅ HTTP server closed');
    });
    
    // Close database connection
    await sequelize.close();
    console.log('✅ Database connection closed');
    
    console.log('👋 Goodbye!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('\n👋 Received SIGTERM, shutting down...');
  
  try {
    httpServer.close(() => {
      console.log('✅ HTTP server closed');
    });
    
    await sequelize.close();
    console.log('✅ Database connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});
