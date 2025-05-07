import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface LoginFormData {
  username: string;
  password: string;
}

interface RegisterFormData extends LoginFormData {
  role: 'user' | 'operator';
}

const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState<LoginFormData | RegisterFormData>({
    username: '',
    password: '',
    ...(!isLogin && { role: 'user' })
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
  
    try {
      const payload = isLogin
        ? {
            username: formData.username.trim(),
            password: formData.password.trim()
          }
        : {
            username: (formData as RegisterFormData).username.trim(),
            password: (formData as RegisterFormData).password.trim(),
            role: (formData as RegisterFormData).role
          };
  
      const endpoint = isLogin ? '/login' : '/register';
      const response = await fetch(`http://${window.location.hostname}:8000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        data = { detail: 'Server returned non-JSON response' };
      }
      
      if (!response.ok) {
        console.error('Server error response:', data);
        const errorMessage = 'Request failed';
        throw new Error(errorMessage);
      }
      
      if (isLogin) {
        localStorage.setItem('access_token', data.access_token);
        const parseJwt = (token: string) => {
          try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
          } catch (e) {
            console.error('Failed to parse JWT token', e);
            return {};
          }
        };
        const tokenData = parseJwt(data.access_token);
        localStorage.setItem("user_role", tokenData.role);
        if (tokenData.role === 'operator') {
          navigate('/dashboard');
        } else {
          navigate('/chat');
        }
      } else {
        setIsLogin(true);
        setFormData({ username: '', password: '' });
        alert('Registration successful! Please login.');
      }
    } catch (err) {
      console.error('Full error:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'Authentication failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-gray-100 p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Sign in to your account' : 'Create a new account'}
          </h2>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.username}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  required
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={(formData as RegisterFormData).role}
                  onChange={handleChange}
                >
                  <option value="user">User</option>
                  <option value="operator">Operator</option>
                </select>
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                'Processing...'
              ) : isLogin ? (
                'Sign in'
              ) : (
                'Register'
              )}
            </button>
          </div>
        </form>

        <div className="text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
              setFormData(isLogin 
                ? { username: '', password: '', role: 'user' } 
                : { username: '', password: '' }
              );
            }}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            {isLogin
              ? 'Need an account? Register here'
              : 'Already have an account? Login here'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;