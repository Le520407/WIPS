import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// 临时移除 StrictMode 以修复 WebRTC 双重挂载问题
// TODO: 在 useWhatsAppWebRTC 中添加 useRef 防护后可以恢复
ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
);
