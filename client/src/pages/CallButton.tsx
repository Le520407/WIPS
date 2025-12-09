import { useState } from 'react';
import { Phone, Link as LinkIcon, Send, Copy, QrCode } from 'lucide-react';
import api from '../services/api';

const CallButton = () => {
  const [activeTab, setActiveTab] = useState<'message' | 'deeplink'>('message');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Call Button Message Form
  const [messageForm, setMessageForm] = useState({
    to: '',
    body_text: 'You can call us on WhatsApp now for faster service!',
    button_text: 'Call Now',
    ttl_minutes: 1440,
    payload: '',
  });

  // Deep Link Form
  const [deepLinkForm, setDeepLinkForm] = useState({
    phone_number: '',
    payload: '',
  });

  // Deep Link Message Form
  const [deepLinkMessageForm, setDeepLinkMessageForm] = useState({
    to: '',
    message_text: 'Need help? Call us directly on WhatsApp:',
    phone_number: '',
    payload: '',
  });

  // Generated Deep Link
  const [generatedLink, setGeneratedLink] = useState<{
    deep_link: string;
    qr_code_url: string;
  } | null>(null);

  const handleSendCallButtonMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.post('/call/button/send', messageForm);
      setSuccess(`Call button message sent successfully! Message ID: ${response.data.message_id}`);
      
      // Reset form
      setMessageForm({
        ...messageForm,
        to: '',
        payload: '',
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send call button message');
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDeepLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.post('/call/button/deeplink/generate', deepLinkForm);
      setGeneratedLink({
        deep_link: response.data.deep_link,
        qr_code_url: response.data.qr_code_url,
      });
      setSuccess('Call deep link generated successfully!');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate deep link');
    } finally {
      setLoading(false);
    }
  };

  const handleSendDeepLinkMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.post('/call/button/deeplink/send', deepLinkMessageForm);
      setSuccess(`Message with call deep link sent successfully! Message ID: ${response.data.message_id}`);
      
      // Reset form
      setDeepLinkMessageForm({
        ...deepLinkMessageForm,
        to: '',
        payload: '',
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess('Copied to clipboard!');
    setTimeout(() => setSuccess(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Call Button Messages</h1>
        <p className="text-gray-600 mt-1">
          Send messages with WhatsApp call buttons or generate call deep links
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('message')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'message'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Phone className="w-5 h-5 inline mr-2" />
            Call Button Message
          </button>
          <button
            onClick={() => setActiveTab('deeplink')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'deeplink'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <LinkIcon className="w-5 h-5 inline mr-2" />
            Call Deep Link
          </button>
        </nav>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-600">{success}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Call Button Message Tab */}
      {activeTab === 'message' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Send Interactive Call Button Message</h2>
          <p className="text-sm text-gray-600 mb-6">
            Send a free-form message with a call button. The recipient can tap the button to call you directly.
          </p>

          <form onSubmit={handleSendCallButtonMessage} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recipient Phone Number *
              </label>
              <input
                type="text"
                value={messageForm.to}
                onChange={(e) => setMessageForm({ ...messageForm, to: e.target.value })}
                placeholder="+60105520735"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Include country code (e.g., +60)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message Text *
              </label>
              <textarea
                value={messageForm.body_text}
                onChange={(e) => setMessageForm({ ...messageForm, body_text: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Button Text
                </label>
                <input
                  type="text"
                  value={messageForm.button_text}
                  onChange={(e) => setMessageForm({ ...messageForm, button_text: e.target.value })}
                  placeholder="Call Now"
                  maxLength={20}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Max 20 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  TTL (minutes)
                </label>
                <input
                  type="number"
                  value={messageForm.ttl_minutes}
                  onChange={(e) => setMessageForm({ ...messageForm, ttl_minutes: parseInt(e.target.value) })}
                  min={1}
                  max={43200}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">1-43200 (30 days)</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payload (Optional)
              </label>
              <input
                type="text"
                value={messageForm.payload}
                onChange={(e) => setMessageForm({ ...messageForm, payload: e.target.value })}
                placeholder="tracking_id_123"
                maxLength={512}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">For tracking purposes (max 512 chars)</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                'Sending...'
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Send Call Button Message
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Deep Link Tab */}
      {activeTab === 'deeplink' && (
        <div className="space-y-6">
          {/* Generate Deep Link */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Generate Call Deep Link</h2>
            <p className="text-sm text-gray-600 mb-6">
              Create a deep link that users can click to call your business on WhatsApp.
            </p>

            <form onSubmit={handleGenerateDeepLink} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number (Optional)
                </label>
                <input
                  type="text"
                  value={deepLinkForm.phone_number}
                  onChange={(e) => setDeepLinkForm({ ...deepLinkForm, phone_number: e.target.value })}
                  placeholder="Leave empty to use business number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payload (Optional)
                </label>
                <input
                  type="text"
                  value={deepLinkForm.payload}
                  onChange={(e) => setDeepLinkForm({ ...deepLinkForm, payload: e.target.value })}
                  placeholder="campaign_001"
                  maxLength={512}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  'Generating...'
                ) : (
                  <>
                    <LinkIcon className="w-5 h-5 mr-2" />
                    Generate Deep Link
                  </>
                )}
              </button>
            </form>

            {/* Generated Link Display */}
            {generatedLink && (
              <div className="mt-6 space-y-4">
                <div className="border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Generated Deep Link
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={generatedLink.deep_link}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                    <button
                      onClick={() => copyToClipboard(generatedLink.deep_link)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    QR Code
                  </label>
                  <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
                    <img
                      src={generatedLink.qr_code_url}
                      alt="QR Code"
                      className="w-64 h-64"
                    />
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Users can scan this QR code to call you on WhatsApp
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Send Deep Link Message */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Send Message with Call Deep Link</h2>
            <p className="text-sm text-gray-600 mb-6">
              Send a text message that includes a call deep link.
            </p>

            <form onSubmit={handleSendDeepLinkMessage} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recipient Phone Number *
                </label>
                <input
                  type="text"
                  value={deepLinkMessageForm.to}
                  onChange={(e) => setDeepLinkMessageForm({ ...deepLinkMessageForm, to: e.target.value })}
                  placeholder="+60105520735"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message Text *
                </label>
                <textarea
                  value={deepLinkMessageForm.message_text}
                  onChange={(e) => setDeepLinkMessageForm({ ...deepLinkMessageForm, message_text: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">The deep link will be appended automatically</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number (Optional)
                </label>
                <input
                  type="text"
                  value={deepLinkMessageForm.phone_number}
                  onChange={(e) => setDeepLinkMessageForm({ ...deepLinkMessageForm, phone_number: e.target.value })}
                  placeholder="Leave empty to use business number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payload (Optional)
                </label>
                <input
                  type="text"
                  value={deepLinkMessageForm.payload}
                  onChange={(e) => setDeepLinkMessageForm({ ...deepLinkMessageForm, payload: e.target.value })}
                  placeholder="campaign_001"
                  maxLength={512}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  'Sending...'
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Send Message with Deep Link
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CallButton;
