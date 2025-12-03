import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Eye, RefreshCw } from 'lucide-react';
import { templateService } from '../services/api';
import PausedBadge from '../components/PausedBadge';

const Templates = () => {
  const [templates, setTemplates] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    language: 'en',
    category: 'MARKETING',
    body: ''
  });
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);

  const getTemplateBody = (template: any) => {
    // Extract body text from components
    if (template.body) return template.body;
    if (template.components) {
      const bodyComponent = template.components.find((c: any) => c.type === 'BODY');
      return bodyComponent?.text || '';
    }
    return '';
  };

  const getTemplatePreview = (body: string) => {
    // Replace variables with example values
    if (!body) return '';
    return body.replace(/\{\{(\d+)\}\}/g, (_, num) => `[Example ${num}]`);
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    const isDemoMode = localStorage.getItem('demo_mode') === 'true';
    
    if (isDemoMode) {
      // Demo mode: show simulated templates
      setTemplates([
        {
          id: '1',
          name: 'welcome_message',
          language: 'en',
          category: 'MARKETING',
          status: 'APPROVED',
          body: 'Welcome to our service! We are glad to have you.'
        },
        {
          id: '2',
          name: 'order_confirmation',
          language: 'en',
          category: 'UTILITY',
          status: 'APPROVED',
          body: 'Your order has been confirmed. Order ID: {{1}}'
        },
        {
          id: '3',
          name: 'shipping_update',
          language: 'en',
          category: 'UTILITY',
          status: 'PENDING',
          body: 'Your order is on the way! Track it here: {{1}}'
        },
        {
          id: '4',
          name: 'promotion_alert',
          language: 'zh_CN',
          category: 'MARKETING',
          status: 'APPROVED',
          body: '限时优惠！立即购买享受8折优惠。'
        }
      ] as any);
    } else {
      templateService.getTemplates()
        .then((data: any) => setTemplates(data.templates))
        .catch((err: any) => console.error(err));
    }
  };

  const handleCreateTemplate = async () => {
    try {
      // Validate template body
      const textWithoutParams = newTemplate.body.replace(/\{\{\d+\}\}/g, '').trim();
      if (!textWithoutParams) {
        alert('❌ Template body must contain actual text, not just parameters.\n\nExample: "Hello {{1}}, welcome to our service!"');
        return;
      }

      // Check for more than 2 consecutive newlines
      if (/\n\n\n/.test(newTemplate.body)) {
        alert('❌ Template body cannot have more than two consecutive newline characters.');
        return;
      }

      const isDemoMode = localStorage.getItem('demo_mode') === 'true';
      
      if (isDemoMode) {
        // Add template to demo list
        const newTemp = {
          id: Date.now().toString(),
          name: newTemplate.name,
          language: newTemplate.language,
          category: newTemplate.category,
          status: 'PENDING',
          body: newTemplate.body
        };
        setTemplates([...templates, newTemp] as any);
        setShowModal(false);
        setNewTemplate({ name: '', language: 'en', category: 'MARKETING', body: '' });
        alert('✅ Demo Mode: Template created!\n\nIt will appear as PENDING status.');
      } else {
        await templateService.createTemplate({
          name: newTemplate.name,
          language: newTemplate.language,
          category: newTemplate.category,
          components: [
            {
              type: 'BODY',
              text: newTemplate.body
            }
          ]
        });
        setShowModal(false);
        setNewTemplate({ name: '', language: 'en', category: 'MARKETING', body: '' });
        loadTemplates();
        alert('✅ Template created successfully!\n\nIt will be reviewed by WhatsApp and appear as PENDING until approved.');
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Failed to create template';
      alert('❌ ' + errorMsg);
    }
  };

  const handleSyncTemplates = async () => {
    const isDemoMode = localStorage.getItem('demo_mode') === 'true';
    
    if (isDemoMode) {
      alert('✅ Demo Mode: Templates synced!\n\nIn production, this would fetch the latest status from WhatsApp API.');
      return;
    }

    setSyncing(true);
    try {
      // Fetch templates with sync=true to update statuses from WhatsApp API
      const data = await templateService.getTemplates(true);
      setTemplates(data.templates);
      alert('✅ Templates synced successfully!\n\nAll template statuses have been updated from WhatsApp.');
    } catch (error) {
      console.error('Sync error:', error);
      alert('❌ Failed to sync templates');
    } finally {
      setSyncing(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    const isDemoMode = localStorage.getItem('demo_mode') === 'true';
    
    if (isDemoMode) {
      if (confirm('Delete this template?')) {
        setTemplates(templates.filter((t: any) => t.id !== templateId));
        alert('✅ Demo Mode: Template deleted!');
      }
    } else {
      const template = templates.find((t: any) => t.id === templateId);
      const templateName = template?.name || 'this template';
      
      if (confirm(`Are you sure you want to delete "${templateName}"?\n\nThis will delete it from both your platform and WhatsApp/Meta.`)) {
        try {
          await templateService.deleteTemplate(templateId);
          
          // Reload templates from backend to ensure sync
          loadTemplates();
          
          alert(`✅ Template "${templateName}" deleted successfully!\n\nDeleted from:\n• Your platform database\n• WhatsApp/Meta account`);
        } catch (error: any) {
          console.error('Delete template error:', error);
          const errorMsg = error.response?.data?.error || error.message || 'Unknown error';
          alert(`❌ Failed to delete template\n\nError: ${errorMsg}`);
        }
      }
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Message Templates</h1>
        <div className="flex gap-3">
          <button
            onClick={handleSyncTemplates}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync Status'}
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus className="w-5 h-5" />
            Create Template
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.length === 0 ? (
          <p className="col-span-full text-center text-gray-500">No templates</p>
        ) : (
          templates.map((template: any) => (
            <div key={template.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{template.name}</h3>
                  <span className="text-sm text-gray-500">{template.language}</span>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <span className={`px-2 py-1 text-xs rounded ${
                    template.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {template.status}
                  </span>
                  {template.quality_score && (
                    <span className={`px-2 py-1 text-xs rounded ${
                      template.quality_score.score === 'HIGH' ? 'bg-green-100 text-green-800' :
                      template.quality_score.score === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                      template.quality_score.score === 'LOW' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {template.quality_score.score}
                    </span>
                  )}
                  {template.paused_info && <PausedBadge pauseInfo={template.paused_info} size="sm" />}
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-2">{template.category}</p>
              
              {/* Template Body Preview */}
              <div className="mb-4 p-3 bg-gray-50 rounded border text-sm text-gray-700">
                <p className="line-clamp-3">{getTemplateBody(template)}</p>
              </div>
              
              {/* Variable Count */}
              {getTemplateBody(template) && getTemplateBody(template).match(/\{\{\d+\}\}/g) && (
                <p className="text-xs text-blue-600 mb-3">
                  {getTemplateBody(template).match(/\{\{\d+\}\}/g).length} variable(s)
                </p>
              )}
              
              <div className="flex gap-2">
                <button 
                  onClick={() => setPreviewTemplate(template)}
                  className="flex-1 px-3 py-2 border rounded hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  title="Preview template"
                >
                  <Eye className="w-4 h-4 mx-auto text-blue-600" />
                </button>
                <button 
                  className="flex-1 px-3 py-2 border rounded hover:bg-gray-50"
                  title="Edit template"
                >
                  <Edit className="w-4 h-4 mx-auto" />
                </button>
                <button 
                  onClick={() => handleDeleteTemplate(template.id)}
                  className="flex-1 px-3 py-2 border border-red-300 text-red-600 rounded hover:bg-red-50"
                  title="Delete template"
                >
                  <Trash2 className="w-4 h-4 mx-auto" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Template Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Create New Template</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Template Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., order_confirmation"
                    value={newTemplate.name}
                    onChange={(e: any) => setNewTemplate({...newTemplate, name: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Use lowercase with underscores</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Language
                  </label>
                  <select
                    value={newTemplate.language}
                    onChange={(e: any) => setNewTemplate({...newTemplate, language: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="en">English</option>
                    <option value="zh_CN">Chinese (Simplified)</option>
                    <option value="zh_TW">Chinese (Traditional)</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newTemplate.category}
                    onChange={(e: any) => setNewTemplate({...newTemplate, category: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="MARKETING">Marketing</option>
                    <option value="UTILITY">Utility</option>
                    <option value="AUTHENTICATION">Authentication</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {newTemplate.category === 'MARKETING' && 'Promotional messages'}
                    {newTemplate.category === 'UTILITY' && 'Transactional messages'}
                    {newTemplate.category === 'AUTHENTICATION' && 'OTP and verification'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Template Content
                  </label>
                  <textarea
                    placeholder="Example: Hello {{1}}, your order {{2}} has been confirmed!"
                    value={newTemplate.body}
                    onChange={(e: any) => setNewTemplate({...newTemplate, body: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg h-40 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-500">
                      • Use {`{{1}}, {{2}}, {{3}}`} for dynamic content
                    </p>
                    <p className="text-xs text-red-500">
                      • Must contain actual text, not just parameters
                    </p>
                    <p className="text-xs text-gray-500">
                      • Max 2 consecutive line breaks
                    </p>
                  </div>
                </div>

                {/* Quick Examples */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs font-medium text-blue-900 mb-2">Quick Examples:</p>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setNewTemplate({...newTemplate, body: 'Hello {{1}}, welcome to our service!'})}
                      className="w-full text-left text-xs text-blue-700 hover:bg-blue-100 p-2 rounded"
                    >
                      📝 Welcome: "Hello {`{{1}}`}, welcome to our service!"
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewTemplate({...newTemplate, body: 'Your order {{1}} has been confirmed. Total: ${{2}}'})}
                      className="w-full text-left text-xs text-blue-700 hover:bg-blue-100 p-2 rounded"
                    >
                      🛒 Order: "Your order {`{{1}}`} has been confirmed. Total: ${`{{2}}`}"
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewTemplate({...newTemplate, body: 'Hi {{1}}, your verification code is {{2}}. Valid for 5 minutes.'})}
                      className="w-full text-left text-xs text-blue-700 hover:bg-blue-100 p-2 rounded"
                    >
                      🔐 OTP: "Hi {`{{1}}`}, your code is {`{{2}}`}. Valid for 5 min."
                    </button>
                  </div>
                </div>
              </div>

              {/* Right: Preview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Live Preview
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 min-h-[300px]">
                  {newTemplate.body ? (
                    <div className="space-y-4">
                      {/* Phone mockup */}
                      <div className="bg-white rounded-lg shadow-lg p-4 max-w-sm">
                        <div className="flex items-center gap-2 mb-3 pb-3 border-b">
                          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                            W
                          </div>
                          <div>
                            <p className="font-semibold text-sm">WhatsApp Business</p>
                            <p className="text-xs text-gray-500">Online</p>
                          </div>
                        </div>
                        
                        <div className="bg-green-50 rounded-lg p-3 mb-2">
                          <p className="text-sm text-gray-800 whitespace-pre-wrap">
                            {getTemplatePreview(newTemplate.body)}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date().toLocaleTimeString()}
                          </p>
                        </div>
                        
                        <div className="flex gap-2 mt-3">
                          <button className="flex-1 text-xs py-2 bg-white border rounded text-blue-600">
                            Quick Reply 1
                          </button>
                          <button className="flex-1 text-xs py-2 bg-white border rounded text-blue-600">
                            Quick Reply 2
                          </button>
                        </div>
                      </div>

                      {/* Variable info */}
                      {newTemplate.body.match(/\{\{\d+\}\}/g) && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-sm font-medium text-blue-900 mb-2">
                            Variables detected:
                          </p>
                          <ul className="text-xs text-blue-700 space-y-1">
                            {newTemplate.body.match(/\{\{\d+\}\}/g)?.map((v: string, i: number) => (
                              <li key={i}>• {v} → [Example {i + 1}]</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <p className="text-center">
                        Start typing to see preview...
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  setNewTemplate({ name: '', language: 'en', category: 'MARKETING', body: '' });
                }}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTemplate}
                disabled={!newTemplate.name || !newTemplate.body}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Template Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-lg w-full">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold">{previewTemplate.name}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {previewTemplate.language} • {previewTemplate.category}
                </p>
              </div>
              <span className={`px-3 py-1 text-sm rounded ${
                previewTemplate.status === 'APPROVED' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {previewTemplate.status}
              </span>
            </div>

            {/* Phone mockup */}
            <div className="bg-gray-100 rounded-lg p-4 mb-6">
              <div className="bg-white rounded-lg shadow-lg p-4 max-w-sm mx-auto">
                <div className="flex items-center gap-2 mb-3 pb-3 border-b">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                    W
                  </div>
                  <div>
                    <p className="font-semibold text-sm">WhatsApp Business</p>
                    <p className="text-xs text-gray-500">Online</p>
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">
                    {getTemplatePreview(getTemplateBody(previewTemplate))}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Template Details */}
            <div className="space-y-3 mb-6">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-500 mb-1">Original Content:</p>
                <p className="text-sm text-gray-800">{getTemplateBody(previewTemplate)}</p>
              </div>
              
              {getTemplateBody(previewTemplate).match(/\{\{\d+\}\}/g) && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-blue-700 mb-1">
                    Variables: {getTemplateBody(previewTemplate).match(/\{\{\d+\}\}/g).length}
                  </p>
                  <p className="text-xs text-blue-600">
                    {getTemplateBody(previewTemplate).match(/\{\{\d+\}\}/g).join(', ')}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => setPreviewTemplate(null)}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Templates;
