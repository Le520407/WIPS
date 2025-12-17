import { useState, useEffect } from 'react';
import { Phone, Shield, CheckCircle, AlertTriangle, ArrowRight, Info } from 'lucide-react';
import api from '../services/api';

interface RegistrationInfo {
  description: string;
  steps: Array<{
    step: number;
    title: string;
    description: string;
  }>;
  requirements: string[];
  warnings: string[];
  languages: Array<{
    code: string;
    name: string;
  }>;
}

type Step = 'info' | 'request-code' | 'verify-code' | 'set-pin' | 'register' | 'complete';

export default function PhoneRegistration() {
  const [info, setInfo] = useState<RegistrationInfo | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>('info');
  const [codeMethod, setCodeMethod] = useState<'SMS' | 'VOICE'>('SMS');
  const [language, setLanguage] = useState('en_US');
  const [verificationCode, setVerificationCode] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);
  const [showDeregisterConfirm, setShowDeregisterConfirm] = useState(false);

  useEffect(() => {
    fetchInfo();
  }, []);

  const fetchInfo = async () => {
    try {
      setLoading(true);
      const response = await api.get('/phone-registration/info');
      setInfo(response.data.data);
    } catch (err: any) {
      console.error('Fetch info error:', err);
      setMessage({ type: 'error', text: 'Failed to fetch registration information' });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestCode = async () => {
    try {
      setProcessing(true);
      setMessage(null);
      await api.post('/phone-registration/request-code', {
        code_method: codeMethod,
        language: language
      });
      setMessage({ 
        type: 'success', 
        text: `Verification code sent via ${codeMethod === 'SMS' ? 'SMS' : 'Voice'}` 
      });
      setCurrentStep('verify-code');
    } catch (err: any) {
      console.error('Request code error:', err);
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.error || 'Failed to request verification code' 
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setMessage({ type: 'error', text: 'Verification code must be 6 digits' });
      return;
    }

    try {
      setProcessing(true);
      setMessage(null);
      await api.post('/phone-registration/verify-code', {
        code: verificationCode
      });
      setMessage({ type: 'success', text: 'Verification code verified successfully!' });
      setCurrentStep('set-pin');
    } catch (err: any) {
      console.error('Verify code error:', err);
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.error || 'Failed to verify code' 
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleRegister = async () => {
    if (!pin || pin.length !== 6) {
      setMessage({ type: 'error', text: 'PIN must be 6 digits' });
      return;
    }

    if (pin !== confirmPin) {
      setMessage({ type: 'error', text: 'PINs do not match' });
      return;
    }

    try {
      setProcessing(true);
      setMessage(null);
      await api.post('/phone-registration/register', { pin });
      setMessage({ type: 'success', text: 'Phone number registered successfully!' });
      setCurrentStep('complete');
    } catch (err: any) {
      console.error('Register error:', err);
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.error || 'Registration failed' 
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDeregister = async () => {
    try {
      setProcessing(true);
      setMessage(null);
      await api.delete('/phone-registration/deregister');
      setMessage({ type: 'success', text: 'Phone number deregistered' });
      setShowDeregisterConfirm(false);
      setCurrentStep('info');
    } catch (err: any) {
      console.error('Deregister error:', err);
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.error || 'Deregistration failed' 
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
          <Phone className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Phone Registration</h1>
            <p className="text-gray-600">Register your WhatsApp Business phone number</p>
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

      {/* Step Indicator */}
      {currentStep !== 'info' && currentStep !== 'complete' && (
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            {['request-code', 'verify-code', 'set-pin', 'register'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep === step 
                    ? 'bg-blue-600 text-white' 
                    : index < ['request-code', 'verify-code', 'set-pin', 'register'].indexOf(currentStep)
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                {index < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    index < ['request-code', 'verify-code', 'set-pin', 'register'].indexOf(currentStep)
                      ? 'bg-green-600'
                      : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Information Page */}
      {currentStep === 'info' && info && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
              <Info className="w-5 h-5 mr-2" />
              About Phone Number Registration
            </h2>
            <p className="text-blue-800 mb-4">{info.description}</p>
            
            <h3 className="font-semibold text-blue-900 mb-2">Registration Steps</h3>
            <div className="space-y-2">
              {info.steps.map((step) => (
                <div key={step.step} className="flex items-start text-blue-800">
                  <span className="font-semibold mr-2">{step.step}.</span>
                  <div>
                    <span className="font-semibold">{step.title}</span>
                    <span className="text-sm"> - {step.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">✅ Requirements</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                {info.requirements.map((req, index) => (
                  <li key={index}>• {req}</li>
                ))}
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Warnings</h3>
              <ul className="text-sm text-yellow-800 space-y-1">
                {info.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          </div>

          <button
            onClick={() => setCurrentStep('request-code')}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center"
          >
            Start Registration
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      )}

      {/* Step 1: Request Verification Code */}
      {currentStep === 'request-code' && info && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Step 1: Request Verification Code</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Method
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="SMS"
                    checked={codeMethod === 'SMS'}
                    onChange={(e) => setCodeMethod(e.target.value as 'SMS')}
                    className="mr-2"
                  />
                  SMS
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="VOICE"
                    checked={codeMethod === 'VOICE'}
                    onChange={(e) => setCodeMethod(e.target.value as 'VOICE')}
                    className="mr-2"
                  />
                  Voice
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {info.languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleRequestCode}
              disabled={processing}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-semibold"
            >
              {processing ? 'Sending...' : 'Send Verification Code'}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Verify Code */}
      {currentStep === 'verify-code' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Step 2: Enter Verification Code</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                6-digit Verification Code
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-2xl tracking-widest text-center"
                placeholder="••••••"
                maxLength={6}
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the 6-digit code you received
              </p>
            </div>

            <button
              onClick={handleVerifyCode}
              disabled={processing || !verificationCode || verificationCode.length !== 6}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-semibold"
            >
              {processing ? 'Verifying...' : 'Verify Code'}
            </button>

            <button
              onClick={() => setCurrentStep('request-code')}
              className="w-full px-4 py-2 text-blue-600 hover:text-blue-700"
            >
              Resend Verification Code
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Set PIN */}
      {currentStep === 'set-pin' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Step 3: Set Two-Step Verification PIN
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
            </div>

            <button
              onClick={() => setCurrentStep('register')}
              disabled={!pin || !confirmPin || pin !== confirmPin || pin.length !== 6}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-semibold"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Complete Registration */}
      {currentStep === 'register' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Step 4: Complete Registration</h2>
          
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 font-semibold mb-2">⚠️ Final Confirmation</p>
              <p className="text-sm text-yellow-700">
                Clicking "Complete Registration" will register your phone number with the PIN you set. This will deregister the number from other devices.
              </p>
            </div>

            <button
              onClick={handleRegister}
              disabled={processing}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors font-semibold"
            >
              {processing ? 'Registering...' : 'Complete Registration'}
            </button>
          </div>
        </div>
      )}

      {/* Completion page */}
      {currentStep === 'complete' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
          <p className="text-gray-600 mb-6">
            Your WhatsApp Business phone number has been successfully registered
          </p>
          <button
            onClick={() => {
              setCurrentStep('info');
              setVerificationCode('');
              setPin('');
              setConfirmPin('');
              setMessage(null);
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return
          </button>
        </div>
      )}

      {/* Deregistration Area */}
      {currentStep === 'info' && (
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-red-200 p-6">
          <h2 className="text-lg font-semibold text-red-900 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Deregister Phone Number
          </h2>
          
          {!showDeregisterConfirm ? (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Deregistration will disconnect the phone number from WhatsApp Business. Only do this if absolutely necessary.
              </p>
              <button
                onClick={() => setShowDeregisterConfirm(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Deregister Phone Number
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-semibold mb-2">⚠️ Confirm Deregistration</p>
                <p className="text-sm text-red-700">
                  Are you sure you want to deregister the phone number? This will disconnect all connections and require re-registration to use again.
                </p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleDeregister}
                  disabled={processing}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                >
                  {processing ? 'Deregistering...' : 'Confirm Deregistration'}
                </button>
                <button
                  onClick={() => setShowDeregisterConfirm(false)}
                  disabled={processing}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
