import { useState, useEffect } from 'react';
import { Activity, Clock, AlertCircle, CheckCircle, TrendingUp, Zap } from 'lucide-react';

const PacingMonitor = () => {
  const [metrics, setMetrics] = useState({
    currentRate: 10,
    queueLength: 0,
    messagesSent: 0,
    messagesFailed: 0,
    rateLimitErrors: 0,
    successRate: 100,
    averageLatency: 0
  });

  const [config, setConfig] = useState({
    maxRate: 50,
    minRate: 5,
    targetRate: 10,
    maxQueueSize: 10000,
    maxRetries: 3
  });

  // Simulate metrics update (in production, fetch from API)
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        messagesSent: prev.messagesSent + Math.floor(Math.random() * 10),
        queueLength: Math.max(0, prev.queueLength + Math.floor(Math.random() * 5) - 3),
        currentRate: Math.min(config.maxRate, Math.max(config.minRate, prev.currentRate + (Math.random() - 0.5) * 2))
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [config]);

  const getRateStatus = () => {
    const percentage = (metrics.currentRate / config.maxRate) * 100;
    if (percentage < 50) return { color: 'green', label: 'Low', icon: CheckCircle };
    if (percentage < 80) return { color: 'yellow', label: 'Moderate', icon: Activity };
    return { color: 'red', label: 'High', icon: AlertCircle };
  };

  const getQueueStatus = () => {
    const percentage = (metrics.queueLength / config.maxQueueSize) * 100;
    if (percentage < 50) return { color: 'green', label: 'Healthy' };
    if (percentage < 80) return { color: 'yellow', label: 'Warning' };
    return { color: 'red', label: 'Critical' };
  };

  const rateStatus = getRateStatus();
  const queueStatus = getQueueStatus();
  const RateIcon = rateStatus.icon;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <Zap className="w-8 h-8 text-purple-600" />
          Message Pacing Monitor
        </h1>
        <p className="text-gray-600 mt-2">
          Monitor and control message sending rates
        </p>
      </div>

      {/* Current Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className={`bg-${rateStatus.color}-50 border border-${rateStatus.color}-200 rounded-lg p-6`}>
          <div className="flex items-center justify-between mb-2">
            <p className={`text-sm text-${rateStatus.color}-700 font-medium`}>Current Rate</p>
            <RateIcon className={`w-5 h-5 text-${rateStatus.color}-600`} />
          </div>
          <p className={`text-3xl font-bold text-${rateStatus.color}-900`}>
            {metrics.currentRate.toFixed(1)}
          </p>
          <p className={`text-xs text-${rateStatus.color}-600 mt-1`}>
            messages/second
          </p>
        </div>

        <div className={`bg-${queueStatus.color}-50 border border-${queueStatus.color}-200 rounded-lg p-6`}>
          <div className="flex items-center justify-between mb-2">
            <p className={`text-sm text-${queueStatus.color}-700 font-medium`}>Queue Length</p>
            <Clock className={`w-5 h-5 text-${queueStatus.color}-600`} />
          </div>
          <p className={`text-3xl font-bold text-${queueStatus.color}-900`}>
            {metrics.queueLength}
          </p>
          <p className={`text-xs text-${queueStatus.color}-600 mt-1`}>
            {queueStatus.label}
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-blue-700 font-medium">Messages Sent</p>
            <CheckCircle className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-900">
            {metrics.messagesSent.toLocaleString()}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Success Rate: {metrics.successRate}%
          </p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-purple-700 font-medium">Avg Latency</p>
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-purple-900">
            {metrics.averageLatency}ms
          </p>
          <p className="text-xs text-purple-600 mt-1">
            Response time
          </p>
        </div>
      </div>

      {/* Rate Configuration */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Rate Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Rate (msg/sec)
            </label>
            <input
              type="number"
              value={config.targetRate}
              onChange={(e) => setConfig({ ...config, targetRate: Number(e.target.value) })}
              min={config.minRate}
              max={config.maxRate}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Range: {config.minRate} - {config.maxRate}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Queue Size
            </label>
            <input
              type="number"
              value={config.maxQueueSize}
              onChange={(e) => setConfig({ ...config, maxQueueSize: Number(e.target.value) })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Maximum queued messages
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Retries
            </label>
            <input
              type="number"
              value={config.maxRetries}
              onChange={(e) => setConfig({ ...config, maxRetries: Number(e.target.value) })}
              min={0}
              max={10}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Failed message retries
            </p>
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            Apply Configuration
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            Reset to Default
          </button>
        </div>
      </div>

      {/* Pacing Strategies */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Pacing Strategy</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border-2 border-purple-500 bg-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <input type="radio" name="strategy" defaultChecked />
              <h3 className="font-semibold">Adaptive</h3>
            </div>
            <p className="text-sm text-gray-600">
              Automatically adjusts rate based on API responses
            </p>
            <div className="mt-3 text-xs text-gray-500">
              <p>✓ Self-adjusting</p>
              <p>✓ Responds to errors</p>
              <p>✓ Optimizes throughput</p>
            </div>
          </div>

          <div className="border border-gray-300 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <input type="radio" name="strategy" />
              <h3 className="font-semibold">Fixed Rate</h3>
            </div>
            <p className="text-sm text-gray-600">
              Send messages at constant rate
            </p>
            <div className="mt-3 text-xs text-gray-500">
              <p>✓ Simple</p>
              <p>✓ Predictable</p>
              <p>✓ Easy to monitor</p>
            </div>
          </div>

          <div className="border border-gray-300 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <input type="radio" name="strategy" />
              <h3 className="font-semibold">Token Bucket</h3>
            </div>
            <p className="text-sm text-gray-600">
              Allow bursts while maintaining average
            </p>
            <div className="mt-3 text-xs text-gray-500">
              <p>✓ Allows bursts</p>
              <p>✓ Maintains average</p>
              <p>✓ Flexible</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Statistics */}
      {metrics.rateLimitErrors > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-semibold text-red-900">Rate Limit Errors Detected</h2>
          </div>
          <p className="text-red-700 mb-3">
            {metrics.rateLimitErrors} rate limit errors in the last hour
          </p>
          <div className="space-y-2 text-sm">
            <p className="text-red-800">Recommended Actions:</p>
            <ul className="list-disc list-inside text-red-700 space-y-1">
              <li>Reduce target rate to {Math.floor(config.targetRate * 0.7)} msg/sec</li>
              <li>Check queue length and clear if necessary</li>
              <li>Review recent error logs</li>
              <li>Consider implementing exponential backoff</li>
            </ul>
          </div>
        </div>
      )}

      {/* Best Practices */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600" />
          Best Practices
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium text-blue-900 mb-2">Rate Limits</p>
            <ul className="space-y-1 text-blue-800">
              <li>• WhatsApp: 80 msg/sec maximum</li>
              <li>• Recommended: 10-50 msg/sec</li>
              <li>• Start conservative, increase gradually</li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-blue-900 mb-2">Queue Management</p>
            <ul className="space-y-1 text-blue-800">
              <li>• Monitor queue length regularly</li>
              <li>• Implement priority queues</li>
              <li>• Set up alerts at 80% capacity</li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-blue-900 mb-2">Error Handling</p>
            <ul className="space-y-1 text-blue-800">
              <li>• Implement retry logic</li>
              <li>• Use exponential backoff</li>
              <li>• Log all rate limit errors</li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-blue-900 mb-2">Monitoring</p>
            <ul className="space-y-1 text-blue-800">
              <li>• Track success rates</li>
              <li>• Monitor latency</li>
              <li>• Review metrics daily</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PacingMonitor;
