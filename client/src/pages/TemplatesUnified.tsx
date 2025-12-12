import { useState } from 'react';
import { FileText, FolderOpen, Shield, AlertTriangle } from 'lucide-react';
import Templates from './Templates';
import TemplateGroups from './TemplateGroups';
import QualityMonitor from './QualityMonitor';
import PausedTemplates from './PausedTemplates';

type TabType = 'templates' | 'groups' | 'quality' | 'paused';

const TemplatesUnified = () => {
  const [activeTab, setActiveTab] = useState<TabType>('templates');

  const tabs = [
    { id: 'templates' as TabType, label: 'Templates', icon: FileText },
    { id: 'groups' as TabType, label: 'Groups', icon: FolderOpen },
    { id: 'quality' as TabType, label: 'Quality Monitor', icon: Shield },
    { id: 'paused' as TabType, label: 'Paused Templates', icon: AlertTriangle },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Template Management</h1>
        <p className="mt-2 text-gray-600">
          Manage message templates, groups, quality monitoring, and paused templates
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
        {activeTab === 'templates' && <Templates />}
        {activeTab === 'groups' && <TemplateGroups />}
        {activeTab === 'quality' && <QualityMonitor />}
        {activeTab === 'paused' && <PausedTemplates />}
      </div>
    </div>
  );
};

export default TemplatesUnified;
