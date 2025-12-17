import { useState, useEffect } from 'react';
import { Shield, Lock, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import api from '../services/api';

interface TwoStepInfo {
  description: string;
  benefits: string[];
  requirements: string[];
  warnings: string[];
}

export default function TwoStepVerification() {
  const [info, setInfo] = useState<TwoStepInfo | null>(null);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  useEffect(() => {
    fetchInfo();
  }, []);

  const fetchInfo = async () => {
    try {
      setLoading(true);
      const response = await api.get('/two-step-verification/info');
      setInfo(response.data.data);
    } catch (err: any) {
      console.error('Fetch info error:', err);
      setMessage({ type: 'error', text: 'Failed to fetch two-step verification information' });
    } finally {
      setLoading(false);
    }
  };

  const handleSetPin = async () => {
    // Validation
    if (!pin || pin.length !== 6) {
      setMessage({ type: 'error', text: 'PIN must be 6 digits' });
      return;
    }

    if (!/^\d+$/.test(pin)) {
      setMessage({ type: 'error', text: 'PIN can only contain numbers' });
      return;
    }

    if (pin !== confirmPin) {
      setMessage({ type: 'error', text: 'PINs do not match' });
      return;
    }

    try {
      setProcessing(true);
      setMessage(null);
      await api.post('/two-step-verification/set-pin', { pin });
      setMessage({ 
        type: 'success', 
        text: 'Two-step verification PIN set successfully! Please keep your PIN safe.' 
      });
      setPin('');
      setConfirmPin('');
    } catch (err: any) {
      console.error('Set PIN error:', err);
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.error || 'Failed to set PIN' 
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleRemovePin = async () => {
    try {
      setProcessing(true);
      setMessage(null);
      await api.delete('/two-step-verification/remove-pin');
      setMessage({ 
        type: 'success', 
        text: 'Two-step verification PIN removed' 
      });
      setShowRemoveConfirm(false);
    } catch (err: any) {
      console.error('Remove PIN error:', err);
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.error || 'Failed to remove PIN' 
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center space-x-3">
          <Shield className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Two-Step Verification</h1>
            <p className="text-gray-600">Add extra security protection to your account</p>
          </div>
        </div>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border-green-200' 
            : message.type === 'warning'
            ? 'bg-yellow-50 text-yellow-800 border-yellow-200'
            : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          <div className="flex items-start">
            {message.type === 'success' && <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />}
            {message.type === 'error' && <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />}
            {message.type === 'warning' && <Info className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />}
            <p>{message.text}</p>
          </div>
        </div>
      )}

      {/* About Two-Step Verification */}
      {info && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
            <Info className="w-5 h-5 mr-2" />
            About Two-Step Verification
          </h2>
          <p className="text-blue-800 mb-4">{info.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">✅ Benefits</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                {info.benefits.map((benefit, index) => (
                  <li key={index}>• {benefit}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">📋 Requirements</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                {info.requirements.map((req, index) => (
                  <li key={index}>• {req}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Warning Information */}
      {info && info.warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-yellow-900 mb-2 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Important Notice
          </h3>
          <ul className="text-sm text-yellow-800 space-y-1">
            {info.warnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Set PIN */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Lock className="w-5 h-5 mr-2" />
          Set Two-Step Verification PIN
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter 6-digit PIN
            </label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-2xl tracking-widest text-center"
              placeholder="••••••"
              maxLength={6}
            />
            <p className="text-xs text-gray-500 mt-1">
              Numbers only, 6 digits
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm PIN
            </label>
            <input
              type="password"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-2xl tracking-widest text-center"
              placeholder="••••••"
              maxLength={6}
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter the same PIN again
            </p>
          </div>

          <button
            onClick={handleSetPin}
            disabled={processing || !pin || !confirmPin || pin.length !== 6}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
          >
            {processing ? 'Setting...' : 'Set PIN'}
          </button>
        </div>
      </div>

      {/* Remove PIN */}
      <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
        <h2 className="text-lg font-semibold text-red-900 mb-4 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          Remove Two-Step Verification
        </h2>
        
        {!showRemoveConfirm ? (
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Removing two-step verification will reduce your account security. Only do this if absolutely necessary.
            </p>
            <button
              onClick={() => setShowRemoveConfirm(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Remove PIN
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-semibold mb-2">⚠️ Confirm Removal</p>
              <p className="text-sm text-red-700">
                Are you sure you want to remove two-step verification PIN? This action cannot be undone and will reduce your account security.
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleRemovePin}
                disabled={processing}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors"
              >
                {processing ? 'Removing...' : 'Confirm Remove'}
              </button>
              <button
                onClick={() => setShowRemoveConfirm(false)}
                disabled={processing}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
