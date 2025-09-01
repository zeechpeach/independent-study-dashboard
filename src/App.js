import React, { useState } from 'react';
import { signInWithGoogle, logOut, auth } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { BookOpen, Target, Calendar, Users } from 'lucide-react';
import StudentDashboard from './components/student/Dashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import './styles/globals.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);

  // Simple auth state listener
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return unsubscribe;
  }, []);

  const handleLogin = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
    } catch (error) {
      setError('Failed to sign in. Please try again.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logOut();
      setShowAdminDashboard(false); // Reset admin view on logout
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isAdmin = user?.email === process.env.REACT_APP_ADMIN_EMAIL;

  // If user is logged in, show dashboard
  if (user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="header">
          <div className="container">
            <div className="header-content">
              <div className="logo">
                Independent Study Dashboard
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <img
                    src={user.photoURL || '/default-avatar.png'}
                    alt={user.displayName}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {user.displayName}
                  </span>
                  {isAdmin && (
                    <span className="status status-info text-xs">Admin</span>
                  )}
                </div>
                
                {isAdmin && (
                  <button
                    onClick={() => setShowAdminDashboard(!showAdminDashboard)}
                    className="btn btn-sm btn-secondary"
                  >
                    {showAdminDashboard ? 'Student View' : 'Admin View'}
                  </button>
                )}
                
                <button
                  onClick={handleLogout}
                  className="btn btn-secondary btn-sm"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="main-content">
          <div className="container">
            {showAdminDashboard ? (
              <AdminDashboard 
                user={user} 
                onBack={() => setShowAdminDashboard(false)} 
              />
            ) : (
              <StudentDashboard user={user} />
            )}
          </div>
        </main>
      </div>
    );
  }

  // Login page
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl mb-6 shadow-lg">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">
            Independent Study Dashboard
          </h1>
          <p className="text-gray-600 leading-relaxed">
            Transform your learning journey with intelligent progress tracking and reflection tools
          </p>
        </div>

        {/* Main Card */}
        <div className="card p-8 shadow-xl border-0 bg-white/70 backdrop-blur-sm">
          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-blue-900">Goal Tracking</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-100">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-sm font-medium text-green-900">Smart Scheduling</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 border border-purple-100">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-purple-900">Rich Reflections</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 border border-orange-100">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-orange-600" />
              </div>
              <span className="text-sm font-medium text-orange-900">Mentorship Hub</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
              <div className="flex items-center">
                <div className="w-5 h-5 text-red-400 mr-2">⚠</div>
                <p className="text-red-800 text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Sign In Button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full btn btn-primary btn-lg mb-4 relative overflow-hidden group"
            style={{ minHeight: '48px' }}
          >
            {loading ? (
              <div className="loading-spinner" />
            ) : (
              <>
                <svg className="w-5 h-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
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
                <span className="font-semibold">Continue with Google</span>
              </>
            )}
          </button>
          
          {/* Privacy Notice */}
          <p className="text-xs text-gray-500 text-center leading-relaxed">
            Secure authentication through your school Google account. 
            <br />Your privacy and data security are our top priorities.
          </p>
        </div>

        {/* Help Section */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Need assistance? Contact your independent study coordinator
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;