import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3002/api';

interface AuthTemplate {
  id: string;
  name: string;
  language: string;
  status: string;
  otp_type: string;
  add_security_recommendation: boolean;
  code_expiration_minutes?: number;
  created_at: string;
}

interface OTPHistory {
  id: string;
  phone_number: string;
  code: string;
  template_name: string;
  verified: boolean;
  expires_at: string;
  created_at: string;
}

export default function AuthenticationTemplates() {
  const [templates, setTemplates] = useState<AuthTemplate[]>([]);
  const [otpHistory, setOTPHistory] = useState<OTPHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'templates' | 'send' | 'history'>('templates');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    language: 'en_US',
    otp_type: 'COPY_CODE',
    add_security_recommendation: true,
    code_expiration_minutes: 10,
    button_text: 'Copy Code',
    autofill_text: 'Autofill',
    package_name: '',
    signature_hash: '',
    message_send_ttl_seconds: 600,
  });

  // Send OTP form
  const [sendOTPForm, setSendOTPForm] = useState({
    to: '',
    template_name: '',
    language_code: 'en_US',
    expiry_minutes: 10,
  });

  // Verify OTP form
  const [verifyForm, setVerifyForm] = useState({
    phone_number: '',
    code: '',
  });

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadTemplates();
    loadOTPHistory();
  }, []);

  const loadTemplates = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/auth-templates/templates`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTemplates(response.data.templates);
    } catch (error: any) {
      console.error('Error loading templates:', error);
      showMessage('error', 'Failed to load templates');
    }
  };

  const loadOTPHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/auth-templates/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOTPHistory(response.data.history);
    } catch (error: any) {
      console.error('Error loading OTP history:', error);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const payload: any = {
        name: formData.name,
        language: formData.language,
        otp_type: formData.otp_type,
        add_security_recommendation: formData.add_security_recommendation,
      };

      if (formData.code_expiration_minutes) {
        payload.code_expiration_minutes = formData.code_expiration_minutes;
      }

      if (formData.message_send_ttl_seconds) {
        payload.message_send_ttl_seconds = formData.message_send_ttl_seconds;
      }

      if (formData.otp_type === 'COPY_CODE') {
        payload.button_text = formData.button_text;
      }

      if (formData.otp_type === 'ONE_TAP' || formData.otp_type === 'ZERO_TAP') {
        payload.package_name = formData.package_name;
        payload.signature_hash = formData.signature_hash;
        payload.button_text = formData.button_text;
        payload.autofill_text = formData.autofill_text;
      }

      const response = await axios.post(
        `${API_BASE_URL}/auth-templates/templates`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      showMessage('success', `Template created: ${response.data.template.name}`);
      loadTemplates();
      
      // Reset form
      setFormData({
        ...formData,
        name: '',
      });
    } catch (error: any) {
      console.error('Error creating template:', error);
      showMessage('error', error.response?.data?.details || 'Failed to create template');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/auth-templates/send`,
        sendOTPForm,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      showMessage('success', `OTP sent! Code: ${response.data.otp} (for testing)`);
      loadOTPHistory();
      
      // Set verify form phone number
      setVerifyForm({ ...verifyForm, phone_number: sendOTPForm.to });
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      showMessage('error', error.response?.data?.details || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/auth-templates/verify`,
        verifyForm,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      showMessage('success', response.data.message);
      loadOTPHistory();
      setVerifyForm({ phone_number: '', code: '' });
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      showMessage('error', error.response?.data?.error || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/auth-templates/templates/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      showMessage('success', 'Template deleted successfully');
      loadTemplates();
    } catch (error: any) {
      console.error('Error deleting template:', error);
      showMessage('error', 'Failed to delete template');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Authentication Templates</h1>
        <p className="text-gray-600 mt-1">
          Send one-time passwords (OTP) and verification codes via WhatsApp
        </p>
      </div>

      {message && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('templates')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'templates'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Templates
          </button>
          <button
            onClick={() => setActiveTab('send')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'send'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Send OTP
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            OTP History
          </button>
        </nav>
      </div>

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create Template Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Create Authentication Template</h2>
            <form onSubmit={handleCreateTemplate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="auth_code_copy"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Language *
                </label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="en_US">English (US)</option>
                  <option value="zh_CN">Chinese (Simplified)</option>
                  <option value="es_ES">Spanish</option>
                  <option value="fr_FR">French</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  OTP Type *
                </label>
                <select
                  value={formData.otp_type}
                  onChange={(e) => setFormData({ ...formData, otp_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="COPY_CODE">Copy Code (Recommended)</option>
                  <option value="ONE_TAP">One-Tap Autofill (Android only)</option>
                  <option value="ZERO_TAP">Zero-Tap (Android only)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.otp_type === 'COPY_CODE' && 'User taps button to copy code'}
                  {formData.otp_type === 'ONE_TAP' && 'Code auto-fills in your app (requires Android integration)'}
                  {formData.otp_type === 'ZERO_TAP' && 'Code broadcasts to your app (requires Android integration)'}
                </p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.add_security_recommendation}
                  onChange={(e) =>
                    setFormData({ ...formData, add_security_recommendation: e.target.checked })
                  }
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Add security recommendation
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code Expiration (minutes)
                </label>
                <input
                  type="number"
                  value={formData.code_expiration_minutes}
                  onChange={(e) =>
                    setFormData({ ...formData, code_expiration_minutes: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  min="1"
                  max="90"
                />
              </div>

              {(formData.otp_type === 'ONE_TAP' || formData.otp_type === 'ZERO_TAP') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Package Name * (Android)
                    </label>
                    <input
                      type="text"
                      value={formData.package_name}
                      onChange={(e) => setFormData({ ...formData, package_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="com.example.myapp"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Signature Hash * (11 chars)
                    </label>
                    <input
                      type="text"
                      value={formData.signature_hash}
                      onChange={(e) => setFormData({ ...formData, signature_hash: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="K8a/AINcGX7"
                      maxLength={11}
                      required
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? 'Creating...' : 'Create Template'}
              </button>
            </form>
          </div>

          {/* Templates List */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Your Templates</h2>
            <div className="space-y-3">
              {templates.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No templates yet</p>
              ) : (
                templates.map((template) => (
                  <div
                    key={template.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{template.name}</h3>
                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                          <p>Language: {template.language}</p>
                          <p>Type: {template.otp_type}</p>
                          <p>
                            Status:{' '}
                            <span
                              className={`font-medium ${
                                template.status === 'APPROVED'
                                  ? 'text-green-600'
                                  : template.status === 'PENDING'
                                  ? 'text-yellow-600'
                                  : 'text-red-600'
                              }`}
                            >
                              {template.status}
                            </span>
                          </p>
                          {template.code_expiration_minutes && (
                            <p>Expires in: {template.code_expiration_minutes} min</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Send OTP Tab */}
      {activeTab === 'send' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Send OTP Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Send OTP</h2>
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={sendOTPForm.to}
                  onChange={(e) => setSendOTPForm({ ...sendOTPForm, to: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="+1234567890"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template Name *
                </label>
                <select
                  value={sendOTPForm.template_name}
                  onChange={(e) => setSendOTPForm({ ...sendOTPForm, template_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="">Select template...</option>
                  {templates
                    .filter((t) => t.status === 'APPROVED')
                    .map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name} ({t.language})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry (minutes)
                </label>
                <input
                  type="number"
                  value={sendOTPForm.expiry_minutes}
                  onChange={(e) =>
                    setSendOTPForm({ ...sendOTPForm, expiry_minutes: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  min="1"
                  max="90"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          </div>

          {/* Verify OTP Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Verify OTP</h2>
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={verifyForm.phone_number}
                  onChange={(e) => setVerifyForm({ ...verifyForm, phone_number: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="+1234567890"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  OTP Code *
                </label>
                <input
                  type="text"
                  value={verifyForm.code}
                  onChange={(e) => setVerifyForm({ ...verifyForm, code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="123456"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* OTP History Tab */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">OTP History</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Phone Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Template
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Expires At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Sent At
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {otpHistory.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        No OTP history yet
                      </td>
                    </tr>
                  ) : (
                    otpHistory.map((otp) => (
                      <tr key={otp.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {otp.phone_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                          {otp.code}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {otp.template_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              otp.verified
                                ? 'bg-green-100 text-green-800'
                                : new Date(otp.expires_at) < new Date()
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {otp.verified ? 'Verified' : new Date(otp.expires_at) < new Date() ? 'Expired' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(otp.expires_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(otp.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
