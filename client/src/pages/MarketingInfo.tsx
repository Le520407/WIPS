import { useState, useEffect } from 'react';
import { TrendingUp, AlertCircle, CheckCircle, ExternalLink, Info, Zap, Target, BarChart } from 'lucide-react';
import api from '../services/api';

const MarketingInfo = () => {
  const [onboardingStatus, setOnboardingStatus] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [wabaId, setWabaId] = useState('');

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      setLoading(true);
      // Check if WABA is eligible for Marketing Messages API
      const response = await api.get(`/marketing/onboarding-status`);
      setOnboardingStatus(response.data.status);
      setWabaId(response.data.waba_id);
    } catch (error) {
      console.error('Failed to check onboarding status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = () => {
    switch (onboardingStatus) {
      case 'ONBOARDED':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          title: '✅ Marketing Messages API Enabled',
          description: 'Your account has successfully enabled Marketing Messages API and can start sending optimized marketing messages.',
        };
      case 'ELIGIBLE':
        return {
          icon: Info,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          title: '📋 Onboarding Required',
          description: 'Your account is eligible, but you need to accept the Terms of Service first.',
        };
      case 'NOT_ELIGIBLE':
        return {
          icon: AlertCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          title: '❌ Account Not Eligible',
          description: 'Your WABA account does not currently meet the requirements for Marketing Messages API.',
        };
      default:
        return {
          icon: Info,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          title: '🔍 Checking...',
          description: 'Checking your account status...',
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <TrendingUp className="w-8 h-8 mr-3 text-green-600" />
          Marketing Messages API
        </h1>
        <p className="mt-2 text-gray-600">
          Meta's next-generation marketing solution with automatic optimization, performance benchmarks, and conversion tracking
        </p>
      </div>

      {/* Status Card */}
      <div className={`${statusInfo.bgColor} border-l-4 border-${statusInfo.color.replace('text-', '')} p-6 rounded-lg`}>
        <div className="flex items-start">
          <StatusIcon className={`w-6 h-6 ${statusInfo.color} mr-3 flex-shrink-0 mt-1`} />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{statusInfo.title}</h3>
            <p className="mt-1 text-gray-700">{statusInfo.description}</p>
            {wabaId && (
              <p className="mt-2 text-sm text-gray-600">
                WABA ID: <code className="bg-white px-2 py-1 rounded">{wabaId}</code>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* What is Marketing Messages API */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">What is Marketing Messages API?</h2>
        <div className="space-y-4">
          <div className="flex items-start">
            <Zap className="w-5 h-5 text-yellow-500 mr-3 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900">Automatic Delivery Optimization</h3>
              <p className="text-gray-600">
                AI-powered optimization sends messages to users more likely to read and click, improving delivery rates by up to 9%
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <Target className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900">Conversion Tracking</h3>
              <p className="text-gray-600">
                Track user behavior after clicks (add to cart, purchases, etc.) to measure marketing ROI
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <BarChart className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900">Performance Benchmarks</h3>
              <p className="text-gray-600">
                Compare against industry performance and receive personalized improvement recommendations
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Differences */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Differences from Regular Messages</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Feature</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Regular Messages (Cloud API)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marketing Messages API</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">API Endpoint</td>
                <td className="px-6 py-4 text-sm text-gray-600">/messages</td>
                <td className="px-6 py-4 text-sm text-gray-600">/marketing_messages</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Delivery Optimization</td>
                <td className="px-6 py-4 text-sm text-gray-600">❌ None</td>
                <td className="px-6 py-4 text-sm text-gray-600">✅ AI Auto-optimization</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Conversion Tracking</td>
                <td className="px-6 py-4 text-sm text-gray-600">❌ None</td>
                <td className="px-6 py-4 text-sm text-gray-600">✅ Full Tracking</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Performance Benchmarks</td>
                <td className="px-6 py-4 text-sm text-gray-600">❌ None</td>
                <td className="px-6 py-4 text-sm text-gray-600">✅ Industry Comparison</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Creative Optimization</td>
                <td className="px-6 py-4 text-sm text-gray-600">❌ None</td>
                <td className="px-6 py-4 text-sm text-gray-600">✅ Image animations, filters, etc.</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">TTL (Time to Live)</td>
                <td className="px-6 py-4 text-sm text-gray-600">❌ None</td>
                <td className="px-6 py-4 text-sm text-gray-600">✅ 12 hours - 30 days</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Onboarding Steps */}
      {onboardingStatus === 'ELIGIBLE' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📋 How to Enable?</h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-gray-900">Open WhatsApp Manager</h3>
                <p className="text-gray-600 mt-1">
                  Visit{' '}
                  <a
                    href="https://business.facebook.com/wa/manage/home/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center"
                  >
                    WhatsApp Manager
                    <ExternalLink className="w-4 h-4 ml-1" />
                  </a>
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-gray-900">Find Marketing Messages API Alert</h3>
                <p className="text-gray-600 mt-1">
                  In the Overview page's Alerts section, click "Accept terms to get started for Marketing Messages API for WhatsApp"
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-gray-900">Accept Terms of Service</h3>
                <p className="text-gray-600 mt-1">
                  Follow the steps to complete the Terms of Service acceptance
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-gray-900">Refresh This Page</h3>
                <p className="text-gray-600 mt-1">
                  After completion, return here and refresh the page. The status will update to "Enabled"
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={checkOnboardingStatus}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Refresh Status
          </button>
        </div>
      )}

      {/* Not Eligible Info */}
      {onboardingStatus === 'NOT_ELIGIBLE' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">❌ Why Not Eligible?</h2>
          <div className="space-y-2 text-gray-700">
            <p>Possible reasons:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>WABA account is restricted or suspended</li>
              <li>WABA tax country is in a sanctioned region</li>
              <li>Business owner country is in a sanctioned region</li>
              <li>Account violated WhatsApp Business Messaging Policies</li>
            </ul>
            <p className="mt-4">
              Please resolve account issues first, then refresh this page to check again.
            </p>
          </div>
        </div>
      )}

      {/* Use Cases */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">💡 Use Cases</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">✅ Recommended For</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Promotional campaign notifications</li>
              <li>• New product launches</li>
              <li>• Limited-time offers</li>
              <li>• Member-exclusive events</li>
              <li>• Seasonal marketing</li>
            </ul>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">❌ Not Recommended For</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Order confirmations (use Utility)</li>
              <li>• Verification codes (use Authentication)</li>
              <li>• Customer service messages (use Service)</li>
              <li>• One-on-one chats (use Freeform)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Documentation Links */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">📚 Related Documentation</h2>
        <div className="space-y-2">
          <a
            href="https://developers.facebook.com/docs/whatsapp/business-management-api/marketing-messages"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-blue-600 hover:underline"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Marketing Messages API Official Documentation
          </a>
          <a
            href="https://developers.facebook.com/docs/whatsapp/business-management-api/marketing-messages/onboarding"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-blue-600 hover:underline"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Onboarding Guide
          </a>
          <a
            href="https://developers.facebook.com/docs/whatsapp/business-management-api/marketing-messages/insights"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-blue-600 hover:underline"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Insights API Documentation
          </a>
        </div>
      </div>

      {/* Note */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-700">
            <p className="font-semibold mb-1">Important Notes:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Marketing Messages API and Cloud API use the same phone number</li>
              <li>Billing model is the same as Cloud API</li>
              <li>Requires templates with Marketing category</li>
              <li>Messages automatically share event data with Meta for optimization (can be disabled in settings)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingInfo;
