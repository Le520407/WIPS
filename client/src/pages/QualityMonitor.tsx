import { useState, useEffect } from 'react';
import { Shield, RefreshCw, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { templateService } from '../services/api';

const QualityMonitor = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    loadQualityData();
  }, []);

  const loadQualityData = async () => {
    setLoading(true);
    try {
      const data = await templateService.getTemplates(true);
      setTemplates(data.templates || []);
    } catch (error) {
      console.error('Failed to load quality data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getQualityScore = (template: any) => {
    return template.quality_score?.score || 'UNKNOWN';
  };

  const getQualityColor = (score: string) => {
    switch (score) {
      case 'HIGH':
        return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' };
      case 'MEDIUM':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' };
      case 'LOW':
        return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' };
    }
  };

  const getQualityIcon = (score: string) => {
    switch (score) {
      case 'HIGH':
        return <TrendingUp className="w-5 h-5" />;
      case 'MEDIUM':
        return <Minus className="w-5 h-5" />;
      case 'LOW':
        return <TrendingDown className="w-5 h-5" />;
      default:
        return <Shield className="w-5 h-5" />;
    }
  };

  const filteredTemplates = templates.filter((template: any) => {
    if (filter === 'ALL') return true;
    return getQualityScore(template) === filter;
  });

  const qualityStats = {
    HIGH: templates.filter((t: any) => getQualityScore(t) === 'HIGH').length,
    MEDIUM: templates.filter((t: any) => getQualityScore(t) === 'MEDIUM').length,
    LOW: templates.filter((t: any) => getQualityScore(t) === 'LOW').length,
    UNKNOWN: templates.filter((t: any) => getQualityScore(t) === 'UNKNOWN').length
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            Quality Monitor
          </h1>
          <p className="text-gray-600 mt-2">
            Track template quality scores to maintain high delivery rates
          </p>
        </div>
        <button
          onClick={loadQualityData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Quality Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-green-700 font-medium">High Quality</p>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-900">{qualityStats.HIGH}</p>
          <p className="text-xs text-green-600 mt-1">Excellent performance</p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-yellow-700 font-medium">Medium Quality</p>
            <Minus className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-3xl font-bold text-yellow-900">{qualityStats.MEDIUM}</p>
          <p className="text-xs text-yellow-600 mt-1">Monitor closely</p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-red-700 font-medium">Low Quality</p>
            <TrendingDown className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-red-900">{qualityStats.LOW}</p>
          <p className="text-xs text-red-600 mt-1">Needs attention</p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-700 font-medium">Unknown</p>
            <Shield className="w-5 h-5 text-gray-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{qualityStats.UNKNOWN}</p>
          <p className="text-xs text-gray-600 mt-1">Pending evaluation</p>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-6">
        {['ALL', 'HIGH', 'MEDIUM', 'LOW', 'UNKNOWN'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border hover:bg-gray-50'
            }`}
          >
            {f} {f !== 'ALL' && `(${qualityStats[f as keyof typeof qualityStats]})`}
          </button>
        ))}
      </div>

      {/* Templates List */}
      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">Loading quality data...</p>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Shield className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">No templates found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template: any) => {
            const score = getQualityScore(template);
            const colors = getQualityColor(score);
            
            return (
              <div key={template.id} className={`bg-white rounded-lg shadow p-6 border-l-4 ${colors.border}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{template.name}</h3>
                    <p className="text-sm text-gray-500">{template.language}</p>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${colors.bg} ${colors.text}`}>
                    {getQualityIcon(score)}
                    <span className="font-medium text-sm">{score}</span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium">{template.category}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium ${
                      template.status === 'APPROVED' ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {template.status}
                    </span>
                  </div>
                  {template.quality_score?.date && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Last Updated:</span>
                      <span className="text-gray-800">
                        {new Date(template.quality_score.date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Recommendations */}
                {score === 'LOW' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-xs font-medium text-red-900 mb-1">⚠️ Action Required</p>
                    <p className="text-xs text-red-700">
                      This template may be paused soon. Review content and improve quality.
                    </p>
                  </div>
                )}
                {score === 'MEDIUM' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-xs font-medium text-yellow-900 mb-1">💡 Tip</p>
                    <p className="text-xs text-yellow-700">
                      Monitor user feedback and optimize content for better engagement.
                    </p>
                  </div>
                )}
                {score === 'HIGH' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-xs font-medium text-green-900 mb-1">✅ Great Job!</p>
                    <p className="text-xs text-green-700">
                      This template is performing well. Keep up the good work!
                    </p>
                  </div>
                )}
                {score === 'UNKNOWN' && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-900 mb-1">ℹ️ Info</p>
                    <p className="text-xs text-gray-700">
                      Quality score will be available after the template receives enough usage.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default QualityMonitor;
