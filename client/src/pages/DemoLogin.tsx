import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const DemoLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleDemoLogin = async () => {
    setLoading(true);
    
    setTimeout(async () => {
      const demoToken = 'demo_token_' + Date.now();
      
      localStorage.setItem('token', demoToken);
      localStorage.setItem('demo_mode', 'true');
      localStorage.setItem('demo_user', JSON.stringify({
        id: 'demo_user_123',
        name: 'Demo User',
        email: 'demo@example.com',
        facebookId: 'demo_fb_123'
      }));
      
      await login(demoToken);
      navigate('/dashboard');
    }, 1000);
  };

  const handleTestUserLogin = async () => {
    setLoading(true);
    
    try {
      // Login with test user credentials
      const response = await fetch('http://localhost:3002/api/auth/test-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@whatsapp-platform.com'
        })
      });
      
      if (!response.ok) {
        throw new Error('Test user login failed');
      }
      
      const data = await response.json();
      
      // Clear demo mode
      localStorage.removeItem('demo_mode');
      localStorage.removeItem('demo_user');
      
      // Set real token
      localStorage.setItem('token', data.token);
      
      await login(data.token);
      navigate('/dashboard');
    } catch (error) {
      console.error('Test user login error:', error);
      alert('Failed to login with test user. Make sure the server is running and test user is created.');
      setLoading(false);
    }
  };

  const handleEmbeddedSignup = () => {
    setLoading(true);
    
    // Check if Facebook SDK is loaded
    if (typeof window.FB === 'undefined') {
      alert('Facebook SDK is still loading. Please wait a moment and try again.');
      setLoading(false);
      return;
    }

    // Launch Facebook Login for WhatsApp Embedded Signup
    window.FB.login(
      function(response: any) {
        if (response.authResponse) {
          console.log('✅ Embedded Signup successful:', response);
          
          const { code, accessToken } = response.authResponse;
          
          // Send to backend
          handleEmbeddedSignupCallback(code || accessToken);
        } else {
          console.log('❌ User cancelled login or did not fully authorize.');
          alert('WhatsApp connection was cancelled. Please try again.');
          setLoading(false);
        }
      },
      {
        config_id: '828252853064546', // Your Config ID from Meta Dashboard
        response_type: 'code',
        override_default_response_type: true,
        extras: {
          setup: {},
          featureType: '',
          sessionInfoVersion: 2
        }
      }
    );
  };

  const handleEmbeddedSignupCallback = async (authCode: string) => {
    try {
      const response = await fetch('http://localhost:3002/api/auth/embedded-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: authCode })
      });
      
      if (!response.ok) {
        throw new Error('Embedded signup failed');
      }
      
      const data = await response.json();
      
      // Clear demo mode
      localStorage.removeItem('demo_mode');
      localStorage.removeItem('demo_user');
      
      // Set real token
      localStorage.setItem('token', data.token);
      
      await login(data.token);
      navigate('/dashboard');
    } catch (error) {
      console.error('Embedded signup error:', error);
      alert('Failed to complete WhatsApp connection. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-400 to-blue-500">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">WhatsApp Platform</h1>
          <p className="text-gray-600">Choose your login method</p>
        </div>
        
        <div className="space-y-3">
          {/* Embedded Signup - Primary Option */}
          <button
            onClick={handleEmbeddedSignup}
            disabled={loading}
            className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Connecting...
              </>
            ) : (
              <>
                <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <div className="text-left">
                  <div className="font-semibold">Connect WhatsApp Business</div>
                  <div className="text-xs text-blue-100">Recommended by Meta</div>
                </div>
              </>
            )}
          </button>

          {/* Test User Login */}
          <button
            onClick={handleTestUserLogin}
            disabled={loading}
            className="w-full flex items-center justify-center px-6 py-4 bg-white border-2 border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 hover:border-purple-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            <div className="text-left">
              <div className="font-semibold">Test User Login</div>
              <div className="text-xs text-purple-500">Uses PostgreSQL database</div>
            </div>
          </button>

          {/* Demo Mode */}
          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full flex items-center justify-center px-6 py-4 bg-white border-2 border-green-300 text-green-700 rounded-lg hover:bg-green-50 hover:border-green-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-left">
              <div className="font-semibold">Demo Mode</div>
              <div className="text-xs text-green-500">Quick testing, no setup needed</div>
            </div>
          </button>
        </div>

        {/* Info Cards */}
        <div className="mt-8 space-y-3">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>📱 WhatsApp Business:</strong> Full integration with real WhatsApp API
            </p>
          </div>
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-xs text-purple-800">
              <strong>🗄️ Test User:</strong> Development mode with database persistence
            </p>
          </div>
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-xs text-green-800">
              <strong>💡 Demo Mode:</strong> Browser-only, perfect for quick demos
            </p>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          <p>By logging in, you agree to our Terms of Service</p>
        </div>
      </div>
    </div>
  );
};

export default DemoLogin;
