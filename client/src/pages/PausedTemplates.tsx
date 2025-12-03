import { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw, Search } from 'lucide-react';
import { templateService } from '../services/api';
import PausedBadge from '../components/PausedBadge';

const PausedTemplates = () => {
  const [pausedTemplates, setPausedTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadPausedTemplates();
  }, []);

  const loadPausedTemplates = async () => {
    setLoading(true);
    try {
      const data = await templateService.getAllTemplatesPausingStatus();
      setPausedTemplates(data.templates || []);
    } catch (error) {
      console.error('Failed to load paused templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = pausedTemplates.filter((template: any) =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
            Paused Templates
          </h1>
          <p className="text-gray-600 mt-2">
            Templates that have been paused by WhatsApp due to quality issues
          </p>
        </div>
        <button
          onClick={loadPausedTemplates}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search paused templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-700 font-medium">Total Paused</p>
          <p className="text-3xl font-bold text-yellow-900">{pausedTemplates.length}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700 font-medium">High Priority</p>
          <p className="text-3xl font-bold text-red-900">
            {pausedTemplates.filter((t: any) => t.paused_info?.severity === 'error').length}
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-700 font-medium">Needs Review</p>
          <p className="text-3xl font-bold text-blue-900">
            {pausedTemplates.filter((t: any) => t.paused_info?.severity === 'warning').length}
          </p>
        </div>
      </div>

      {/* Templates List */}
      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">Loading paused templates...</p>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <AlertTriangle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">
            {searchTerm ? 'No paused templates match your search' : 'No paused templates found'}
          </p>
          <p className="text-gray-400 text-sm mt-2">
            {!searchTerm && 'Great! All your templates are active.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTemplates.map((template: any) => (
            <div key={template.id} className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold">{template.name}</h3>
                    <PausedBadge pauseInfo={template.paused_info} size="md" />
                  </div>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>Language: {template.language}</span>
                    <span>Category: {template.category}</span>
                    {template.quality_score && (
                      <span className={`font-medium ${
                        template.quality_score.score === 'LOW' ? 'text-red-600' :
                        template.quality_score.score === 'MEDIUM' ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        Quality: {template.quality_score.score}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Pause Information */}
              {template.paused_info && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-sm font-medium text-yellow-900 mb-2">Pause Details:</p>
                  <div className="space-y-1 text-sm text-yellow-800">
                    <p><strong>Status:</strong> {template.paused_info.status}</p>
                    <p><strong>Reason:</strong> {template.paused_info.reason}</p>
                    {template.paused_info.paused_date && (
                      <p><strong>Paused Since:</strong> {new Date(template.paused_info.paused_date).toLocaleString()}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Template Body */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Template Content:</p>
                <p className="text-gray-800 whitespace-pre-wrap">
                  {template.components?.find((c: any) => c.type === 'BODY')?.text || 'No content'}
                </p>
              </div>

              {/* Recommendations */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 mb-2">📋 Recommended Actions:</p>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Review template content for policy compliance</li>
                  <li>Check for spam-like language or excessive capitalization</li>
                  <li>Ensure template provides clear value to recipients</li>
                  <li>Consider creating a new template with improved content</li>
                  <li>Contact WhatsApp support if you believe this is an error</li>
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PausedTemplates;
