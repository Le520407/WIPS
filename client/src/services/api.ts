import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Demo 模式拦截器
api.interceptors.response.use(
  response => response,
  error => {
    const isDemoMode = localStorage.getItem('demo_mode') === 'true';
    
    if (isDemoMode && error.response?.status === 401) {
      // Demo 模式下，返回模拟数据而不是错误
      console.log('Demo mode: Intercepted API error', error.config.url);
      return Promise.resolve({ data: getDemoData(error.config.url) });
    }
    
    return Promise.reject(error);
  }
);

// 获取模拟数据
function getDemoData(url: string) {
  if (url?.includes('/dashboard/stats')) {
    return {
      stats: {
        totalMessages: 156,
        totalConversations: 23,
        activeConversations: 8,
        templatesCount: 5,
        messagesThisWeek: 45,
        messagesThisMonth: 156
      }
    };
  }
  
  if (url?.includes('/messages/conversations')) {
    return {
      conversations: [
        {
          id: '1',
          phoneNumber: '+86 138 0013 8000',
          lastMessage: '你好，我想咨询一下产品信息',
          lastMessageTime: new Date().toISOString(),
          unreadCount: 2
        },
        {
          id: '2',
          phoneNumber: '+86 139 0013 9000',
          lastMessage: '订单已收到，谢谢！',
          lastMessageTime: new Date(Date.now() - 3600000).toISOString(),
          unreadCount: 0
        },
        {
          id: '3',
          phoneNumber: '+86 150 0015 0000',
          lastMessage: '什么时候可以发货？',
          lastMessageTime: new Date(Date.now() - 7200000).toISOString(),
          unreadCount: 1
        }
      ]
    };
  }
  
  if (url?.includes('/templates')) {
    return {
      templates: [
        {
          id: '1',
          name: 'welcome_message',
          language: 'zh_CN',
          category: 'MARKETING',
          status: 'APPROVED',
          components: [
            { type: 'BODY', text: '欢迎使用我们的服务！' }
          ]
        },
        {
          id: '2',
          name: 'order_confirmation',
          language: 'zh_CN',
          category: 'UTILITY',
          status: 'APPROVED',
          components: [
            { type: 'BODY', text: '您的订单已确认，订单号：{{1}}' }
          ]
        },
        {
          id: '3',
          name: 'shipping_update',
          language: 'zh_CN',
          category: 'UTILITY',
          status: 'PENDING',
          components: [
            { type: 'BODY', text: '您的包裹已发货，快递单号：{{1}}' }
          ]
        }
      ]
    };
  }
  
  if (url?.includes('/messages')) {
    return { messages: [] };
  }
  
  return {};
}

export const authService = {
  facebookLogin: (accessToken: string) => 
    api.post('/auth/facebook', { accessToken }).then(res => res.data),
  getCurrentUser: () => 
    api.get('/auth/me').then(res => res.data)
};

export const messageService = {
  getMessages: (conversationId?: string) => 
    api.get('/messages', { params: { conversationId } }).then(res => res.data),
  sendMessage: (to: string, message: string, type?: string, mediaUrl?: string, caption?: string) => 
    api.post('/messages/send', { to, message, type, mediaUrl, caption }).then(res => res.data),
  getConversations: () => 
    api.get('/messages/conversations').then(res => res.data),
  markConversationAsRead: (conversationId: string) =>
    api.post(`/messages/conversations/${conversationId}/read`).then(res => res.data),
  uploadMedia: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/messages/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data);
  },
  sendMediaMessage: (to: string, mediaId: string, type: string, caption?: string, filename?: string) =>
    api.post('/messages/send-media', { to, mediaId, type, caption, filename }).then(res => res.data),
  getMediaUrl: (mediaId: string) =>
    api.get(`/messages/media/${mediaId}`).then(res => res.data),
  sendInteractiveButtons: (to: string, bodyText: string, buttons: Array<{id: string, title: string}>) =>
    api.post('/messages/send-buttons', { to, bodyText, buttons }).then(res => res.data),
  sendInteractiveList: (to: string, bodyText: string, buttonText: string, sections: Array<{
    title: string,
    rows: Array<{id: string, title: string, description?: string}>
  }>) =>
    api.post('/messages/send-list', { to, bodyText, buttonText, sections }).then(res => res.data),
  sendInteractiveCTA: (to: string, bodyText: string, buttonText: string, url: string) =>
    api.post('/messages/send-cta', { to, bodyText, buttonText, url }).then(res => res.data),
  sendLocation: (to: string, latitude: number, longitude: number, name?: string, address?: string) =>
    api.post('/messages/send-location', { to, latitude, longitude, name, address }).then(res => res.data),
  sendContact: (to: string, contacts: Array<any>) =>
    api.post('/messages/send-contact', { to, contacts }).then(res => res.data),
  sendReaction: (to: string, messageId: string, emoji: string) =>
    api.post('/messages/send-reaction', { to, messageId, emoji }).then(res => res.data),
  sendReply: (to: string, message: string, contextMessageId: string) =>
    api.post('/messages/send-reply', { to, message, contextMessageId }).then(res => res.data),
  sendSticker: (to: string, mediaId?: string, stickerUrl?: string) =>
    api.post('/messages/send-sticker', { to, mediaId, stickerUrl }).then(res => res.data),
  markAsRead: (messageId: string) =>
    api.post('/messages/mark-as-read', { messageId }).then(res => res.data)
};

export const templateService = {
  getTemplates: () => 
    api.get('/templates').then(res => res.data),
  createTemplate: (template: any) => 
    api.post('/templates', template).then(res => res.data),
  updateTemplate: (id: string, template: any) => 
    api.put(`/templates/${id}`, template).then(res => res.data),
  deleteTemplate: (id: string) => 
    api.delete(`/templates/${id}`).then(res => res.data)
};

export const dashboardService = {
  getStats: () => 
    api.get('/dashboard/stats').then(res => res.data)
};

export default api;
