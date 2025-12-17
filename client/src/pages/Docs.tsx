import { useNavigate } from 'react-router-dom';
import { Code, Zap, Globe } from 'lucide-react';

export default function Docs() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">WhatsApp Business Platform</span>
            </button>
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <header className="pb-8 border-b-4 border-green-600 mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Integration Guide</h1>
            <p className="text-lg text-gray-600">Connect your website to WhatsApp in minutes</p>
          </header>

          <div className="prose prose-lg max-w-none">
            {/* Quick Start */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-gray-200">
                Quick Start
              </h2>
              <p className="text-gray-700 mb-4">
                Integrate WhatsApp messaging into your website with our simple REST API. Follow these steps to get started:
              </p>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Prerequisites</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Active WhatsApp Business Account</li>
                  <li>API credentials from our platform</li>
                  <li>Basic knowledge of REST APIs</li>
                </ul>
              </div>
            </section>

            {/* Integration Methods */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-gray-200">
                Integration Methods
              </h2>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-green-500 transition-colors">
                  <div className="flex items-center mb-4">
                    <Code className="w-8 h-8 text-green-600 mr-3" />
                    <h3 className="text-xl font-semibold text-gray-900">REST API</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Direct API integration for maximum flexibility and control
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>✓ Send messages</li>
                    <li>✓ Receive webhooks</li>
                    <li>✓ Manage templates</li>
                    <li>✓ Full feature access</li>
                  </ul>
                </div>

                <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-green-500 transition-colors">
                  <div className="flex items-center mb-4">
                    <Globe className="w-8 h-8 text-blue-600 mr-3" />
                    <h3 className="text-xl font-semibold text-gray-900">Website Widget</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Simple JavaScript widget for quick integration
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>✓ Easy setup</li>
                    <li>✓ No backend required</li>
                    <li>✓ Customizable design</li>
                    <li>✓ Mobile responsive</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* API Example */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-gray-200">
                API Example
              </h2>
              
              <div className="bg-gray-900 text-gray-100 rounded-lg p-6 overflow-x-auto mb-4">
                <pre className="text-sm">
{`// Send a WhatsApp message
const response = await fetch('https://wa.acestartechsi.com/api/messages/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your-api-key-here'
  },
  body: JSON.stringify({
    to: '+60123456789',
    message: 'Hello from your website!',
    websiteId: 'your-website-id'
  })
});

const data = await response.json();
console.log('Message sent:', data);`}
                </pre>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded">
                <p className="font-semibold text-gray-900 mb-2">🔑 API Key Required</p>
                <p className="text-gray-700">
                  You'll need to <button onClick={() => navigate('/login')} className="text-green-600 hover:underline font-semibold">sign in</button> to get your API credentials and website ID.
                </p>
              </div>
            </section>

            {/* Features */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-gray-200">
                Available Features
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start">
                  <Zap className="w-5 h-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Send Messages</h4>
                    <p className="text-sm text-gray-600">Text, images, videos, documents, and more</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Zap className="w-5 h-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Receive Messages</h4>
                    <p className="text-sm text-gray-600">Real-time webhooks for incoming messages</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Zap className="w-5 h-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Message Templates</h4>
                    <p className="text-sm text-gray-600">Pre-approved templates for marketing</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Zap className="w-5 h-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Contact Management</h4>
                    <p className="text-sm text-gray-600">Organize and manage your contacts</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Zap className="w-5 h-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Analytics</h4>
                    <p className="text-sm text-gray-600">Track message delivery and engagement</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Zap className="w-5 h-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Webhooks</h4>
                    <p className="text-sm text-gray-600">Real-time event notifications</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Get Started CTA */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 text-center text-white">
              <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
              <p className="text-lg mb-6 opacity-90">
                Sign in to get your API credentials and start integrating WhatsApp into your website
              </p>
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-3 bg-white text-green-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
              >
                Sign In to Get API Key
              </button>
            </div>

            {/* Support */}
            <div className="bg-gray-50 p-6 rounded-lg mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
              <div className="space-y-2 text-gray-700">
                <p>📧 Email: <a href="mailto:sales@acestartechsi.com" className="text-green-600 hover:underline">sales@acestartechsi.com</a></p>
                <p>📚 Documentation: <a href="https://developers.facebook.com/docs/whatsapp" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">WhatsApp Cloud API Docs</a></p>
                <p>🏢 Company: Ace Star Tech System Integration Pte Ltd</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 Ace Star Tech System Integration Pte Ltd. All rights reserved.</p>
          <p className="mt-2">
            <button onClick={() => navigate('/terms')} className="text-green-400 hover:underline">Terms of Service</button>
            {' | '}
            <button onClick={() => navigate('/privacy')} className="text-green-400 hover:underline">Privacy Policy</button>
          </p>
        </div>
      </footer>
    </div>
  );
}
