import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      navigate('/dashboard');
    }
  }, [token, navigate]);

  const handleFacebookLogin = () => {
    const appId = import.meta.env.VITE_META_APP_ID;
    const redirectUri = `${window.location.origin}/auth/callback`;
    const scope = 'email,public_profile,whatsapp_business_management,whatsapp_business_messaging';
    
    const fbLoginUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;
    
    window.location.href = fbLoginUrl;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-400 to-blue-500">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-2xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">WhatsApp Integration Platform</h1>
          <p className="text-gray-600 mb-8">Login with Facebook Account</p>
        </div>
        
        <button
          onClick={handleFacebookLogin}
          className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          Login with Facebook
        </button>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>By logging in, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
