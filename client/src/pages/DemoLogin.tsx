import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const DemoLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [loginDetails, setLoginDetails] = useState({
    email: '',
    password: ''
  });

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginDetails.email || !loginDetails.password) {
      alert('Please enter email and password');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:3002/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginDetails.email,
          password: loginDetails.password
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }
      
      const data = await response.json();
      
      localStorage.removeItem('demo_mode');
      localStorage.removeItem('demo_user');
      localStorage.setItem('token', data.token);
      
      await login(data.token);
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      alert(error.message || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  const handleTestUserLogin = async () => {
    setLoading(true);
    
    try {
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
      
      localStorage.removeItem('demo_mode');
      localStorage.removeItem('demo_user');
      localStorage.setItem('token', data.token);
      
      await login(data.token);
      navigate('/dashboard');
    } catch (error) {
      console.error('Test user login error:', error);
      alert('Failed to login. Make sure the server is running.');
      setLoading(false);
    }
  };

  const handleEmbeddedSignup = () => {
    setLoading(true);
    
    if (typeof window.FB === 'undefined') {
      alert('Facebook SDK is still loading. Please wait a moment and try again.');
      setLoading(false);
      return;
    }

    window.FB.login(
      function(response: any) {
        if (response.authResponse) {
          const { code, accessToken } = response.authResponse;
          handleEmbeddedSignupCallback(code || accessToken);
        } else {
          alert('WhatsApp connection was cancelled. Please try again.');
          setLoading(false);
        }
      },
      {
        config_id: '828252853064546',
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
      
      localStorage.removeItem('demo_mode');
      localStorage.removeItem('demo_user');
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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 p-4">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full mb-4 shadow-lg">
            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">WhatsApp Business Platform</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>
        
        <div className="space-y-4">
          {/* Email/Password Login */}
          <div className="border-2 border-gray-300 rounded-xl overflow-hidden">
            <button
              onClick={() => setShowEmailLogin(!showEmailLogin)}
              className="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-gray-700 to-gray-800 text-white hover:from-gray-800 hover:to-gray-900 transition-all"
            >
              <div className="flex items-center">
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <div className="text-left">
                  <div className="font-semibold text-lg">Sign In</div>
                  <div className="text-xs text-gray-300">Use your email and password</div>
                </div>
              </div>
              <svg className={`w-5 h-5 transition-transform ${showEmailLogin ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showEmailLogin && (
              <form onSubmit={handleEmailLogin} className="p-6 bg-gray-50 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={loginDetails.email}
                    onChange={(e) => setLoginDetails({ ...loginDetails, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={loginDetails.password}
                    onChange={(e) => setLoginDetails({ ...loginDetails, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold shadow-lg"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
            )}
          </div>

          {/* Facebook Embedded Signup */}
          <button
            onClick={handleEmbeddedSignup}
            disabled={loading}
            className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <div className="text-left">
                  <div className="font-semibold text-lg">Connect with Facebook</div>
                  <div className="text-xs text-blue-100">Recommended by Meta</div>
                </div>
              </>
            )}
          </button>

          {/* Development Mode */}
          <button
            onClick={handleTestUserLogin}
            disabled={loading}
            className="w-full flex items-center justify-center px-6 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <div className="text-left">
              <div className="font-semibold">Development Mode</div>
              <div className="text-xs text-gray-500">For testing purposes</div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-center text-xs text-gray-500">
            By signing in, you agree to our Terms of Service
          </p>
        </div>
      </div>
    </div>
  );
};

export default DemoLogin;
