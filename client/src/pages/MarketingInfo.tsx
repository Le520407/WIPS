import { useState, useEffect } from 'react';
import { TrendingUp, AlertCircle, CheckCircle, ExternalLink, Info, Zap, Target, BarChart } from 'lucide-react';
import api from '../services/api';

const MarketingInfo = () => {
  const [onboardingStatus, setOnboardingStatus] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [wabaId, setWabaId] = useState('');

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      setLoading(true);
      // Check if WABA is eligible for Marketing Messages API
      const response = await api.get(`/marketing/onboarding-status`);
      setOnboardingStatus(response.data.status);
      setWabaId(response.data.waba_id);
    } catch (error) {
      console.error('Failed to check onboarding status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = () => {
    switch (onboardingStatus) {
      case 'ONBOARDED':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          title: '✅ Marketing Messages API 已启用',
          description: '您的账户已成功开通Marketing Messages API，可以开始发送优化的营销消息。',
        };
      case 'ELIGIBLE':
        return {
          icon: Info,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          title: '📋 需要完成Onboarding',
          description: '您的账户符合条件，但需要先接受Terms of Service才能使用。',
        };
      case 'NOT_ELIGIBLE':
        return {
          icon: AlertCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          title: '❌ 账户不符合条件',
          description: '您的WABA账户暂时不符合Marketing Messages API的使用条件。',
        };
      default:
        return {
          icon: Info,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          title: '🔍 检查中...',
          description: '正在检查您的账户状态...',
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <TrendingUp className="w-8 h-8 mr-3 text-green-600" />
          Marketing Messages API
        </h1>
        <p className="mt-2 text-gray-600">
          Meta的下一代营销解决方案，提供自动优化、性能基准和转化跟踪
        </p>
      </div>

      {/* Status Card */}
      <div className={`${statusInfo.bgColor} border-l-4 border-${statusInfo.color.replace('text-', '')} p-6 rounded-lg`}>
        <div className="flex items-start">
          <StatusIcon className={`w-6 h-6 ${statusInfo.color} mr-3 flex-shrink-0 mt-1`} />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{statusInfo.title}</h3>
            <p className="mt-1 text-gray-700">{statusInfo.description}</p>
            {wabaId && (
              <p className="mt-2 text-sm text-gray-600">
                WABA ID: <code className="bg-white px-2 py-1 rounded">{wabaId}</code>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* What is Marketing Messages API */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">什么是 Marketing Messages API？</h2>
        <div className="space-y-4">
          <div className="flex items-start">
            <Zap className="w-5 h-5 text-yellow-500 mr-3 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900">自动优化送达</h3>
              <p className="text-gray-600">
                通过AI优化，将消息发送给更可能阅读和点击的用户，送达率提升高达9%
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <Target className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900">转化跟踪</h3>
              <p className="text-gray-600">
                追踪用户点击后的行为（加入购物车、购买等），衡量营销ROI
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <BarChart className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900">性能基准</h3>
              <p className="text-gray-600">
                对比同行业的表现，获得个性化的改进建议
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Differences */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">与普通消息的区别</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">功能</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">普通消息 (Cloud API)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marketing Messages API</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">API端点</td>
                <td className="px-6 py-4 text-sm text-gray-600">/messages</td>
                <td className="px-6 py-4 text-sm text-gray-600">/marketing_messages</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">送达优化</td>
                <td className="px-6 py-4 text-sm text-gray-600">❌ 无</td>
                <td className="px-6 py-4 text-sm text-gray-600">✅ AI自动优化</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">转化跟踪</td>
                <td className="px-6 py-4 text-sm text-gray-600">❌ 无</td>
                <td className="px-6 py-4 text-sm text-gray-600">✅ 完整跟踪</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">性能基准</td>
                <td className="px-6 py-4 text-sm text-gray-600">❌ 无</td>
                <td className="px-6 py-4 text-sm text-gray-600">✅ 行业对比</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">创意优化</td>
                <td className="px-6 py-4 text-sm text-gray-600">❌ 无</td>
                <td className="px-6 py-4 text-sm text-gray-600">✅ 图片动画、滤镜等</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">TTL（时效性）</td>
                <td className="px-6 py-4 text-sm text-gray-600">❌ 无</td>
                <td className="px-6 py-4 text-sm text-gray-600">✅ 12小时-30天</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Onboarding Steps */}
      {onboardingStatus === 'ELIGIBLE' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📋 如何开通？</h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-gray-900">打开 WhatsApp Manager</h3>
                <p className="text-gray-600 mt-1">
                  访问{' '}
                  <a
                    href="https://business.facebook.com/wa/manage/home/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center"
                  >
                    WhatsApp Manager
                    <ExternalLink className="w-4 h-4 ml-1" />
                  </a>
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-gray-900">找到 Marketing Messages API 提示</h3>
                <p className="text-gray-600 mt-1">
                  在 Overview 页面的 Alerts 部分，点击 "Accept terms to get started for Marketing Messages API for WhatsApp"
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-gray-900">接受 Terms of Service</h3>
                <p className="text-gray-600 mt-1">
                  按照步骤完成Terms of Service的签署
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-gray-900">刷新此页面</h3>
                <p className="text-gray-600 mt-1">
                  完成后，回到这里刷新页面，状态会更新为"已启用"
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={checkOnboardingStatus}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            刷新状态
          </button>
        </div>
      )}

      {/* Not Eligible Info */}
      {onboardingStatus === 'NOT_ELIGIBLE' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">❌ 为什么不符合条件？</h2>
          <div className="space-y-2 text-gray-700">
            <p>可能的原因：</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>WABA账户被限制或暂停</li>
              <li>WABA税务国家在制裁地区</li>
              <li>Business所有者国家在制裁地区</li>
              <li>账户违反了WhatsApp Business Messaging Policies</li>
            </ul>
            <p className="mt-4">
              请先解决账户问题，然后刷新此页面重新检查。
            </p>
          </div>
        </div>
      )}

      {/* Use Cases */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">💡 适用场景</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">✅ 适合使用</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• 促销活动通知</li>
              <li>• 新品发布</li>
              <li>• 限时优惠</li>
              <li>• 会员专享活动</li>
              <li>• 季节性营销</li>
            </ul>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">❌ 不适合使用</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• 订单确认（用Utility）</li>
              <li>• 验证码（用Authentication）</li>
              <li>• 客服消息（用Service）</li>
              <li>• 一对一聊天（用Freeform）</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Documentation Links */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">📚 相关文档</h2>
        <div className="space-y-2">
          <a
            href="https://developers.facebook.com/docs/whatsapp/business-management-api/marketing-messages"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-blue-600 hover:underline"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Marketing Messages API 官方文档
          </a>
          <a
            href="https://developers.facebook.com/docs/whatsapp/business-management-api/marketing-messages/onboarding"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-blue-600 hover:underline"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Onboarding 指南
          </a>
          <a
            href="https://developers.facebook.com/docs/whatsapp/business-management-api/marketing-messages/insights"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-blue-600 hover:underline"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Insights API 文档
          </a>
        </div>
      </div>

      {/* Note */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-700">
            <p className="font-semibold mb-1">注意事项：</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Marketing Messages API 和 Cloud API 使用相同的电话号码</li>
              <li>计费模式与 Cloud API 相同</li>
              <li>需要使用 Marketing category 的模板</li>
              <li>消息会自动与Meta共享事件数据用于优化（可在设置中关闭）</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingInfo;
