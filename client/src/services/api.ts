import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

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

// Demo mode interceptor
api.interceptors.response.use(
  response => response,
  error => {
    const isDemoMode = localStorage.getItem('demo_mode') === 'true';
    
    if (isDemoMode && error.response?.status === 401) {
      // In demo mode, return mock data instead of error
      console.log('Demo mode: Intercepted API error', error.config.url);
      return Promise.resolve({ data: getDemoData(error.config.url) });
    }
    
    return Promise.reject(error);
  }
);

// Get mock data
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
          lastMessage: 'Hello, I would like to inquire about product information',
          lastMessageTime: new Date().toISOString(),
          unreadCount: 2
        },
        {
          id: '2',
          phoneNumber: '+86 139 0013 9000',
          lastMessage: 'Order received, thank you!',
          lastMessageTime: new Date(Date.now() - 3600000).toISOString(),
          unreadCount: 0
        },
        {
          id: '3',
          phoneNumber: '+86 150 0015 0000',
          lastMessage: 'When can it be shipped?',
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
          language: 'en_US',
          category: 'MARKETING',
          status: 'APPROVED',
          components: [
            { type: 'BODY', text: 'Welcome to our service!' }
          ]
        },
        {
          id: '2',
          name: 'order_confirmation',
          language: 'en_US',
          category: 'UTILITY',
          status: 'APPROVED',
          components: [
            { type: 'BODY', text: 'Your order has been confirmed, order number: {{1}}' }
          ]
        },
        {
          id: '3',
          name: 'shipping_update',
          language: 'en_US',
          category: 'UTILITY',
          status: 'PENDING',
          components: [
            { type: 'BODY', text: 'Your package has been shipped, tracking number: {{1}}' }
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
  sendMediaMessage: (to: string, mediaId: string, type: string, caption?: string, filename?: string, contextMessageId?: string) =>
    api.post('/messages/send-media', { to, mediaId, type, caption, filename, contextMessageId }).then(res => res.data),
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
  sendSticker: (to: string, mediaId?: string, stickerUrl?: string, contextMessageId?: string) =>
    api.post('/messages/send-sticker', { to, mediaId, stickerUrl, contextMessageId }).then(res => res.data),
  markAsRead: (messageId: string) =>
    api.post('/messages/mark-as-read', { messageId }).then(res => res.data),
  sendTypingIndicator: (to: string, messageId: string) =>
    api.post('/messages/send-typing', { to, messageId }).then(res => res.data),
  requestLocation: (to: string, bodyText: string) =>
    api.post('/messages/request-location', { to, bodyText }).then(res => res.data),
  sendAddress: (to: string, name: string, address: any) =>
    api.post('/messages/send-address', { to, name, address }).then(res => res.data),
  sendMediaCarousel: (to: string, bodyText: string, cards: Array<any>) =>
    api.post('/messages/send-media-carousel', { to, bodyText, cards }).then(res => res.data),
  sendProductCarousel: (to: string, bodyText: string, catalogId: string, products: Array<any>) =>
    api.post('/messages/send-product-carousel', { to, bodyText, catalogId, products }).then(res => res.data)
};

export const templateService = {
  getTemplates: (sync?: boolean) => 
    api.get('/templates', { params: { sync: sync ? 'true' : 'false' } }).then(res => res.data),
  createTemplate: (template: any) => 
    api.post('/templates', template).then(res => res.data),
  updateTemplate: (id: string, template: any) => 
    api.put(`/templates/${id}`, template).then(res => res.data),
  deleteTemplate: (id: string) => 
    api.delete(`/templates/${id}`).then(res => res.data),
  sendTemplate: (to: string, templateName: string, languageCode: string, components?: any[]) =>
    api.post('/templates/send', { to, templateName, languageCode, components }).then(res => res.data),
  
  // Template Groups
  listGroups: () =>
    api.get('/templates/groups').then(res => res.data),
  createGroup: (name: string, description: string, templateIds: number[]) =>
    api.post('/templates/groups', { name, description, templateIds }).then(res => res.data),
  getGroup: (groupId: string) =>
    api.get(`/templates/groups/${groupId}`).then(res => res.data),
  updateGroup: (groupId: string, updates: any) =>
    api.put(`/templates/groups/${groupId}`, updates).then(res => res.data),
  deleteGroup: (groupId: string) =>
    api.delete(`/templates/groups/${groupId}`).then(res => res.data),
  
  // Analytics
  getGroupAnalytics: (groupId: string, startDate?: string, endDate?: string) =>
    api.get(`/templates/groups/${groupId}/analytics`, { params: { startDate, endDate } }).then(res => res.data),
  getTemplateAnalytics: (templateId: string, startDate?: string, endDate?: string) =>
    api.get(`/templates/${templateId}/analytics`, { params: { startDate, endDate } }).then(res => res.data),
  
  // Pausing
  getAllTemplatesPausingStatus: () =>
    api.get('/templates/pausing/all').then(res => res.data),
  checkTemplatePausingStatus: (templateId: string) =>
    api.get(`/templates/${templateId}/pausing`).then(res => res.data),
  
  // Marketing Limits & Tier
  getMessagingLimitTier: () =>
    api.get('/templates/tier/status').then(res => res.data)
};

export const dashboardService = {
  getStats: () => 
    api.get('/dashboard/stats').then(res => res.data)
};

// Export api instance
export { api };

export default api;

export const groupsService = {
  // Create group
  createGroup: (subject: string, description?: string, phoneNumberId?: string) =>
    api.post('/groups', { subject, description, phoneNumberId }).then(res => res.data),
  
  // Get groups list
  getGroups: (phoneNumberId?: string) =>
    api.get('/groups', { params: phoneNumberId ? { phoneNumberId } : {} }).then(res => res.data),
  
  // Get group info
  getGroupInfo: (groupId: string) =>
    api.get(`/groups/${groupId}`).then(res => res.data),
  
  // Update group settings
  updateGroup: (groupId: string, settings: { subject?: string; description?: string; icon?: string }) =>
    api.post(`/groups/${groupId}`, settings).then(res => res.data),
  
  // Delete group
  deleteGroup: (groupId: string) =>
    api.delete(`/groups/${groupId}`).then(res => res.data),
  
  // Get invite link
  getInviteLink: (groupId: string) =>
    api.get(`/groups/${groupId}/invite-link`).then(res => res.data),
  
  // Reset invite link
  resetInviteLink: (groupId: string) =>
    api.post(`/groups/${groupId}/invite-link`).then(res => res.data),
  
  // Remove participants
  removeParticipants: (groupId: string, phoneNumbers: string[]) =>
    api.delete(`/groups/${groupId}/participants`, { data: { phoneNumbers } }).then(res => res.data),
  
  // Get join requests
  getJoinRequests: (groupId: string) =>
    api.get(`/groups/${groupId}/join-requests`).then(res => res.data),
  
  // Approve join requests
  approveJoinRequests: (groupId: string, phoneNumbers: string[]) =>
    api.post(`/groups/${groupId}/join-requests`, { phoneNumbers }).then(res => res.data),
  
  // Reject join requests
  rejectJoinRequests: (groupId: string, phoneNumbers: string[]) =>
    api.delete(`/groups/${groupId}/join-requests`, { data: { phoneNumbers } }).then(res => res.data),
  
  // Send group message
  sendGroupMessage: (groupId: string, message: string) =>
    api.post(`/groups/${groupId}/messages`, { message }).then(res => res.data)
};

// Website Management API
export const getWebsites = () => 
  api.get('/websites').then(res => res.data);

export const getWebsite = (id: string) => 
  api.get(`/websites/${id}`).then(res => res.data);

export const createWebsite = (data: any) => 
  api.post('/websites', data).then(res => res.data);

export const updateWebsite = (id: string, data: any) => 
  api.put(`/websites/${id}`, data).then(res => res.data);

export const deleteWebsite = (id: string) => 
  api.delete(`/websites/${id}`).then(res => res.data);

// API Key Management
export const getApiKeys = (websiteId: string) => 
  api.get(`/websites/${websiteId}/keys`).then(res => res.data);

export const generateApiKey = (websiteId: string, data: any) => 
  api.post(`/websites/${websiteId}/keys`, data).then(res => res.data);

export const revokeApiKey = (keyId: string) => 
  api.delete(`/keys/${keyId}`).then(res => res.data);

// Usage Statistics
export const getUsageStats = (websiteId: string, period?: string) => 
  api.get(`/websites/${websiteId}/stats`, { params: { period } }).then(res => res.data);
