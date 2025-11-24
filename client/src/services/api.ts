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

export const authService = {
  facebookLogin: (accessToken: string) => 
    api.post('/auth/facebook', { accessToken }).then(res => res.data),
  getCurrentUser: () => 
    api.get('/auth/me').then(res => res.data)
};

export const messageService = {
  getMessages: (conversationId?: string) => 
    api.get('/messages', { params: { conversationId } }).then(res => res.data),
  sendMessage: (to: string, message: string, type?: string) => 
    api.post('/messages/send', { to, message, type }).then(res => res.data),
  getConversations: () => 
    api.get('/messages/conversations').then(res => res.data)
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
