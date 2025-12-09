import { Response } from 'express';

interface Client {
  id: string;
  userId: number;
  response: Response;
}

class NotificationService {
  private clients: Map<number, Client[]> = new Map();

  // Add a client connection
  addClient(userId: number, clientId: string, response: Response) {
    const client: Client = { id: clientId, userId, response };

    if (!this.clients.has(userId)) {
      this.clients.set(userId, []);
    }

    this.clients.get(userId)!.push(client);

    console.log(`📡 Client connected: User ${userId}, Client ${clientId}`);
    console.log(`   Total clients for user: ${this.clients.get(userId)!.length}`);

    // Send initial connection message
    this.sendToClient(client, {
      type: 'connected',
      message: 'Connected to notification service',
      timestamp: new Date().toISOString(),
    });

    // Setup heartbeat to keep connection alive
    const heartbeat = setInterval(() => {
      if (response.writableEnded) {
        clearInterval(heartbeat);
        return;
      }
      this.sendToClient(client, {
        type: 'heartbeat',
        timestamp: new Date().toISOString(),
      });
    }, 30000); // Every 30 seconds

    // Handle client disconnect
    response.on('close', () => {
      clearInterval(heartbeat);
      this.removeClient(userId, clientId);
    });
  }

  // Remove a client connection
  removeClient(userId: number, clientId: string) {
    const userClients = this.clients.get(userId);
    if (userClients) {
      const index = userClients.findIndex((c) => c.id === clientId);
      if (index !== -1) {
        userClients.splice(index, 1);
        console.log(`📡 Client disconnected: User ${userId}, Client ${clientId}`);
        console.log(`   Remaining clients for user: ${userClients.length}`);

        if (userClients.length === 0) {
          this.clients.delete(userId);
        }
      }
    }
  }

  // Send notification to a specific client
  private sendToClient(client: Client, data: any) {
    try {
      if (!client.response.writableEnded) {
        client.response.write(`data: ${JSON.stringify(data)}\n\n`);
      }
    } catch (error) {
      console.error('Error sending to client:', error);
    }
  }

  // Send notification to all clients of a user
  sendToUser(userId: number, data: any) {
    const userClients = this.clients.get(userId);
    if (userClients && userClients.length > 0) {
      console.log(`📤 Sending notification to user ${userId} (${userClients.length} clients)`);
      userClients.forEach((client) => {
        this.sendToClient(client, data);
      });
      return true;
    }
    console.log(`⚠️  No connected clients for user ${userId}`);
    return false;
  }

  // Send incoming call notification
  sendIncomingCall(userId: number, callData: any) {
    return this.sendToUser(userId, {
      type: 'incoming_call',
      data: callData,
      timestamp: new Date().toISOString(),
    });
  }

  // Send call status update
  sendCallStatusUpdate(userId: number, callId: number, status: string, details?: any) {
    return this.sendToUser(userId, {
      type: 'call_status_update',
      data: {
        call_id: callId,
        status,
        ...details,
      },
      timestamp: new Date().toISOString(),
    });
  }

  // Send permission update notification
  sendPermissionUpdate(userId: number, permissionData: any) {
    return this.sendToUser(userId, {
      type: 'permission_update',
      data: permissionData,
      timestamp: new Date().toISOString(),
    });
  }

  // Send general notification
  sendNotification(userId: number, type: string, data: any) {
    return this.sendToUser(userId, {
      type,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  // Get connection stats
  getStats() {
    const stats = {
      totalUsers: this.clients.size,
      totalClients: 0,
      users: [] as any[],
    };

    this.clients.forEach((clients, userId) => {
      stats.totalClients += clients.length;
      stats.users.push({
        userId,
        clientCount: clients.length,
      });
    });

    return stats;
  }
}

// Singleton instance
const notificationService = new NotificationService();

export default notificationService;
