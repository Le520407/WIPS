import { useState } from 'react';
import { BookOpen, TrendingUp, Zap, Library, GitCompare, AlertCircle } from 'lucide-react';

type ResourceTab = 'review-tips' | 'marketing-limits' | 'pacing' | 'template-library' | 'template-comparison';

const Resources = () => {
  const [activeTab, setActiveTab] = useState<ResourceTab>('review-tips');

  const tabs = [
    { id: 'review-tips' as ResourceTab, label: 'Review Tips', icon: BookOpen },
    { id: 'marketing-limits' as ResourceTab, label: 'Marketing Limits', icon: TrendingUp },
    { id: 'pacing' as ResourceTab, label: 'Pacing Strategy', icon: Zap },
    { id: 'template-library' as ResourceTab, label: 'Template Library', icon: Library },
    { id: 'template-comparison' as ResourceTab, label: 'Template Comparison', icon: GitCompare },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Resources & Documentation</h1>
        <p className="text-gray-600">Guides, best practices, and reference materials for WhatsApp Business Platform</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow">
        {activeTab === 'review-tips' && <ReviewTipsContent />}
        {activeTab === 'marketing-limits' && <MarketingLimitsContent />}
        {activeTab === 'pacing' && <PacingContent />}
        {activeTab === 'template-library' && <TemplateLibraryContent />}
        {activeTab === 'template-comparison' && <TemplateComparisonContent />}
      </div>
    </div>
  );
};

// Review Tips Content
const ReviewTipsContent = () => (
  <div className="p-6">
    <h2 className="text-xl font-bold mb-4">Template Review Tips</h2>
    <div className="space-y-6">
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 mr-3" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Best Practices for Template Approval</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
              <li>Use clear, professional language</li>
              <li>Include all required variable placeholders</li>
              <li>Avoid promotional language in utility templates</li>
              <li>Follow WhatsApp's content guidelines</li>
              <li>Test templates before submission</li>
            </ul>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Common Rejection Reasons</h3>
        <div className="space-y-3">
          <div className="border-l-4 border-red-500 pl-4">
            <h4 className="font-medium text-red-900">Misleading Content</h4>
            <p className="text-sm text-gray-600">Templates that contain false or misleading information</p>
          </div>
          <div className="border-l-4 border-red-500 pl-4">
            <h4 className="font-medium text-red-900">Inappropriate Category</h4>
            <p className="text-sm text-gray-600">Marketing content in utility/authentication templates</p>
          </div>
          <div className="border-l-4 border-red-500 pl-4">
            <h4 className="font-medium text-red-900">Poor Quality</h4>
            <p className="text-sm text-gray-600">Spelling errors, grammar issues, or unclear messaging</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Template Categories</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">UTILITY</h4>
            <p className="text-sm text-gray-600">Account updates, order notifications, appointment reminders</p>
          </div>
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">AUTHENTICATION</h4>
            <p className="text-sm text-gray-600">OTP codes, verification messages, security alerts</p>
          </div>
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-purple-900 mb-2">MARKETING</h4>
            <p className="text-sm text-gray-600">Promotions, offers, product announcements</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Marketing Limits Content
const MarketingLimitsContent = () => (
  <div className="p-6">
    <h2 className="text-xl font-bold mb-4">Marketing Message Limits</h2>
    <div className="space-y-6">
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
        <h3 className="font-semibold text-yellow-900 mb-2">Tier-Based Messaging Limits</h3>
        <p className="text-sm text-yellow-800">Your messaging limit determines how many business-initiated conversations you can start in a 24-hour period.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tier</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Daily Limit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requirements</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap font-medium">Tier 1</td>
              <td className="px-6 py-4 whitespace-nowrap">1,000</td>
              <td className="px-6 py-4 text-sm text-gray-600">Default tier for new accounts</td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap font-medium">Tier 2</td>
              <td className="px-6 py-4 whitespace-nowrap">10,000</td>
              <td className="px-6 py-4 text-sm text-gray-600">Initiated 1,000+ conversations</td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap font-medium">Tier 3</td>
              <td className="px-6 py-4 whitespace-nowrap">100,000</td>
              <td className="px-6 py-4 text-sm text-gray-600">Initiated 10,000+ conversations</td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap font-medium">Tier 4</td>
              <td className="px-6 py-4 whitespace-nowrap">Unlimited</td>
              <td className="px-6 py-4 text-sm text-gray-600">Initiated 100,000+ conversations</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div>
        <h3 className="font-semibold mb-3">How to Increase Your Tier</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
          <li>Start business-initiated conversations with quality templates</li>
          <li>Maintain good phone number quality rating</li>
          <li>Avoid high block rates and user reports</li>
          <li>Tier upgrades happen automatically within 24 hours of meeting requirements</li>
        </ol>
      </div>
    </div>
  </div>
);

// Pacing Content
const PacingContent = () => (
  <div className="p-6">
    <h2 className="text-xl font-bold mb-4">Message Pacing Strategy</h2>
    <div className="space-y-6">
      <div className="bg-green-50 border-l-4 border-green-500 p-4">
        <h3 className="font-semibold text-green-900 mb-2">Why Pacing Matters</h3>
        <p className="text-sm text-green-800">Proper message pacing helps maintain deliverability, avoid rate limits, and improve user experience.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-3">Recommended Strategies</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Spread messages evenly throughout the day</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Start with 10-20% of your limit</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Monitor quality ratings closely</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Implement exponential backoff for errors</span>
            </li>
          </ul>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-3">Things to Avoid</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="text-red-500 mr-2">✗</span>
              <span>Sending all messages at once</span>
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-2">✗</span>
              <span>Ignoring rate limit errors</span>
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-2">✗</span>
              <span>Sending during off-hours</span>
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-2">✗</span>
              <span>Exceeding your tier limit</span>
            </li>
          </ul>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Pacing Formula</h3>
        <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
          <p>messages_per_hour = daily_limit / 24</p>
          <p>delay_between_messages = 3600 / messages_per_hour</p>
          <p className="mt-2 text-gray-600">Example: 1000 daily limit = ~42 messages/hour = ~86 seconds between messages</p>
        </div>
      </div>
    </div>
  </div>
);

// Template Library Content  
const TemplateLibraryContent = () => (
  <div className="p-6">
    <h2 className="text-xl font-bold mb-4">Template Library</h2>
    <p className="text-gray-600 mb-6">Pre-built template examples for common use cases</p>
    
    <div className="space-y-4">
      {[
        {
          name: 'Order Confirmation',
          category: 'UTILITY',
          body: 'Hi {{1}}! Your order #{{2}} has been confirmed. Total: ${{3}}. Estimated delivery: {{4}}.',
          variables: ['Customer Name', 'Order Number', 'Total Amount', 'Delivery Date']
        },
        {
          name: 'Appointment Reminder',
          category: 'UTILITY',
          body: 'Hi {{1}}, this is a reminder about your appointment on {{2}} at {{3}}. Reply CONFIRM to confirm or CANCEL to reschedule.',
          variables: ['Customer Name', 'Date', 'Time']
        },
        {
          name: 'OTP Verification',
          category: 'AUTHENTICATION',
          body: 'Your verification code is {{1}}. This code will expire in {{2}} minutes. Do not share this code with anyone.',
          variables: ['OTP Code', 'Expiry Minutes']
        },
        {
          name: 'Shipping Update',
          category: 'UTILITY',
          body: 'Good news {{1}}! Your order #{{2}} has been shipped. Track your package: {{3}}',
          variables: ['Customer Name', 'Order Number', 'Tracking Link']
        },
        {
          name: 'Welcome Message',
          category: 'MARKETING',
          body: 'Welcome to {{1}}, {{2}}! Use code {{3}} for {{4}} off your first purchase. Valid until {{5}}.',
          variables: ['Brand Name', 'Customer Name', 'Promo Code', 'Discount', 'Expiry Date']
        },
      ].map((template, index) => (
        <div key={index} className="border rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold">{template.name}</h3>
            <span className={`px-2 py-1 text-xs rounded ${
              template.category === 'UTILITY' ? 'bg-green-100 text-green-800' :
              template.category === 'AUTHENTICATION' ? 'bg-blue-100 text-blue-800' :
              'bg-purple-100 text-purple-800'
            }`}>
              {template.category}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-3 bg-gray-50 p-3 rounded">{template.body}</p>
          <div className="text-xs text-gray-500">
            <span className="font-medium">Variables:</span> {template.variables.join(', ')}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Template Comparison Content
const TemplateComparisonContent = () => (
  <div className="p-6">
    <h2 className="text-xl font-bold mb-4">Template Type Comparison</h2>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Feature</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utility</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Authentication</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marketing</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          <tr>
            <td className="px-6 py-4 font-medium">Use Case</td>
            <td className="px-6 py-4 text-sm">Transactional updates</td>
            <td className="px-6 py-4 text-sm">Security codes</td>
            <td className="px-6 py-4 text-sm">Promotions</td>
          </tr>
          <tr>
            <td className="px-6 py-4 font-medium">Approval Time</td>
            <td className="px-6 py-4 text-sm">~15 minutes</td>
            <td className="px-6 py-4 text-sm">~15 minutes</td>
            <td className="px-6 py-4 text-sm">~24 hours</td>
          </tr>
          <tr>
            <td className="px-6 py-4 font-medium">Opt-out Required</td>
            <td className="px-6 py-4 text-sm">No</td>
            <td className="px-6 py-4 text-sm">No</td>
            <td className="px-6 py-4 text-sm">Yes</td>
          </tr>
          <tr>
            <td className="px-6 py-4 font-medium">Buttons Allowed</td>
            <td className="px-6 py-4 text-sm">Yes (CTA, Quick Reply)</td>
            <td className="px-6 py-4 text-sm">Yes (OTP Copy)</td>
            <td className="px-6 py-4 text-sm">Yes (All types)</td>
          </tr>
          <tr>
            <td className="px-6 py-4 font-medium">Media Support</td>
            <td className="px-6 py-4 text-sm">Image, Video, Document</td>
            <td className="px-6 py-4 text-sm">Limited</td>
            <td className="px-6 py-4 text-sm">Image, Video</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="border-l-4 border-green-500 pl-4">
        <h3 className="font-semibold text-green-900 mb-2">Best for Utility</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Order confirmations</li>
          <li>• Shipping updates</li>
          <li>• Appointment reminders</li>
          <li>• Account notifications</li>
        </ul>
      </div>
      <div className="border-l-4 border-blue-500 pl-4">
        <h3 className="font-semibold text-blue-900 mb-2">Best for Authentication</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• OTP codes</li>
          <li>• Password resets</li>
          <li>• Login verification</li>
          <li>• Security alerts</li>
        </ul>
      </div>
      <div className="border-l-4 border-purple-500 pl-4">
        <h3 className="font-semibold text-purple-900 mb-2">Best for Marketing</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Product launches</li>
          <li>• Special offers</li>
          <li>• Seasonal promotions</li>
          <li>• Event invitations</li>
        </ul>
      </div>
    </div>
  </div>
);

export default Resources;
