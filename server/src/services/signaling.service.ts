import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

interface User {
  socketId: string;
  userId: string;
  userName?: string;
}

interface CallOffer {
  from: string;
  to: string;
  signal: any;
}

class SignalingService {
  private io: SocketIOServer | null = null;
  private users: Map<string, User> = new Map(); // userId -> User
  private socketToUser: Map<string, string> = new Map(); // socketId -> userId

  initialize(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    this.io.on('connection', (socket) => {
      console.log('🔌 WebRTC client connected:', socket.id);

      // User registration
      socket.on('register', (data: { userId: string; userName?: string }) => {
        const user: User = {
          socketId: socket.id,
          userId: data.userId,
          userName: data.userName,
        };

        this.users.set(data.userId, user);
        this.socketToUser.set(socket.id, data.userId);

        console.log(`✅ User registered: ${data.userId} (${data.userName || 'Unknown'})`);
        console.log(`   Total users online: ${this.users.size}`);

        // Notify user of successful registration
        socket.emit('registered', {
          userId: data.userId,
          onlineUsers: Array.from(this.users.values()).map(u => ({
            userId: u.userId,
            userName: u.userName,
          })),
        });

        // Notify other users
        socket.broadcast.emit('user-online', {
          userId: data.userId,
          userName: data.userName,
        });
      });

      // Call initiation
      socket.on('call-user', (data: { to: string; signal: any }) => {
        const fromUserId = this.socketToUser.get(socket.id);
        if (!fromUserId) {
          socket.emit('error', { message: 'Not registered' });
          return;
        }

        const toUser = this.users.get(data.to);
        if (!toUser) {
          socket.emit('error', { message: 'User not found or offline' });
          return;
        }

        console.log(`📞 Call from ${fromUserId} to ${data.to}`);

        // Forward call offer to target user
        this.io?.to(toUser.socketId).emit('incoming-call', {
          from: fromUserId,
          fromName: this.users.get(fromUserId)?.userName,
          signal: data.signal,
        });
      });

      // Call answer
      socket.on('answer-call', (data: { to: string; signal: any }) => {
        const fromUserId = this.socketToUser.get(socket.id);
        if (!fromUserId) {
          socket.emit('error', { message: 'Not registered' });
          return;
        }

        const toUser = this.users.get(data.to);
        if (!toUser) {
          socket.emit('error', { message: 'User not found' });
          return;
        }

        console.log(`✅ Call answered: ${fromUserId} -> ${data.to}`);

        // Forward answer to caller
        this.io?.to(toUser.socketId).emit('call-accepted', {
          from: fromUserId,
          signal: data.signal,
        });
      });

      // Call rejection
      socket.on('reject-call', (data: { to: string }) => {
        const fromUserId = this.socketToUser.get(socket.id);
        if (!fromUserId) return;

        const toUser = this.users.get(data.to);
        if (!toUser) return;

        console.log(`❌ Call rejected: ${fromUserId} -> ${data.to}`);

        this.io?.to(toUser.socketId).emit('call-rejected', {
          from: fromUserId,
        });
      });

      // Call end
      socket.on('end-call', (data: { to: string }) => {
        const fromUserId = this.socketToUser.get(socket.id);
        if (!fromUserId) return;

        const toUser = this.users.get(data.to);
        if (toUser) {
          console.log(`🔚 Call ended: ${fromUserId} -> ${data.to}`);
          this.io?.to(toUser.socketId).emit('call-ended', {
            from: fromUserId,
          });
        }
      });

      // ICE candidate exchange
      socket.on('ice-candidate', (data: { to: string; candidate: any }) => {
        const toUser = this.users.get(data.to);
        if (toUser) {
          this.io?.to(toUser.socketId).emit('ice-candidate', {
            from: this.socketToUser.get(socket.id),
            candidate: data.candidate,
          });
        }
      });

      // Disconnect
      socket.on('disconnect', () => {
        const userId = this.socketToUser.get(socket.id);
        if (userId) {
          console.log(`🔌 User disconnected: ${userId}`);
          this.users.delete(userId);
          this.socketToUser.delete(socket.id);

          // Notify other users
          socket.broadcast.emit('user-offline', { userId });
        }
        console.log(`   Total users online: ${this.users.size}`);
      });
    });

    console.log('🚀 WebRTC Signaling Server initialized');
  }

  // Get online users
  getOnlineUsers(): User[] {
    return Array.from(this.users.values());
  }

  // Check if user is online
  isUserOnline(userId: string): boolean {
    return this.users.has(userId);
  }

  // Send notification to specific user
  sendToUser(userId: string, event: string, data: any) {
    const user = this.users.get(userId);
    if (user && this.io) {
      this.io.to(user.socketId).emit(event, data);
      return true;
    }
    return false;
  }
}

// Singleton instance
const signalingService = new SignalingService();

export default signalingService;
