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
import signalingService from './services/signaling.service';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3001;

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
app.use('/api/webhooks', webhookConfigRoutes);
app.use('/webhooks', webhookRoutes);

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

    // Sync models
    await sequelize.sync({ alter: true });
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
