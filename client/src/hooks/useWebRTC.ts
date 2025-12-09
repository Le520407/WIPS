import { useEffect, useRef, useState, useCallback } from 'react';
import SimplePeer from 'simple-peer';

interface UseWebRTCOptions {
  onStream?: (stream: MediaStream) => void;
  onError?: (error: Error) => void;
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
  audio?: boolean;
  video?: boolean;
}

export const useWebRTC = (options: UseWebRTCOptions = {}) => {
  const {
    onStream,
    onError,
    onConnectionStateChange,
    audio = true,
    video = false,
  } = options;

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [peer, setPeer] = useState<SimplePeer.Instance | null>(null);
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>('new');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(video);

  const peerRef = useRef<SimplePeer.Instance | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Get user media
  const getUserMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: audio,
        video: video,
      });

      console.log('🎤 Got local media stream');
      setLocalStream(stream);
      localStreamRef.current = stream;
      return stream;
    } catch (error) {
      console.error('❌ Failed to get user media:', error);
      onError?.(error as Error);
      throw error;
    }
  }, [audio, video, onError]);

  // Create peer connection (initiator)
  const createPeer = useCallback(async (initiator: boolean = true) => {
    try {
      // Get local stream if not already available
      let stream = localStreamRef.current;
      if (!stream) {
        stream = await getUserMedia();
      }

      // STUN servers for NAT traversal
      const config: SimplePeer.Options = {
        initiator,
        trickle: true,
        stream,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
          ],
        },
      };

      const newPeer = new SimplePeer(config);
      peerRef.current = newPeer;
      setPeer(newPeer);

      // Handle peer events
      newPeer.on('signal', (signal) => {
        console.log('📡 Peer signal generated');
        // This will be handled by the parent component
      });

      newPeer.on('stream', (remoteStream) => {
        console.log('🎥 Received remote stream');
        setRemoteStream(remoteStream);
        onStream?.(remoteStream);
      });

      newPeer.on('connect', () => {
        console.log('✅ Peer connected');
        setConnectionState('connected');
      });

      newPeer.on('close', () => {
        console.log('🔚 Peer connection closed');
        setConnectionState('closed');
      });

      newPeer.on('error', (error) => {
        console.error('❌ Peer error:', error);
        setConnectionState('failed');
        onError?.(error);
      });

      // Monitor connection state
      if (newPeer._pc) {
        newPeer._pc.onconnectionstatechange = () => {
          const state = newPeer._pc?.connectionState || 'new';
          console.log('🔄 Connection state:', state);
          setConnectionState(state);
          onConnectionStateChange?.(state);
        };
      }

      return newPeer;
    } catch (error) {
      console.error('❌ Failed to create peer:', error);
      onError?.(error as Error);
      throw error;
    }
  }, [getUserMedia, onStream, onError, onConnectionStateChange]);

  // Signal peer (for answering)
  const signalPeer = useCallback((signal: SimplePeer.SignalData) => {
    if (!peerRef.current) {
      console.error('❌ No peer connection available');
      return false;
    }

    try {
      console.log('📡 Signaling peer');
      peerRef.current.signal(signal);
      return true;
    } catch (error) {
      console.error('❌ Failed to signal peer:', error);
      onError?.(error as Error);
      return false;
    }
  }, [onError]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (!localStreamRef.current) return;

    const audioTracks = localStreamRef.current.getAudioTracks();
    audioTracks.forEach(track => {
      track.enabled = !track.enabled;
    });

    setIsMuted(!isMuted);
    console.log(isMuted ? '🔊 Unmuted' : '🔇 Muted');
  }, [isMuted]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (!localStreamRef.current) return;

    const videoTracks = localStreamRef.current.getVideoTracks();
    videoTracks.forEach(track => {
      track.enabled = !track.enabled;
    });

    setIsVideoEnabled(!isVideoEnabled);
    console.log(isVideoEnabled ? '📹 Video disabled' : '📹 Video enabled');
  }, [isVideoEnabled]);

  // Destroy peer connection
  const destroyPeer = useCallback(() => {
    console.log('🔚 Destroying peer connection');

    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    }

    // Destroy peer
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
      setPeer(null);
    }

    // Clear remote stream
    setRemoteStream(null);
    setConnectionState('closed');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      destroyPeer();
    };
  }, []);

  return {
    localStream,
    remoteStream,
    peer,
    connectionState,
    isMuted,
    isVideoEnabled,
    getUserMedia,
    createPeer,
    signalPeer,
    toggleMute,
    toggleVideo,
    destroyPeer,
  };
};
