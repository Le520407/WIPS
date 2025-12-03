import { useState } from 'react';
import { BookOpen, Copy, CheckCircle, Search, Filter } from 'lucide-react';

interface TemplateExample {
  id: string;
  name: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  language: string;
  description: string;
  content: string;
  variables: string[];
  useCase: string;
  tags: string[];
}

const TemplateLibrary = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const templateExamples: TemplateExample[] = [
    // Marketing Templates
    {
      id: 'marketing_1',
      name: 'product_launch',
      category: 'MARKETING',
      language: 'en',
      description: 'Announce new product launches',
      content: 'Hi {{1}},\n\nWe\'re excited to announce our new {{2}}!\n\nCheck it out: {{3}}\n\nReply STOP to unsubscribe.',
      variables: ['customer_name', 'product_name', 'product_url'],
      useCase: 'Product announcements and launches',
      tags: ['product', 'launch', 'announcement']
    },
    {
      id: 'marketing_2',
      name: 'special_offer',
      category: 'MARKETING',
      language: 'en',
      description: 'Promotional offers and discounts',
      content: 'Hello {{1}}!\n\n🎉 Special offer just for you: {{2}}% off on {{3}}\n\nUse code: {{4}}\nValid until: {{5}}\n\nShop now: {{6}}\n\nReply STOP to opt out.',
      variables: ['name', 'discount', 'product', 'code', 'expiry', 'url'],
      useCase: 'Sales and promotions',
      tags: ['sale', 'discount', 'promotion']
    },
    {
      id: 'marketing_3',
      name: 'event_invitation',
      category: 'MARKETING',
      language: 'en',
      description: 'Invite customers to events',
      content: 'Hi {{1}},\n\nYou\'re invited to {{2}}!\n\nDate: {{3}}\nLocation: {{4}}\n\nRSVP: {{5}}\n\nReply STOP to unsubscribe.',
      variables: ['name', 'event_name', 'date', 'location', 'rsvp_link'],
      useCase: 'Event marketing',
      tags: ['event', 'invitation', 'rsvp']
    },

    // Utility Templates
    {
      id: 'utility_1',
      name: 'order_confirmation',
      category: 'UTILITY',
      language: 'en',
      description: 'Confirm customer orders',
      content: 'Hi {{1}},\n\nYour order #{{2}} has been confirmed.\n\nTotal: ${{3}}\nEstimated delivery: {{4}}\n\nTrack your order: {{5}}',
      variables: ['name', 'order_id', 'total', 'delivery_date', 'tracking_url'],
      useCase: 'E-commerce order confirmations',
      tags: ['order', 'confirmation', 'ecommerce']
    },
    {
      id: 'utility_2',
      name: 'shipping_update',
      category: 'UTILITY',
      language: 'en',
      description: 'Notify about shipping status',
      content: 'Hi {{1}},\n\nYour order #{{2}} has been shipped!\n\nTracking number: {{3}}\nExpected delivery: {{4}}\n\nTrack here: {{5}}',
      variables: ['name', 'order_id', 'tracking_number', 'delivery_date', 'tracking_url'],
      useCase: 'Shipping notifications',
      tags: ['shipping', 'delivery', 'tracking']
    },
    {
      id: 'utility_3',
      name: 'appointment_reminder',
      category: 'UTILITY',
      language: 'en',
      description: 'Remind about appointments',
      content: 'Hi {{1}},\n\nReminder: You have an appointment on {{2}} at {{3}}.\n\nLocation: {{4}}\n\nTo reschedule, visit: {{5}}',
      variables: ['name', 'date', 'time', 'location', 'reschedule_url'],
      useCase: 'Appointment reminders',
      tags: ['appointment', 'reminder', 'booking']
    },
    {
      id: 'utility_4',
      name: 'payment_receipt',
      category: 'UTILITY',
      language: 'en',
      description: 'Send payment receipts',
      content: 'Hi {{1}},\n\nPayment received: ${{2}}\n\nTransaction ID: {{3}}\nDate: {{4}}\n\nView receipt: {{5}}',
      variables: ['name', 'amount', 'transaction_id', 'date', 'receipt_url'],
      useCase: 'Payment confirmations',
      tags: ['payment', 'receipt', 'transaction']
    },

    // Authentication Templates
    {
      id: 'auth_1',
      name: 'otp_verification',
      category: 'AUTHENTICATION',
      language: 'en',
      description: 'Send OTP codes',
      content: 'Your verification code is {{1}}.\n\nThis code expires in {{2}} minutes.\n\nDo not share this code with anyone.',
      variables: ['otp_code', 'expiry_minutes'],
      useCase: 'Two-factor authentication',
      tags: ['otp', 'verification', '2fa']
    },
    {
      id: 'auth_2',
      name: 'password_reset',
      category: 'AUTHENTICATION',
      language: 'en',
      description: 'Password reset requests',
      content: 'Hi {{1}},\n\nYou requested a password reset.\n\nYour reset code is: {{2}}\n\nValid for {{3}} minutes.\n\nIf you didn\'t request this, please ignore.',
      variables: ['name', 'reset_code', 'expiry_minutes'],
      useCase: 'Password recovery',
      tags: ['password', 'reset', 'security']
    },
    {
      id: 'auth_3',
      name: 'login_alert',
      category: 'AUTHENTICATION',
      language: 'en',
      description: 'Notify about new logins',
      content: 'Hi {{1}},\n\nNew login detected:\n\nDevice: {{2}}\nLocation: {{3}}\nTime: {{4}}\n\nIf this wasn\'t you, secure your account immediately.',
      variables: ['name', 'device', 'location', 'time'],
      useCase: 'Security alerts',
      tags: ['login', 'security', 'alert']
    },

    // Chinese Templates
    {
      id: 'marketing_cn_1',
      name: 'product_launch_cn',
      category: 'MARKETING',
      language: 'zh_CN',
      description: '新产品发布通知',
      content: '您好 {{1}}，\n\n我们很高兴地宣布推出新产品：{{2}}！\n\n立即查看：{{3}}\n\n回复 STOP 取消订阅。',
      variables: ['customer_name', 'product_name', 'product_url'],
      useCase: '产品发布和公告',
      tags: ['产品', '发布', '公告']
    },
    {
      id: 'utility_cn_1',
      name: 'order_confirmation_cn',
      category: 'UTILITY',
      language: 'zh_CN',
      description: '订单确认通知',
      content: '您好 {{1}}，\n\n您的订单 #{{2}} 已确认。\n\n总计：¥{{3}}\n预计送达：{{4}}\n\n追踪订单：{{5}}',
      variables: ['name', 'order_id', 'total', 'delivery_date', 'tracking_url'],
      useCase: '电商订单确认',
      tags: ['订单', '确认', '电商']
    }
  ];

  const filteredTemplates = templateExamples.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'ALL' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCopy = (template: TemplateExample) => {
    navigator.clipboard.writeText(template.content);
    setCopiedId(template.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'MARKETING':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'UTILITY':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'AUTHENTICATION':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const categoryStats = {
    MARKETING: templateExamples.filter(t => t.category === 'MARKETING').length,
    UTILITY: templateExamples.filter(t => t.category === 'UTILITY').length,
    AUTHENTICATION: templateExamples.filter(t => t.category === 'AUTHENTICATION').length
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-indigo-600" />
          Template Library
        </h1>
        <p className="text-gray-600 mt-2">
          Pre-built template examples for common use cases
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Total Templates</p>
          <p className="text-3xl font-bold text-gray-900">{templateExamples.length}</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-sm text-purple-700">Marketing</p>
          <p className="text-3xl font-bold text-purple-900">{categoryStats.MARKETING}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-700">Utility</p>
          <p className="text-3xl font-bold text-blue-900">{categoryStats.UTILITY}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-700">Authentication</p>
          <p className="text-3xl font-bold text-green-900">{categoryStats.AUTHENTICATION}</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Categories</option>
              <option value="MARKETING">Marketing</option>
              <option value="UTILITY">Utility</option>
              <option value="AUTHENTICATION">Authentication</option>
            </select>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <div key={template.id} className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{template.description}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded border ${getCategoryColor(template.category)}`}>
                {template.category}
              </span>
            </div>

            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1">Language: {template.language}</p>
              <p className="text-xs text-gray-500">Use Case: {template.useCase}</p>
            </div>

            {/* Template Content */}
            <div className="bg-gray-50 rounded-lg p-3 mb-3 border border-gray-200">
              <p className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                {template.content}
              </p>
            </div>

            {/* Variables */}
            <div className="mb-3">
              <p className="text-xs font-medium text-gray-700 mb-1">Variables ({template.variables.length}):</p>
              <div className="flex flex-wrap gap-1">
                {template.variables.map((variable, index) => (
                  <span key={index} className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded">
                    {`{{${index + 1}}}`}: {variable}
                  </span>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-1">
                {template.tags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <button
              onClick={() => handleCopy(template)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {copiedId === template.id ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Template
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">No templates found</p>
          <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Usage Instructions */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3">How to Use</h3>
        <ol className="space-y-2 text-sm text-gray-700">
          <li>1. Browse templates by category or search for specific use cases</li>
          <li>2. Click "Copy Template" to copy the content to your clipboard</li>
          <li>3. Go to Templates page and create a new template</li>
          <li>4. Paste the content and customize as needed</li>
          <li>5. Replace variable placeholders with your actual data when sending</li>
        </ol>
      </div>
    </div>
  );
};

export default TemplateLibrary;
