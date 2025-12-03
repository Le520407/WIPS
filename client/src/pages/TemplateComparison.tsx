import { useState, Fragment } from 'react';
import { GitCompare, CheckCircle, XCircle, Info } from 'lucide-react';

interface ComparisonCategory {
  name: string;
  features: {
    feature: string;
    marketing: boolean | string;
    utility: boolean | string;
    authentication: boolean | string;
    description?: string;
  }[];
}

const TemplateComparison = () => {
  const [selectedView, setSelectedView] = useState<'categories' | 'features'>('categories');

  const comparisonData: ComparisonCategory[] = [
    {
      name: 'Basic Information',
      features: [
        {
          feature: 'Approval Required',
          marketing: true,
          utility: true,
          authentication: true,
          description: 'All templates require WhatsApp approval'
        },
        {
          feature: 'Review Time',
          marketing: '48-72 hours',
          utility: '24-48 hours',
          authentication: '12-24 hours',
          description: 'Typical approval timeline'
        },
        {
          feature: 'Daily Limits',
          marketing: 'Tier-based',
          utility: 'Unlimited',
          authentication: 'Unlimited',
          description: 'Message sending limits'
        }
      ]
    },
    {
      name: 'Content Requirements',
      features: [
        {
          feature: 'Opt-out Required',
          marketing: true,
          utility: false,
          authentication: false,
          description: 'Must include unsubscribe option'
        },
        {
          feature: 'Promotional Content',
          marketing: true,
          utility: false,
          authentication: false,
          description: 'Can include sales/marketing messages'
        },
        {
          feature: 'Transactional Only',
          marketing: false,
          utility: true,
          authentication: true,
          description: 'Must be related to user action'
        },
        {
          feature: 'Time-Sensitive',
          marketing: false,
          utility: 'Optional',
          authentication: true,
          description: 'Urgency of message delivery'
        }
      ]
    },
    {
      name: 'Components Support',
      features: [
        {
          feature: 'Header (Text)',
          marketing: true,
          utility: true,
          authentication: true
        },
        {
          feature: 'Header (Media)',
          marketing: true,
          utility: true,
          authentication: false
        },
        {
          feature: 'Body Text',
          marketing: true,
          utility: true,
          authentication: true
        },
        {
          feature: 'Footer',
          marketing: true,
          utility: true,
          authentication: false
        },
        {
          feature: 'Quick Reply Buttons',
          marketing: true,
          utility: true,
          authentication: true
        },
        {
          feature: 'URL Buttons',
          marketing: true,
          utility: true,
          authentication: false
        },
        {
          feature: 'Phone Buttons',
          marketing: true,
          utility: true,
          authentication: false
        },
        {
          feature: 'Copy Code Button',
          marketing: false,
          utility: false,
          authentication: true
        }
      ]
    },
    {
      name: 'Variables & Personalization',
      features: [
        {
          feature: 'Dynamic Variables',
          marketing: true,
          utility: true,
          authentication: true
        },
        {
          feature: 'Max Variables',
          marketing: 'Unlimited',
          utility: 'Unlimited',
          authentication: 'Limited',
          description: 'Number of {{1}} placeholders allowed'
        },
        {
          feature: 'Personalization',
          marketing: 'Recommended',
          utility: 'Optional',
          authentication: 'Required'
        }
      ]
    },
    {
      name: 'Quality & Performance',
      features: [
        {
          feature: 'Quality Score',
          marketing: true,
          utility: false,
          authentication: false,
          description: 'WhatsApp tracks quality metrics'
        },
        {
          feature: 'Can Be Paused',
          marketing: true,
          utility: false,
          authentication: false,
          description: 'WhatsApp may pause low-quality templates'
        },
        {
          feature: 'Affects Tier',
          marketing: true,
          utility: false,
          authentication: false,
          description: 'Performance affects messaging tier'
        }
      ]
    },
    {
      name: 'Use Cases',
      features: [
        {
          feature: 'Product Launches',
          marketing: true,
          utility: false,
          authentication: false
        },
        {
          feature: 'Promotions',
          marketing: true,
          utility: false,
          authentication: false
        },
        {
          feature: 'Order Updates',
          marketing: false,
          utility: true,
          authentication: false
        },
        {
          feature: 'Shipping Notifications',
          marketing: false,
          utility: true,
          authentication: false
        },
        {
          feature: 'OTP Codes',
          marketing: false,
          utility: false,
          authentication: true
        },
        {
          feature: 'Password Reset',
          marketing: false,
          utility: false,
          authentication: true
        }
      ]
    },
    {
      name: 'Best Practices',
      features: [
        {
          feature: 'User Consent Required',
          marketing: true,
          utility: 'Recommended',
          authentication: false
        },
        {
          feature: 'Clear Value Prop',
          marketing: true,
          utility: 'Optional',
          authentication: false
        },
        {
          feature: 'Immediate Delivery',
          marketing: false,
          utility: true,
          authentication: true
        },
        {
          feature: 'Security Focus',
          marketing: false,
          utility: false,
          authentication: true
        }
      ]
    }
  ];

  const renderValue = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
      ) : (
        <XCircle className="w-5 h-5 text-gray-300 mx-auto" />
      );
    }
    return <span className="text-sm text-gray-700">{value}</span>;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Marketing':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Utility':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Authentication':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <GitCompare className="w-8 h-8 text-indigo-600" />
          Template Category Comparison
        </h1>
        <p className="text-gray-600 mt-2">
          Compare features across Marketing, Utility, and Authentication templates
        </p>
      </div>

      {/* Category Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-purple-900 mb-3">Marketing</h3>
          <p className="text-sm text-purple-700 mb-4">
            Promotional messages, campaigns, and product announcements
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-purple-600" />
              <span>Promotional content</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-purple-600" />
              <span>Tier-based limits</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-purple-600" />
              <span>Quality tracking</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-blue-900 mb-3">Utility</h3>
          <p className="text-sm text-blue-700 mb-4">
            Transactional messages, order updates, and service notifications
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600" />
              <span>Transactional only</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600" />
              <span>Unlimited sending</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600" />
              <span>No quality tracking</span>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-green-900 mb-3">Authentication</h3>
          <p className="text-sm text-green-700 mb-4">
            OTP codes, password resets, and security alerts
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Security-focused</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Fastest approval</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Copy code button</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Comparison Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Feature
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-purple-900">
                  Marketing
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-blue-900">
                  Utility
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-green-900">
                  Authentication
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((category, categoryIndex) => (
                <Fragment key={categoryIndex}>
                  <tr className="bg-gray-100">
                    <td colSpan={4} className="px-6 py-3 text-sm font-semibold text-gray-900">
                      {category.name}
                    </td>
                  </tr>
                  {category.features.map((feature, featureIndex) => (
                    <tr
                      key={featureIndex}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-900">{feature.feature}</span>
                          {feature.description && (
                            <div className="group relative">
                              <Info className="w-4 h-4 text-gray-400 cursor-help" />
                              <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
                                {feature.description}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center bg-purple-50">
                        {renderValue(feature.marketing)}
                      </td>
                      <td className="px-6 py-4 text-center bg-blue-50">
                        {renderValue(feature.utility)}
                      </td>
                      <td className="px-6 py-4 text-center bg-green-50">
                        {renderValue(feature.authentication)}
                      </td>
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Differences */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-purple-900 mb-3">When to Use Marketing</h3>
          <ul className="space-y-2 text-sm text-purple-800">
            <li>• Product launches and announcements</li>
            <li>• Sales and promotions</li>
            <li>• Event invitations</li>
            <li>• Newsletter content</li>
            <li>• Brand awareness campaigns</li>
          </ul>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">When to Use Utility</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Order confirmations</li>
            <li>• Shipping updates</li>
            <li>• Appointment reminders</li>
            <li>• Payment receipts</li>
            <li>• Account notifications</li>
          </ul>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-3">When to Use Authentication</h3>
          <ul className="space-y-2 text-sm text-green-800">
            <li>• OTP verification codes</li>
            <li>• Password reset requests</li>
            <li>• Login alerts</li>
            <li>• Security notifications</li>
            <li>• Account verification</li>
          </ul>
        </div>
      </div>

      {/* Important Notes */}
      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-yellow-900 mb-3 flex items-center gap-2">
          <Info className="w-5 h-5" />
          Important Notes
        </h3>
        <ul className="space-y-2 text-sm text-yellow-800">
          <li>• <strong>Marketing templates</strong> count towards daily tier limits</li>
          <li>• <strong>Utility and Authentication</strong> templates have unlimited sending</li>
          <li>• <strong>Marketing templates</strong> require quality score monitoring</li>
          <li>• <strong>Authentication templates</strong> have fastest approval times</li>
          <li>• Choose the correct category to avoid rejection</li>
          <li>• Cannot change category after template creation</li>
        </ul>
      </div>
    </div>
  );
};

export default TemplateComparison;
