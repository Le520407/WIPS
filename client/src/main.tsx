import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Temporarily removed StrictMode to fix WebRTC double mount issue
// TODO: Can restore after adding useRef protection in useWhatsAppWebRTC
ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
);
