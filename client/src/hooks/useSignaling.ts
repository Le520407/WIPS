import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface User {
  userId: string;
  userName?: string;
}

interface IncomingCall {
  from: string;
  fromName?: string;
  signal: any;
}

interface UseSignalingOptions {
  userId: string;
  userName?: string;
  onIncomingCall?: (call: IncomingCall) => void;
  onCallAccepted?: (data: { from: string; signal: any }) => void;
  onCallRejected?: (data: { from: string }) => void;
  onCallEnded?: (data: { from: string }) => void;
  onUserOnline?: (user: User) => void;
  onUserOffline?: (data: { userId: string }) => void;
  onIceCandidate?: (data: { from: string; candidate: any }) => void;
}

export const useSignaling = (options: UseSignalingOptions) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const socketRef = useRef<Socket | null>(null);

  // Connect to signaling server
  useEffect(() => {
    const serverUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3002';
    
    const newSocket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Connection events
    newSocket.on('connect', () => {
      console.log('🔌 Connected to signaling server');
      setIsConnected(true);
      
      // Register user
      newSocket.emit('register', {
        userId: options.userId,
        userName: options.userName,
      });
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Disconnected from signaling server');
      setIsConnected(false);
    });

    newSocket.on('registered', (data: { userId: string; onlineUsers: User[] }) => {
      console.log('✅ Registered on signaling server:', data.userId);
      setOnlineUsers(data.onlineUsers);
    });

    // Call events
    newSocket.on('incoming-call', (data: IncomingCall) => {
      console.log('📞 Incoming call from:', data.from);
      options.onIncomingCall?.(data);
    });

    newSocket.on('call-accepted', (data: { from: string; signal: any }) => {
      console.log('✅ Call accepted by:', data.from);
      options.onCallAccepted?.(data);
    });

    newSocket.on('call-rejected', (data: { from: string }) => {
      console.log('❌ Call rejected by:', data.from);
      options.onCallRejected?.(data);
    });

    newSocket.on('call-ended', (data: { from: string }) => {
      console.log('🔚 Call ended by:', data.from);
      options.onCallEnded?.(data);
    });

    // ICE candidate
    newSocket.on('ice-candidate', (data: { from: string; candidate: any }) => {
      console.log('🧊 ICE candidate from:', data.from);
      options.onIceCandidate?.(data);
    });

    // User presence
    newSocket.on('user-online', (user: User) => {
      console.log('👤 User online:', user.userId);
      setOnlineUsers(prev => [...prev, user]);
      options.onUserOnline?.(user);
    });

    newSocket.on('user-offline', (data: { userId: string }) => {
      console.log('👤 User offline:', data.userId);
      setOnlineUsers(prev => prev.filter(u => u.userId !== data.userId));
      options.onUserOffline?.(data);
    });

    // Error handling
    newSocket.on('error', (error: { message: string }) => {
      console.error('❌ Signaling error:', error.message);
    });

    // Cleanup
    return () => {
      newSocket.close();
      socketRef.current = null;
    };
  }, [options.userId, options.userName]);

  // Call user
  const callUser = useCallback((targetUserId: string, signal: any) => {
    if (!socket || !isConnected) {
      console.error('❌ Not connected to signaling server');
      return false;
    }

    console.log('📞 Calling user:', targetUserId);
    socket.emit('call-user', { to: targetUserId, signal });
    return true;
  }, [socket, isConnected]);

  // Answer call
  const answerCall = useCallback((targetUserId: string, signal: any) => {
    if (!socket || !isConnected) {
      console.error('❌ Not connected to signaling server');
      return false;
    }

    console.log('✅ Answering call from:', targetUserId);
    socket.emit('answer-call', { to: targetUserId, signal });
    return true;
  }, [socket, isConnected]);

  // Reject call
  const rejectCall = useCallback((targetUserId: string) => {
    if (!socket || !isConnected) {
      console.error('❌ Not connected to signaling server');
      return false;
    }

    console.log('❌ Rejecting call from:', targetUserId);
    socket.emit('reject-call', { to: targetUserId });
    return true;
  }, [socket, isConnected]);

  // End call
  const endCall = useCallback((targetUserId: string) => {
    if (!socket || !isConnected) {
      console.error('❌ Not connected to signaling server');
      return false;
    }

    console.log('🔚 Ending call with:', targetUserId);
    socket.emit('end-call', { to: targetUserId });
    return true;
  }, [socket, isConnected]);

  // Send ICE candidate
  const sendIceCandidate = useCallback((targetUserId: string, candidate: any) => {
    if (!socket || !isConnected) {
      console.error('❌ Not connected to signaling server');
      return false;
    }

    socket.emit('ice-candidate', { to: targetUserId, candidate });
    return true;
  }, [socket, isConnected]);

  return {
    socket,
    isConnected,
    onlineUsers,
    callUser,
    answerCall,
    rejectCall,
    endCall,
    sendIceCandidate,
  };
};
