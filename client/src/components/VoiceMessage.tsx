import { useState, useRef, useEffect } from 'react';

interface VoiceMessageProps {
  mediaUrl?: string;
  mediaId?: string;
  duration?: number;
  isSent: boolean;
}

export const VoiceMessage = ({ mediaUrl, mediaId, duration, isSent }: VoiceMessageProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration || 0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Format time display (seconds -> MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Load audio metadata
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener('loadedmetadata', () => {
        if (audioRef.current) {
          setAudioDuration(audioRef.current.duration);
        }
      });

      audioRef.current.addEventListener('timeupdate', () => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
        }
      });

      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentTime(0);
      });
    }
  }, []);

  const togglePlay = async () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error('Playback failed:', error);
      }
    }
  };

  // Get audio URL
  const getAudioUrl = () => {
    if (mediaUrl) return mediaUrl;
    if (mediaId) return `/api/messages/media/${mediaId}`;
    return '';
  };

  const audioUrl = getAudioUrl();
  const displayTime = isPlaying ? formatTime(currentTime) : formatTime(audioDuration);
  const progress = audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0;

  // Debug log
  console.log('🎤 VoiceMessage render:', {
    mediaUrl,
    mediaId,
    audioUrl,
    isSent,
    duration: audioDuration
  });

  // If no audio URL, show loading/error state
  if (!audioUrl) {
    return (
      <div className="flex items-center gap-2 p-2 min-w-[200px]">
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          isSent ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
        }`}>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 3a3 3 0 00-3 3v4a3 3 0 006 0V6a3 3 0 00-3-3z" />
            <path d="M5 10a1 1 0 011 1 4 4 0 008 0 1 1 0 112 0 6 6 0 01-5 5.917V18h2a1 1 0 110 2H7a1 1 0 110-2h2v-1.083A6 6 0 014 11a1 1 0 011-1z" />
          </svg>
        </div>
        <div className="flex-1">
          <p className={`text-xs ${isSent ? 'text-white/70' : 'text-gray-500'}`}>
            Voice message (loading...)
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 p-2 min-w-[200px]">
      {/* Hidden audio element */}
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Play/Pause button */}
      <button
        onClick={togglePlay}
        disabled={!audioUrl}
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
          isSent 
            ? 'bg-white/20 hover:bg-white/30 text-white' 
            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
        } ${!audioUrl ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isPlaying ? (
          // Pause icon
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6 4h2v12H6V4zm6 0h2v12h-2V4z" />
          </svg>
        ) : (
          // Play icon
          <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6 4l10 6-10 6V4z" />
          </svg>
        )}
      </button>

      {/* Waveform and duration */}
      <div className="flex-1 min-w-0">
        {/* Simplified waveform (progress bar) */}
        <div className={`relative h-1 rounded-full overflow-hidden mb-1 ${
          isSent ? 'bg-white/30' : 'bg-gray-300'
        }`}>
          <div 
            className={`absolute left-0 top-0 h-full transition-all ${
              isSent ? 'bg-white' : 'bg-blue-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Duration display */}
        <div className={`flex items-center gap-1 text-xs ${
          isSent ? 'text-white/90' : 'text-gray-600'
        }`}>
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" />
          </svg>
          <span className="font-mono">{displayTime}</span>
        </div>
      </div>

      {/* Microphone icon */}
      <div className={`flex-shrink-0 ${isSent ? 'text-white/80' : 'text-gray-400'}`}>
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 3a3 3 0 00-3 3v4a3 3 0 006 0V6a3 3 0 00-3-3z" />
          <path d="M5 10a1 1 0 011 1 4 4 0 008 0 1 1 0 112 0 6 6 0 01-5 5.917V18h2a1 1 0 110 2H7a1 1 0 110-2h2v-1.083A6 6 0 014 11a1 1 0 011-1z" />
        </svg>
      </div>
    </div>
  );
};
