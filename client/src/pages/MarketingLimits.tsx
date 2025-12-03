import { useState, useEffect } from 'react';
import { TrendingUp, Shield, AlertTriangle, CheckCircle, HelpCircle, RefreshCw } from 'lucide-react';
import { templateService } from '../services/api';

const MarketingLimits = () => {
  const [tierInfo, setTierInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTierInfo();
  }, []);

  const loadTierInfo = async () => {
    setLoading(true);
    try {
      const data = await templateService.getMessagingLimitTier();
      setTierInfo(data.data);
    } catch (error) {
      console.error('Failed to load tier info:', error);
    } finally {
      setLoading(false);
    }
  };

  const getQualityIcon = (rating: string) => {
    switch (rating) {
      case 'GREEN':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'YELLOW':
        return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
      case 'RED':
        return <AlertTriangle className="w-6 h-6 text-red-600" />;
      default:
        return <HelpCircle className="w-6 h-6 text-gray-600" />;
    }
  };

  const getQualityColor = (rating: string) => {
    switch (rating) {
      case 'GREEN':
        return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800' };
      case 'YELLOW':
        return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800' };
      case 'RED':
        return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800' };
      default:
        return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-800' };
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">Loading tier information...</p>
        </div>
      </div>
    );
  }

  if (!tierInfo) {
    return (
      <div className="p-8">
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <AlertTriangle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">Failed to load tier information</p>
          <button
            onClick={loadTierInfo}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const qualityColors = getQualityColor(tierInfo.quality_rating);
  const upgradePath = tierInfo.upgrade_path;
  const qualityRecs = tierInfo.quality_recommendations;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            Marketing Limits & Tier Status
          </h1>
          <p className="text-gray-600 mt-2">
            Monitor your messaging tier and daily limits
          </p>
        </div>
        <button
          onClick={loadTierInfo}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <RefreshCw className="w-5 h-5" />
          Refresh
        </button>
      </div>

      {/* Account Info */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Account Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Business Name</p>
            <p className="text-lg font-medium">{tierInfo.business_name || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Phone Number</p>
            <p className="text-lg font-medium">{tierInfo.phone_number || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Current Tier */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-8 mb-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-blue-100 text-sm mb-1">Current Tier</p>
            <h2 className="text-4xl font-bold">{tierInfo.tier}</h2>
          </div>
          <Shield className="w-16 h-16 text-blue-200" />
        </div>
        <div className="mt-4">
          <p className="text-blue-100 text-sm mb-1">Daily Marketing Limit</p>
          <p className="text-3xl font-bold">
            {tierInfo.daily_limit === Infinity 
              ? 'Unlimited' 
              : tierInfo.daily_limit.toLocaleString()}
          </p>
          {tierInfo.daily_limit !== Infinity && (
            <p className="text-blue-100 text-sm mt-1">conversations per day</p>
          )}
        </div>
      </div>

      {/* Quality Rating */}
      <div className={`rounded-lg shadow p-6 mb-6 border-2 ${qualityColors.bg} ${qualityColors.border}`}>
        <div className="flex items-center gap-3 mb-4">
          {getQualityIcon(tierInfo.quality_rating)}
          <div>
            <h3 className="text-lg font-semibold">Quality Rating</h3>
            <p className={`text-2xl font-bold ${qualityColors.text}`}>
              {tierInfo.quality_rating} - {qualityRecs.status}
            </p>
          </div>
        </div>
        
        <div className="mt-4">
          <p className="font-medium mb-2">Recommendations:</p>
          <ul className="space-y-1">
            {qualityRecs.suggestions.map((suggestion: string, index: number) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="mt-1">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Upgrade Path */}
      {upgradePath.next && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-600" />
            Upgrade Path
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700 font-medium mb-1">Current</p>
              <p className="text-2xl font-bold text-blue-900">{upgradePath.current}</p>
              <p className="text-sm text-blue-600 mt-1">
                {upgradePath.currentLimit === Infinity 
                  ? 'Unlimited' 
                  : `${upgradePath.currentLimit.toLocaleString()} / day`}
              </p>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-700 font-medium mb-1">Next Tier</p>
              <p className="text-2xl font-bold text-green-900">{upgradePath.next}</p>
              <p className="text-sm text-green-600 mt-1">
                {upgradePath.nextLimit === Infinity 
                  ? 'Unlimited' 
                  : `${upgradePath.nextLimit.toLocaleString()} / day`}
              </p>
            </div>
          </div>
          
          <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="font-medium mb-2">Requirements for Upgrade:</p>
            <ul className="space-y-1">
              {upgradePath.requirements.map((req: string, index: number) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {tierInfo.tier === 'TIER_4' && (
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-8 text-white text-center">
          <CheckCircle className="w-16 h-16 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Congratulations!</h3>
          <p className="text-green-100">
            You are at the highest tier with unlimited marketing conversations per day.
          </p>
        </div>
      )}

      {/* Important Notes */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-blue-600" />
          Important Notes
        </h3>
        <ul className="space-y-2 text-sm text-blue-900">
          <li className="flex items-start gap-2">
            <span className="mt-1">•</span>
            <span>Limits apply to <strong>MARKETING</strong> messages only</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1">•</span>
            <span>Utility and Authentication messages are <strong>unlimited</strong></span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1">•</span>
            <span>Limits reset daily at <strong>midnight UTC</strong></span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1">•</span>
            <span>Tier upgrades are <strong>automatic</strong> based on quality</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1">•</span>
            <span>Maintain high quality to keep or upgrade your tier</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default MarketingLimits;
