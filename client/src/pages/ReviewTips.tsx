import { CheckCircle, XCircle, Clock, AlertTriangle, BookOpen, Lightbulb } from 'lucide-react';

const ReviewTips = () => {
  const statuses = [
    {
      name: 'PENDING',
      icon: Clock,
      color: 'yellow',
      description: 'Template is under review',
      action: 'Wait 24-48 hours for review',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800'
    },
    {
      name: 'APPROVED',
      icon: CheckCircle,
      color: 'green',
      description: 'Template is ready to use',
      action: 'Start sending messages',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800'
    },
    {
      name: 'REJECTED',
      icon: XCircle,
      color: 'red',
      description: 'Template doesn\'t meet policies',
      action: 'Review reason and create new template',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800'
    },
    {
      name: 'PAUSED',
      icon: AlertTriangle,
      color: 'orange',
      description: 'Template was paused due to quality',
      action: 'Check quality score and improve',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-800'
    }
  ];

  const bestPractices = [
    {
      title: 'Be Clear and Concise',
      tips: [
        'Use simple, direct language',
        'Avoid jargon and complex terms',
        'Keep messages focused',
        'One main message per template'
      ]
    },
    {
      title: 'Follow Policies',
      tips: [
        'Review WhatsApp Business Policy',
        'No prohibited content',
        'Be honest and transparent',
        'Respect user privacy'
      ]
    },
    {
      title: 'Quality Content',
      tips: [
        'Proofread for errors',
        'Use proper grammar',
        'Appropriate formatting',
        'Professional tone'
      ]
    },
    {
      title: 'Provide Value',
      tips: [
        'Relevant to recipients',
        'Timely information',
        'Clear call-to-action',
        'Helpful content'
      ]
    }
  ];

  const commonMistakes = [
    {
      mistake: 'Excessive Capitalization',
      example: 'URGENT!!! ACT NOW!!!',
      fix: 'Use normal capitalization'
    },
    {
      mistake: 'Too Many Emojis',
      example: '🔥🔥🔥 SALE 🔥🔥🔥',
      fix: 'Use emojis sparingly'
    },
    {
      mistake: 'Fake Urgency',
      example: 'LIMITED TIME ONLY!!!',
      fix: 'Be honest about timing'
    },
    {
      mistake: 'Misleading Content',
      example: 'You\'ve WON a prize!',
      fix: 'Be truthful and clear'
    }
  ];

  const categoryTips = [
    {
      category: 'Marketing',
      icon: '📢',
      reviewTime: '48-72 hours',
      tips: [
        'Include opt-out option',
        'Clear value proposition',
        'Honest and transparent',
        'Not misleading'
      ]
    },
    {
      category: 'Utility',
      icon: '📦',
      reviewTime: '24-48 hours',
      tips: [
        'Transactional nature',
        'Relevant to user action',
        'Timely information',
        'Clear purpose'
      ]
    },
    {
      category: 'Authentication',
      icon: '🔐',
      reviewTime: '12-24 hours',
      tips: [
        'Security-focused',
        'Time-sensitive',
        'Clear instructions',
        'No marketing content'
      ]
    }
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-blue-600" />
          Template Review Process
        </h1>
        <p className="text-gray-600 mt-2">
          Learn how to get your templates approved faster
        </p>
      </div>

      {/* Template Statuses */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Template Statuses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {statuses.map((status) => {
            const Icon = status.icon;
            return (
              <div
                key={status.name}
                className={`${status.bgColor} border ${status.borderColor} rounded-lg p-6`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <Icon className={`w-6 h-6 ${status.textColor}`} />
                  <h3 className={`text-lg font-semibold ${status.textColor}`}>
                    {status.name}
                  </h3>
                </div>
                <p className="text-sm text-gray-700 mb-2">{status.description}</p>
                <p className={`text-sm font-medium ${status.textColor}`}>
                  → {status.action}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category-Specific Tips */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Category-Specific Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categoryTips.map((cat) => (
            <div key={cat.category} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="text-4xl mb-3">{cat.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{cat.category}</h3>
              <p className="text-sm text-gray-600 mb-3">
                Review Time: <span className="font-medium">{cat.reviewTime}</span>
              </p>
              <ul className="space-y-1">
                {cat.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Best Practices */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Lightbulb className="w-6 h-6 text-yellow-600" />
          Best Practices
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bestPractices.map((practice) => (
            <div key={practice.title} className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                {practice.title}
              </h3>
              <ul className="space-y-2">
                {practice.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-blue-800">
                    <span className="mt-1">✓</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Common Mistakes */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Common Mistakes to Avoid</h2>
        <div className="space-y-4">
          {commonMistakes.map((item, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Mistake:</p>
                  <p className="font-semibold text-red-600">{item.mistake}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Bad Example:</p>
                  <p className="font-mono text-sm bg-red-50 p-2 rounded">{item.example}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Fix:</p>
                  <p className="font-semibold text-green-600">{item.fix}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submission Checklist */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <CheckCircle className="w-6 h-6 text-green-600" />
          Pre-Submission Checklist
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            'Content is clear and concise',
            'No policy violations',
            'Proper grammar and spelling',
            'Appropriate category selected',
            'Variables are necessary',
            'Formatting is correct',
            'Opt-out option (for marketing)',
            'Business name is clear',
            'Call-to-action is specific',
            'Tested with example values'
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <input type="checkbox" className="w-4 h-4" />
              <span className="text-sm">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Resources */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3">📚 Additional Resources</h3>
        <ul className="space-y-2 text-sm">
          <li>
            <a
              href="https://www.whatsapp.com/legal/business-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              WhatsApp Business Policy →
            </a>
          </li>
          <li>
            <a
              href="https://developers.facebook.com/docs/whatsapp/message-templates/guidelines"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Template Guidelines →
            </a>
          </li>
          <li className="text-gray-700">
            Internal Guide: docs/12-03v2/TEMPLATE_REVIEW_PROCESS.md
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ReviewTips;
