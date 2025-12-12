import { useState } from 'react';
import { Settings, Activity, BarChart3, Phone } from 'lucide-react';
import CallSettings from './CallSettings';
import SipSettings from './SipSettings';
import SipStatus from './SipStatus';
import CallLimits from './CallLimits';
import CallQualityMonitor from './CallQualityMonitor';
import CallAnalytics from './CallAnalytics';

type TabType = 'settings' | 'sip' | 'status' | 'quality' | 'limits' | 'analytics';

const CallSettingsUnified = () => {
  const [activeTab, setActiveTab] = useState<TabType>('settings');

  const tabs = [
    { id: 'settings' as TabType, label: 'Call Settings', icon: Settings },
    { id: 'sip' as TabType, label: 'SIP Settings', icon: Phone },
    { id: 'status' as TabType, label: 'SIP Status', icon: Activity },
    { id: 'quality' as TabType, label: 'Quality', icon: Activity },
    { id: 'limits' as TabType, label: 'Limits', icon: BarChart3 },
    { id: 'analytics' as TabType, label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Call Settings & Analytics</h1>
        <p className="mt-2 text-gray-600">
          Manage all calling settings, SIP configuration, and view analytics in one place
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center py-4 px-1 border-b-2 font-medium text-sm
                  ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="w-5 h-5 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'settings' && <CallSettings />}
        {activeTab === 'sip' && <SipSettings />}
        {activeTab === 'status' && <SipStatus />}
        {activeTab === 'quality' && <CallQualityMonitor />}
        {activeTab === 'limits' && <CallLimits />}
        {activeTab === 'analytics' && <CallAnalytics />}
      </div>
    </div>
  );
};

export default CallSettingsUnified;
