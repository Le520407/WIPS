import { useState, useEffect } from 'react';
import { Save, Key, Phone, Building2 } from 'lucide-react';
import api from '../services/api';

interface AccountSettings {
  whatsapp_business_account_id: string;
  phone_number_id: string;
  access_token: string;
}

export default function AccountSettings() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState<AccountSettings>({
    whatsapp_business_account_id: '',
    phone_number_id: '',
    access_token: '',
  });
  const [showToken, setShowToken] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      // Try to get current settings from user or default account
      const response = await api.get('/admin/accounts');
      const accounts = response.data.accounts;
      
      if (accounts && accounts.length > 0) {
        const account = accounts[0]; // Get first account
        setFormData({
          whatsapp_business_account_id: account.whatsapp_business_account_id || '',
          phone_number_id: account.phone_number_id || '',
          access_token: '', // Don't show token for security
        });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      // Keep empty form if no accounts found
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);

      // Validate inputs
      if (!formData.whatsapp_business_account_id || !formData.phone_number_id) {
        setMessage({ type: 'error', text: 'WABA ID and Phone Number ID are required' });
        return;
      }

      // Update account settings
      const response = await api.get('/admin/accounts');
      const accounts = response.data.accounts;
      
      if (accounts && accounts.length > 0) {
        // Update existing account
        const account = accounts[0];
        const updateData: any = {
          whatsapp_business_account_id: formData.whatsapp_business_account_id,
          phone_number_id: formData.phone_number_id,
        };
        
        if (formData.access_token) {
          updateData.access_token = formData.access_token;
        }
        
        await api.put(`/admin/accounts/${account.id}`, updateData);
      } else {
        // Create new account
        await api.post('/admin/accounts', {
          name: 'My WhatsApp Business',
          type: 'business',
          whatsapp_business_account_id: formData.whatsapp_business_account_id,
          phone_number_id: formData.phone_number_id,
          access_token: formData.access_token,
        });
      }

      setMessage({ type: 'success', text: 'Account settings saved successfully!' });
      
      // Clear access token field after save
      setFormData({ ...formData, access_token: '' });
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to save settings' 
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-600">Configure your WhatsApp Business account details</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Building2 className="w-4 h-4 mr-2" />
              WhatsApp Business Account ID (WABA ID)
            </label>
            <input
              type="text"
              value={formData.whatsapp_business_account_id}
              onChange={(e) => setFormData({ ...formData, whatsapp_business_account_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
              placeholder="673274279136021"
            />
            <p className="text-xs text-gray-500 mt-1">
              Find this in your Meta Business Manager → WhatsApp Accounts
            </p>
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4 mr-2" />
              Phone Number ID
            </label>
            <input
              type="text"
              value={formData.phone_number_id}
              onChange={(e) => setFormData({ ...formData, phone_number_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
              placeholder="803320889535856"
            />
            <p className="text-xs text-gray-500 mt-1">
              Find this in your Meta Business Manager → WhatsApp Accounts → Phone Numbers
            </p>
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Key className="w-4 h-4 mr-2" />
              Access Token
            </label>
            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                value={formData.access_token}
                onChange={(e) => setFormData({ ...formData, access_token: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                placeholder="EAA..."
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-blue-600 hover:text-blue-800"
              >
                {showToken ? 'Hide' : 'Show'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Generate this in Meta Business Manager → System Users → Generate Token
            </p>
            <p className="text-xs text-yellow-600 mt-1">
              ⚠️ Leave empty to keep current token unchanged
            </p>
          </div>
        </div>

        <div className="pt-4 border-t">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3">How to get these values?</h3>
        <div className="space-y-3 text-sm text-blue-800">
          <div>
            <p className="font-medium">1. WhatsApp Business Account ID (WABA ID):</p>
            <p className="ml-4">Go to Meta Business Manager → WhatsApp Accounts → Copy the Account ID</p>
          </div>
          <div>
            <p className="font-medium">2. Phone Number ID:</p>
            <p className="ml-4">Go to Meta Business Manager → WhatsApp Accounts → Phone Numbers → Copy the Phone Number ID</p>
          </div>
          <div>
            <p className="font-medium">3. Access Token:</p>
            <p className="ml-4">Go to Meta Business Manager → System Users → Create System User → Generate Token</p>
            <p className="ml-4 text-xs mt-1">Required permissions: whatsapp_business_management, whatsapp_business_messaging</p>
          </div>
        </div>
      </div>

      {/* Current Configuration */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-3">Current Configuration</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">WABA ID:</span>
            <span className="font-mono text-gray-900">
              {formData.whatsapp_business_account_id || 'Not set'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Phone ID:</span>
            <span className="font-mono text-gray-900">
              {formData.phone_number_id || 'Not set'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Access Token:</span>
            <span className="text-gray-900">
              {formData.access_token ? '••••••••' : 'Not changed'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
