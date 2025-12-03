import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, FolderOpen, RefreshCw, BarChart3, TrendingUp } from 'lucide-react';
import { templateService } from '../services/api';

const TemplateGroups = () => {
  const [groups, setGroups] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    templateIds: [] as (string | number)[]
  });

  useEffect(() => {
    loadGroups();
    loadTemplates();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const isDemoMode = localStorage.getItem('demo_mode') === 'true';
      
      if (isDemoMode) {
        // Demo mode
        setGroups([
          {
            id: '1',
            name: 'Black Friday 2024',
            description: 'All Black Friday promotion templates',
            whatsapp_business_templates: { data: [{ id: '1', name: 'bf_announcement' }] }
          },
          {
            id: '2',
            name: 'Welcome Series',
            description: 'New user onboarding templates',
            whatsapp_business_templates: { data: [{ id: '2', name: 'welcome_message' }] }
          }
        ]);
      } else {
        const data = await templateService.listGroups();
        setGroups(data.groups || []);
      }
    } catch (error) {
      console.error('Failed to load groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const data = await templateService.getTemplates();
      setTemplates(data.templates || []);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const handleCreateGroup = async () => {
    try {
      if (!newGroup.name) {
        alert('Please enter a group name');
        return;
      }

      if (newGroup.templateIds.length === 0) {
        alert('Please select at least one template');
        return;
      }

      const isDemoMode = localStorage.getItem('demo_mode') === 'true';
      
      if (isDemoMode) {
        alert('✅ Demo Mode: Group created successfully!\n\n(In production, this would create a real template group)');
        setShowModal(false);
        setNewGroup({ name: '', description: '', templateIds: [] });
        return;
      }

      await templateService.createGroup(
        newGroup.name,
        newGroup.description,
        newGroup.templateIds
      );

      alert('✅ Template group created successfully!');
      setShowModal(false);
      setNewGroup({ name: '', description: '', templateIds: [] });
      loadGroups();
    } catch (error: any) {
      console.error('Failed to create group:', error);
      
      // Extract error message
      let errorMessage = 'Unknown error';
      if (error.response?.data?.details) {
        errorMessage = typeof error.response.data.details === 'string' 
          ? error.response.data.details 
          : JSON.stringify(error.response.data.details);
      } else if (error.response?.data?.error) {
        errorMessage = typeof error.response.data.error === 'string'
          ? error.response.data.error
          : JSON.stringify(error.response.data.error);
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`❌ Failed to create group: ${errorMessage}`);
    }
  };

  const handleDeleteGroup = async (groupId: string, groupName: string) => {
    if (!confirm(`Are you sure you want to delete "${groupName}"?\n\nThis will not delete the templates themselves.`)) {
      return;
    }

    try {
      const isDemoMode = localStorage.getItem('demo_mode') === 'true';
      
      if (isDemoMode) {
        alert('✅ Demo Mode: Group deleted successfully!');
        loadGroups();
        return;
      }

      await templateService.deleteGroup(groupId);
      alert('✅ Template group deleted successfully!');
      loadGroups();
    } catch (error: any) {
      console.error('Failed to delete group:', error);
      alert(`❌ Failed to delete group: ${error.response?.data?.details || error.message}`);
    }
  };

  const toggleTemplateSelection = (templateId: string | number) => {
    setNewGroup(prev => ({
      ...prev,
      templateIds: prev.templateIds.includes(templateId)
        ? prev.templateIds.filter(id => id !== templateId)
        : [...prev.templateIds, templateId]
    }));
  };

  const handleViewAnalytics = async (group: any) => {
    setSelectedGroup(group);
    setShowAnalytics(true);
    setLoadingAnalytics(true);
    
    try {
      const isDemoMode = localStorage.getItem('demo_mode') === 'true';
      
      if (isDemoMode) {
        // Demo mode - show mock data
        setTimeout(() => {
          setAnalytics({
            sent: 1250,
            delivered: 1180,
            read: 890,
            clicked: 245,
            deliveryRate: 94.4,
            readRate: 71.2,
            clickRate: 19.6
          });
          setLoadingAnalytics(false);
        }, 500);
      } else {
        const data = await templateService.getGroupAnalytics(group.id);
        setAnalytics(data.analytics);
        setLoadingAnalytics(false);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
      setLoadingAnalytics(false);
      alert('Failed to load analytics. This feature may not be available yet.');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Template Groups</h1>
          <p className="text-gray-600 mt-1">Organize and track template performance by project</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadGroups}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus className="w-4 h-4" />
            Create Group
          </button>
        </div>
      </div>

      {/* Groups List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
            <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No template groups yet</p>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Create Your First Group
            </button>
          </div>
        ) : (
          groups.map((group) => (
            <div key={group.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{group.name}</h3>
                  <p className="text-sm text-gray-600">{group.description || 'No description'}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewAnalytics(group)}
                    className="text-blue-600 hover:text-blue-700 p-1"
                    title="View analytics"
                  >
                    <BarChart3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteGroup(group.id, group.name)}
                    className="text-red-600 hover:text-red-700 p-1"
                    title="Delete group"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Templates:</span>
                  <span className="font-semibold text-gray-900">
                    {group.whatsapp_business_templates?.data?.length || 0}
                  </span>
                </div>
                {group.creation_time && (
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-gray-600">Created:</span>
                    <span className="text-gray-900">
                      {new Date(group.creation_time).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Analytics Modal */}
      {showAnalytics && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedGroup.name}</h2>
                  <p className="text-gray-600 mt-1">Performance Analytics</p>
                </div>
                <button
                  onClick={() => {
                    setShowAnalytics(false);
                    setSelectedGroup(null);
                    setAnalytics(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {loadingAnalytics ? (
                <div className="text-center py-12">
                  <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Loading analytics...</p>
                </div>
              ) : analytics ? (
                <div className="space-y-6">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-sm text-blue-600 font-medium mb-1">Sent</div>
                      <div className="text-2xl font-bold text-blue-900">{analytics.sent?.toLocaleString() || 0}</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="text-sm text-green-600 font-medium mb-1">Delivered</div>
                      <div className="text-2xl font-bold text-green-900">{analytics.delivered?.toLocaleString() || 0}</div>
                      <div className="text-xs text-green-600 mt-1">{analytics.deliveryRate?.toFixed(1) || 0}%</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="text-sm text-purple-600 font-medium mb-1">Read</div>
                      <div className="text-2xl font-bold text-purple-900">{analytics.read?.toLocaleString() || 0}</div>
                      <div className="text-xs text-purple-600 mt-1">{analytics.readRate?.toFixed(1) || 0}%</div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <div className="text-sm text-orange-600 font-medium mb-1">Clicked</div>
                      <div className="text-2xl font-bold text-orange-900">{analytics.clicked?.toLocaleString() || 0}</div>
                      <div className="text-xs text-orange-600 mt-1">{analytics.clickRate?.toFixed(1) || 0}%</div>
                    </div>
                  </div>

                  {/* Performance Summary */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      Performance Summary
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Delivery Success Rate</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${analytics.deliveryRate || 0}%` }}
                            />
                          </div>
                          <span className="font-semibold text-gray-900 w-12 text-right">
                            {analytics.deliveryRate?.toFixed(1) || 0}%
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Read Rate</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-purple-600 h-2 rounded-full" 
                              style={{ width: `${analytics.readRate || 0}%` }}
                            />
                          </div>
                          <span className="font-semibold text-gray-900 w-12 text-right">
                            {analytics.readRate?.toFixed(1) || 0}%
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Click-Through Rate</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-orange-600 h-2 rounded-full" 
                              style={{ width: `${analytics.clickRate || 0}%` }}
                            />
                          </div>
                          <span className="font-semibold text-gray-900 w-12 text-right">
                            {analytics.clickRate?.toFixed(1) || 0}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Insights */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">💡 Insights</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      {analytics.deliveryRate >= 95 && (
                        <li>✓ Excellent delivery rate - your templates are reaching users successfully</li>
                      )}
                      {analytics.readRate >= 70 && (
                        <li>✓ Strong engagement - users are reading your messages</li>
                      )}
                      {analytics.clickRate >= 15 && (
                        <li>✓ Good click-through rate - your CTAs are effective</li>
                      )}
                      {analytics.deliveryRate < 90 && (
                        <li>⚠ Consider reviewing your recipient list for invalid numbers</li>
                      )}
                      {analytics.readRate < 50 && (
                        <li>⚠ Low read rate - try improving your message content or timing</li>
                      )}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  No analytics data available
                </div>
              )}

              <div className="mt-6">
                <button
                  onClick={() => {
                    setShowAnalytics(false);
                    setSelectedGroup(null);
                    setAnalytics(null);
                  }}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Group Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Create Template Group</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Group Name *
                  </label>
                  <input
                    type="text"
                    value={newGroup.name}
                    onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                    placeholder="e.g., Black Friday 2024"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newGroup.description}
                    onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                    placeholder="Describe the purpose of this group..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Templates * ({newGroup.templateIds.length} selected)
                  </label>
                  <div className="border border-gray-300 rounded-lg max-h-64 overflow-y-auto">
                    {templates.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No templates available. Create templates first.
                      </div>
                    ) : (
                      templates.map((template) => (
                        <label
                          key={template.id}
                          className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                        >
                          <input
                            type="checkbox"
                            checked={newGroup.templateIds.includes(template.template_id || template.id)}
                            onChange={() => toggleTemplateSelection(template.template_id || template.id)}
                            className="mr-3"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{template.name}</div>
                            <div className="text-sm text-gray-600">
                              {template.category} • {template.language} • {template.status}
                            </div>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setNewGroup({ name: '', description: '', templateIds: [] });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateGroup}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Create Group
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateGroups;
