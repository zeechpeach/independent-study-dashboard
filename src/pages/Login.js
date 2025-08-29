import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Target, Calendar, Users } from 'lucide-react';
import LoadingSpinner from '../components/shared/LoadingSpinner';

const Login = () => {
  const { login, loading } = useAuth();
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      setError('');
      await login();
    } catch (error) {
      setError('Failed to sign in. Please try again.');
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Independent Study Dashboard
          </h1>
          <p className="text-gray-600">
            Track your learning journey and manage your independent study progress
          </p>
        </div>

        <div className="card">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Target className="w-4 h-4 text-blue-600" />
                Goal Tracking
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4 text-blue-600" />
                Meeting Management
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <BookOpen className="w-4 h-4 text-blue-600" />
                Progress Reflections
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="w-4 h-4 text-blue-600" />
                Mentor Collaboration
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full btn btn-primary btn-lg flex items-center justify-center gap-3"
              >
                {loading ? (
                  <LoadingSpinner size="small" text="" />
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </>
                )}
              </button>
              
              <p className="text-xs text-gray-500 text-center">
                Sign in with your school Google account to access your dashboard
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-6 text-sm text-gray-500">
          Need help? Contact your independent study coordinator
        </div>
      </div>
    </div>
  );
};

export default Login;