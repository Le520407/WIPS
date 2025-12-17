import { useNavigate } from 'react-router-dom';

export default function Privacy() {
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
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
            <p className="text-lg text-gray-600">Ace Star Tech System Integration Pte Ltd</p>
            <span className="inline-block mt-3 bg-yellow-100 px-4 py-1 rounded text-sm font-semibold text-yellow-900">
              Effective Date: November 7, 2025
            </span>
          </header>

          <div className="prose prose-lg max-w-none">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded mb-8">
              <p className="font-semibold text-gray-900 mb-2">Quick Summary:</p>
              <p className="text-gray-700 m-0">
                This Privacy Policy explains how Ace Star Tech collects, uses, and protects your data when you use our 
                WhatsApp Business Platform. We comply with Meta's Platform Terms, Singapore's PDPA, and international data protection standards.
              </p>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-gray-200">
                1. Introduction
              </h2>
              <p className="text-gray-700">
                Ace Star Tech is committed to protecting your privacy and personal data. This policy describes how we collect, 
                use, store, and share information when you use our WhatsApp Business Platform and API integration services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-gray-200">
                2. Information We Collect
              </h2>
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Business Information</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Company details and registration information</li>
                <li>WhatsApp Business Account (WABA) information</li>
                <li>API tokens and access credentials (encrypted)</li>
                <li>Integration configuration data</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Message Metadata</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Message timestamps and delivery status</li>
                <li>Message IDs and conversation IDs</li>
                <li>Template names and parameters</li>
                <li>Webhook event data</li>
              </ul>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded mt-4">
                <p className="font-semibold text-gray-900 m-0">
                  Important: We do not collect or store the actual content of your WhatsApp messages beyond what is necessary for logging and technical support.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-gray-200">
                3. How We Use Your Information
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Provide WhatsApp messaging and API integration services</li>
                <li>Facilitate Meta's Embedded Signup flow</li>
                <li>Authenticate and manage secure access</li>
                <li>Provide technical support and troubleshooting</li>
                <li>Comply with Meta's Platform Terms and legal obligations</li>
                <li>Improve service quality and performance</li>
              </ul>

              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded mt-4">
                <p className="font-semibold text-gray-900 mb-2">We will never:</p>
                <ul className="list-disc pl-6 space-y-1 text-gray-700 m-0">
                  <li>Sell, rent, or lease your personal data</li>
                  <li>Use your message content for advertising</li>
                  <li>Share your data without consent (except as required by law)</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-gray-200">
                4. Data Security
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Encryption: AES-256 at rest, TLS 1.3 in transit</li>
                <li>Access Control: Role-based access and multi-factor authentication</li>
                <li>Monitoring: 24/7 security monitoring and intrusion detection</li>
                <li>Compliance: Singapore's PDPA and international standards</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-gray-200">
                5. Your Rights
              </h2>
              <p className="text-gray-700 mb-4">Under Singapore's PDPA, you have the right to:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Access your personal data</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Export your data in machine-readable format</li>
                <li>Withdraw consent for data processing</li>
                <li>Object to certain types of processing</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-gray-200">
                6. Data Retention
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Active accounts: Data retained while account is active</li>
                <li>Logs: Retained for up to 90 days</li>
                <li>Billing records: Retained for 7 years (Singapore law)</li>
                <li>Inactive accounts: Data deleted within 30 days of termination</li>
              </ul>
            </section>

            <div className="bg-gray-50 p-6 rounded-lg mt-12">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Us</h3>
              <div className="space-y-2 text-gray-700">
                <p>📧 Privacy: <a href="mailto:privacy@acestartechsi.com" className="text-green-600 hover:underline">privacy@acestartechsi.com</a></p>
                <p>📧 General: <a href="mailto:sales@acestartechsi.com" className="text-green-600 hover:underline">sales@acestartechsi.com</a></p>
                <p>🏢 Company: Ace Star Tech System Integration Pte Ltd</p>
                <p>📍 Location: Singapore</p>
                <p className="text-sm text-gray-600 mt-4">
                  We respond to all requests within 30 days in accordance with PDPA requirements.
                </p>
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
