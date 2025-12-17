import { useState, useRef, useCallback, useEffect } from 'react';
import api from '../services/api';

interface WhatsAppWebRTCConfig {
  callId: string;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (error: Error) => void;
}

export const useWhatsAppWebRTC = ({ callId, onConnected, onDisconnected, onError }: WhatsAppWebRTCConfig) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);

  // WebRTC configuration
  const rtcConfig: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
    ],
  };

  // Get local media stream
  const getLocalStream = useCallback(async () => {
    try {
      console.log('🎤 Requesting microphone access...');
      
      // Enhanced audio constraints with stronger echo cancellation
      const audioConstraints: MediaTrackConstraints = {
        // Standard constraints
        echoCancellation: { ideal: true },
        noiseSuppression: { ideal: true },
        autoGainControl: { ideal: true },
        
        // Chrome/Edge specific constraints (backward compatible)
        // @ts-ignore - Chrome specific constraints
        googEchoCancellation: { ideal: true },
        // @ts-ignore
        googAutoGainControl: { ideal: true },
        // @ts-ignore
        googNoiseSuppression: { ideal: true },
        // @ts-ignore
        googHighpassFilter: { ideal: true },
        // @ts-ignore
        googTypingNoiseDetection: { ideal: true },
        // @ts-ignore
        googAudioMirroring: false,
      };
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: audioConstraints,
        video: false,
      });
      
      localStreamRef.current = stream;
      console.log('✅ Got local stream:', stream.id);
      
      // Verify echo cancellation is enabled
      const track = stream.getAudioTracks()[0];
      const settings = track.getSettings();
      console.log('🔊 Audio settings:', {
        echoCancellation: settings.echoCancellation,
        noiseSuppression: settings.noiseSuppression,
        autoGainControl: settings.autoGainControl,
      });
      
      if (!settings.echoCancellation) {
        console.warn('⚠️ Warning: Echo cancellation not enabled!');
        console.warn('💡 Recommend using headphones');
      } else {
        console.log('✅ Echo cancellation enabled');
      }
      
      console.log('✅ Local audio tracks:', stream.getAudioTracks().map(t => ({
        id: t.id,
        enabled: t.enabled,
        muted: t.muted,
        readyState: t.readyState
      })));
      
      // Debug: Store in window for console access
      (window as any).localStream = stream;
      
      return stream;
    } catch (err) {
      const error = err as Error;
      console.error('❌ Failed to get local stream:', error);
      setError('Failed to access microphone');
      onError?.(error);
      throw error;
    }
  }, [onError]);

  // Create peer connection
  const createPeerConnection = useCallback(() => {
    try {
      console.log('📡 Creating peer connection...');
      const pc = new RTCPeerConnection(rtcConfig);

      // Add local stream tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          pc.addTrack(track, localStreamRef.current!);
          console.log('➕ Added local track:', track.kind);
        });
      }

      // Handle remote stream
      pc.ontrack = (event) => {
        console.log('📥 Received remote track:', event.track.kind);
        console.log('📥 Track details:', {
          id: event.track.id,
          enabled: event.track.enabled,
          muted: event.track.muted,
          readyState: event.track.readyState
        });
        
        // Unmute the track if it's muted
        if (event.track.muted) {
          console.log('⚠️ Track is muted, waiting for unmute...');
          event.track.onunmute = () => {
            console.log('✅ Track unmuted!');
          };
        }
        
        if (!remoteStreamRef.current) {
          remoteStreamRef.current = new MediaStream();
          console.log('📥 Created new remote stream');
        }
        
        remoteStreamRef.current.addTrack(event.track);
        console.log('📥 Remote stream now has', remoteStreamRef.current.getTracks().length, 'tracks');
        
        // Debug: Store in window for console access
        (window as any).remoteStream = remoteStreamRef.current;
        
        // Trigger audio playback immediately
        const audio = document.getElementById('remote-audio') as HTMLAudioElement;
        if (audio && audio.srcObject !== remoteStreamRef.current) {
          console.log('🔊 Setting remote stream to audio element');
          audio.srcObject = remoteStreamRef.current;
          audio.volume = 1.0;
          audio.muted = false;
          audio.play()
            .then(() => console.log('✅ Remote audio started playing'))
            .catch(err => console.error('❌ Failed to play remote audio:', err));
        }
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('🧊 New ICE candidate:', event.candidate.type);
        } else {
          console.log('✅ ICE gathering complete');
        }
      };

      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        console.log('🔄 Connection state:', pc.connectionState);
        console.log('🔄 ICE connection state:', pc.iceConnectionState);
        console.log('🔄 Signaling state:', pc.signalingState);
        
        if (pc.connectionState === 'connected') {
          setIsConnected(true);
          setIsConnecting(false);
          onConnected?.();
        } else if (pc.connectionState === 'disconnected') {
          console.warn('⚠️ Connection disconnected, waiting for reconnection...');
          // Don't immediately disconnect, give it time to reconnect
        } else if (pc.connectionState === 'failed') {
          console.error('❌ Connection failed!');
          console.error('❌ ICE state:', pc.iceConnectionState);
          console.error('❌ Signaling state:', pc.signalingState);
          setIsConnected(false);
          setIsConnecting(false);
          onDisconnected?.();
        }
      };

      // Handle ICE connection state changes
      pc.oniceconnectionstatechange = () => {
        console.log('🧊 ICE connection state:', pc.iceConnectionState);
        
        if (pc.iceConnectionState === 'failed') {
          console.error('❌ ICE connection failed!');
          console.error('❌ This usually means:');
          console.error('   1. Network connectivity issues');
          console.error('   2. Firewall blocking WebRTC');
          console.error('   3. Need TURN server');
        } else if (pc.iceConnectionState === 'disconnected') {
          console.warn('⚠️ ICE disconnected, attempting to reconnect...');
        } else if (pc.iceConnectionState === 'connected') {
          console.log('✅ ICE connected successfully');
        }
      };

      peerConnectionRef.current = pc;
      return pc;
    } catch (err) {
      const error = err as Error;
      console.error('❌ Failed to create peer connection:', error);
      setError('Failed to create connection');
      onError?.(error);
      throw error;
    }
  }, [onConnected, onDisconnected, onError]);

  // Cleanup
  const cleanup = useCallback(() => {
    console.log('🧹 Cleaning up WebRTC resources...');

    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('⏹️ Stopped track:', track.kind);
      });
      localStreamRef.current = null;
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
      console.log('🔌 Closed peer connection');
    }

    // Clear remote stream
    remoteStreamRef.current = null;

    setIsConnected(false);
    setIsConnecting(false);
    setIsMuted(false);
  }, []);

  // Accept WhatsApp call with WebRTC
  const acceptCall = useCallback(async (remoteSdp?: string) => {
    try {
      setIsConnecting(true);
      setError(null);

      console.log('📞 Accepting WhatsApp call with WebRTC...');
      console.log('Call ID:', callId);

      // Step 1: Get local media stream
      await getLocalStream();

      // Step 2: Create peer connection
      const pc = createPeerConnection();

      // Step 3: Set remote description (WhatsApp's SDP offer from webhook)
      if (remoteSdp) {
        console.log('📥 Setting remote description (WhatsApp SDP offer)...');
        console.log('Remote SDP length:', remoteSdp.length);
        await pc.setRemoteDescription({
          type: 'offer',
          sdp: remoteSdp,
        });
      } else {
        console.warn('⚠️ No remote SDP provided - this may cause issues');
      }

      // Step 4: Create SDP answer
      console.log('📝 Creating SDP answer...');
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // Wait for ICE gathering to complete
      await new Promise<void>((resolve) => {
        if (pc.iceGatheringState === 'complete') {
          resolve();
        } else {
          pc.onicegatheringstatechange = () => {
            if (pc.iceGatheringState === 'complete') {
              resolve();
            }
          };
        }
      });

      const sdp = pc.localDescription?.sdp;
      if (!sdp) {
        throw new Error('Failed to generate SDP');
      }

      console.log('📤 Sending SDP answer to WhatsApp API...');
      console.log('SDP type:', pc.localDescription?.type);
      console.log('SDP length:', sdp.length);

      // Step 5: Send SDP answer to WhatsApp API
      const response = await api.post('/calls/accept', {
        call_id: callId,
        session: {
          sdp_type: 'answer',
          sdp: sdp,
        },
      });

      console.log('✅ WhatsApp API response:', response.data);
      console.log('✅ Call accepted successfully');
      
      // Ensure we're sending media by checking local tracks
      if (localStreamRef.current) {
        const audioTracks = localStreamRef.current.getAudioTracks();
        audioTracks.forEach(track => {
          console.log('📤 Local track status:', {
            id: track.id,
            enabled: track.enabled,
            muted: track.muted,
            readyState: track.readyState
          });
          // Ensure track is enabled
          track.enabled = true;
        });
      }
      
      // Verify senders are actually sending
      const senders = pc.getSenders();
      console.log('📤 Checking senders:', senders.length);
      senders.forEach((sender, i) => {
        if (sender.track) {
          console.log(`📤 Sender ${i}:`, {
            kind: sender.track.kind,
            enabled: sender.track.enabled,
            muted: sender.track.muted,
            readyState: sender.track.readyState
          });
          
          // Get stats to verify media is flowing
          sender.getStats().then(stats => {
            stats.forEach(report => {
              if (report.type === 'outbound-rtp' && report.kind === 'audio') {
                console.log('📤 Outbound RTP stats:', {
                  packetsSent: report.packetsSent,
                  bytesSent: report.bytesSent,
                  timestamp: report.timestamp
                });
                
                // Check again after 2 seconds to see if packets are increasing
                setTimeout(() => {
                  sender.getStats().then(stats2 => {
                    stats2.forEach(report2 => {
                      if (report2.type === 'outbound-rtp' && report2.kind === 'audio') {
                        const packetsDiff = report2.packetsSent - report.packetsSent;
                        const bytesDiff = report2.bytesSent - report.bytesSent;
                        
                        if (packetsDiff > 0) {
                          console.log('✅ Sending audio packets!', {
                            packetsIncrease: packetsDiff,
                            bytesIncrease: bytesDiff
                          });
                        } else {
                          console.error('❌ Warning: No audio packets being sent!', {
                            packetsSent: report2.packetsSent,
                            bytesSent: report2.bytesSent
                          });
                          console.error('❌ This may cause WhatsApp to disconnect!');
                        }
                      }
                    });
                  });
                }, 2000);
              }
            });
          });
        }
      });
      
      // Expose peer connection for debugging
      (window as any).peerConnection = pc;
      
      return true;
    } catch (err) {
      const error = err as Error;
      console.error('❌ Failed to accept call:', error);
      setError(error.message);
      setIsConnecting(false);
      onError?.(error);
      
      // Cleanup on error
      cleanup();
      return false;
    }
  }, [callId, getLocalStream, createPeerConnection, onError, cleanup]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
      console.log(isMuted ? '🔊 Unmuted' : '🔇 Muted');
    }
  }, [isMuted]);

  // End call
  const endCall = useCallback(async () => {
    try {
      console.log('📞 Ending call...');
      
      // Call terminate API
      await api.post('/calls/terminate', {
        call_id: callId,
      });

      cleanup();
      console.log('✅ Call ended');
    } catch (err) {
      console.error('❌ Failed to end call:', err);
      // Cleanup anyway
      cleanup();
    }
  }, [callId, cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    acceptCall,
    endCall,
    toggleMute,
    isConnecting,
    isConnected,
    isMuted,
    error,
    localStream: localStreamRef.current,
    remoteStream: remoteStreamRef.current,
  };
};
