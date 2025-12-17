import { useNavigate } from 'react-router-dom';

export default function Terms() {
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
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
            <p className="text-lg text-gray-600">Ace Star Tech System Integration Pte Ltd</p>
            <span className="inline-block mt-3 bg-yellow-100 px-4 py-1 rounded text-sm font-semibold text-yellow-900">
              Last Updated: November 7, 2025
            </span>
          </header>

          <div className="prose prose-lg max-w-none">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded mb-8">
              <p className="font-semibold text-gray-900 mb-2">Quick Summary:</p>
              <p className="text-gray-700 m-0">
                These Terms govern your use of Ace Star Tech's WhatsApp Business Platform and Embedded Signup services. 
                By using our platform, you agree to comply with Meta's Platform Terms, Developer Policies, and our service requirements.
              </p>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-gray-200">
                1. Acceptance of Terms
              </h2>
              <p className="text-gray-700">
                By accessing or using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-gray-200">
                2. Services Provided
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>WhatsApp Embedded Signup facilitation</li>
                <li>API Integration with business platforms</li>
                <li>Message delivery via Meta's Cloud API</li>
                <li>Template management and configuration</li>
                <li>Webhook services and notifications</li>
                <li>Technical support and assistance</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-gray-200">
                3. Compliance with Meta's Terms
              </h2>
              <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded mb-4">
                <p className="font-semibold text-gray-900">⚠️ Critical Requirement</p>
                <p className="text-gray-700 m-0">
                  You must comply with all Meta policies including Platform Terms, Developer Policies, and WhatsApp Business Terms.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-gray-200">
                4. Prohibited Activities
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Sending spam or unsolicited messages</li>
                <li>Misusing or reverse-engineering APIs</li>
                <li>Violating user privacy or data protection rights</li>
                <li>Bypassing rate limits or security measures</li>
                <li>Sharing API credentials with unauthorized parties</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-gray-200">
                5. Limitation of Liability
              </h2>
              <p className="text-gray-700">
                Our services are provided "AS IS" without warranties. We are not liable for service interruptions, data loss, 
                or damages arising from your use of the platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-gray-200">
                6. Governing Law
              </h2>
              <p className="text-gray-700">
                These Terms are governed by the laws of the Republic of Singapore. Disputes shall be resolved through 
                negotiation, mediation, or arbitration in Singapore.
              </p>
            </section>

            <div className="bg-gray-50 p-6 rounded-lg mt-12">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-2 text-gray-700">
                <p>📧 Email: <a href="mailto:sales@acestartechsi.com" className="text-green-600 hover:underline">sales@acestartechsi.com</a></p>
                <p>📧 Legal: <a href="mailto:privacy@acestartechsi.com" className="text-green-600 hover:underline">privacy@acestartechsi.com</a></p>
                <p>🏢 Company: Ace Star Tech System Integration Pte Ltd</p>
                <p>📍 Location: Singapore</p>
              </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg mt-8">
              <p className="font-semibold text-gray-900 mb-3">Important Links:</p>
              <ul className="space-y-2 text-gray-700">
                <li><button onClick={() => navigate('/privacy')} className="text-green-600 hover:underline">Privacy Policy</button> - How we protect your data</li>
                <li><a href="https://developers.facebook.com/docs/whatsapp" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">WhatsApp Cloud API Docs</a></li>
                <li><a href="https://www.facebook.com/terms.php" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">Meta Platform Terms</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 Ace Star Tech System Integration Pte Ltd. All rights reserved.</p>
          <p className="mt-2 text-gray-400 text-sm">
            WhatsApp and Meta are trademarks of Meta Platforms, Inc.
          </p>
        </div>
      </footer>
    </div>
  );
}
