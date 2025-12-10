import { useState, useRef } from 'react';

interface VoiceRecorderProps {
  onRecordingComplete: (file: File) => void;
  onCancel: () => void;
}

export const VoiceRecorder = ({ onRecordingComplete, onCancel }: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showUpload, setShowUpload] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Use WebM format (Chrome's native format)
      // Server will convert to OGG
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const webmBlob = new Blob(chunksRef.current, { type: mimeType });
        stream.getTracks().forEach(track => track.stop());
        
        // Create file from blob
        const file = new File([webmBlob], `voice_${Date.now()}.webm`, { type: mimeType });
        
        console.log('🎤 Recording complete:', {
          size: file.size,
          type: file.type,
          name: file.name,
          sizeKB: (file.size / 1024).toFixed(2) + ' KB'
        });
        
        // Check file size
        if (file.size > 16 * 1024 * 1024) {
          alert('录音文件过大（超过 16MB）。请录制较短的消息。');
          return;
        }
        
        // Pass to parent - server will convert to OGG
        onRecordingComplete(file);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('无法访问麦克风。请确保已授予麦克风权限。');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingTime(0);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      chunksRef.current = [];
    }
    onCancel();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (showUpload) {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <svg className="w-16 h-16 mx-auto text-blue-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p className="text-gray-700 font-medium mb-2">上传语音消息</p>
        <p className="text-sm text-gray-500 mb-6">
          或者选择已录制好的音频文件
        </p>
        
        <input
          type="file"
          id="voice-upload"
          accept="audio/ogg,audio/mpeg,audio/mp4,audio/aac,audio/m4a,audio/webm"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              if (file.size > 16 * 1024 * 1024) {
                alert('文件过大！最大支持 16 MB');
                return;
              }
              console.log('📁 Voice file selected:', {
                name: file.name,
                type: file.type,
                size: file.size
              });
              onRecordingComplete(file);
            }
          }}
          className="hidden"
        />
        <label
          htmlFor="voice-upload"
          className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer transition-colors font-medium"
        >
          📁 选择音频文件
        </label>
        
        <div className="mt-4">
          <button
            onClick={() => setShowUpload(false)}
            className="text-sm text-blue-600 hover:text-blue-700 underline"
          >
            ← 返回录音
          </button>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-600 font-medium mb-2">支持的格式：</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">OGG</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">MP3</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">M4A</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">AAC</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">WebM</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isRecording) {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <svg className="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
        <p className="text-gray-600 mb-4">录制语音消息</p>
        <button
          onClick={startRecording}
          className="px-6 py-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center gap-2 mx-auto"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <circle cx="10" cy="10" r="8" />
          </svg>
          开始录音
        </button>
        <p className="text-xs text-gray-400 mt-3">
          录音将在服务器自动转换为 WhatsApp 兼容格式
        </p>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={() => setShowUpload(true)}
            className="text-sm text-blue-600 hover:text-blue-700 underline"
          >
            或者上传音频文件 →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
      <div className="w-16 h-16 mx-auto mb-4 relative">
        <div className="absolute inset-0 bg-red-500 rounded-full animate-pulse"></div>
        <svg className="w-16 h-16 relative z-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      </div>
      <p className="text-2xl font-mono text-red-600 mb-4">{formatTime(recordingTime)}</p>
      <p className="text-gray-600 mb-4">正在录音...</p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={cancelRecording}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          取消
        </button>
        <button
          onClick={stopRecording}
          className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <rect x="6" y="6" width="8" height="8" />
          </svg>
          完成
        </button>
      </div>
    </div>
  );
};
