import React, { useState } from 'react';
import { signInWithGoogle, logOut, auth, getUserProfile } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import StudentDashboard from './components/student/Dashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import OnboardingForm from './components/shared/OnboardingForm';
import AppShell from './components/shared/AppShell';
import { Button } from './components/ui';
import './styles/globals.css';

function App() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);

  // Log build SHA if available
  React.useEffect(() => {
    const buildSHA = process.env.REACT_APP_BUILD_SHA;
    if (buildSHA) {
      console.log(`Build SHA: ${buildSHA}`);
    }
  }, []);

  // Auth state listener with onboarding check
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setAuthLoading(true);
      try {
        if (firebaseUser) {
          setUser(firebaseUser);
          // Get user profile to check onboarding status
          const profile = await getUserProfile(firebaseUser.uid);
          setUserProfile(profile);
        } else {
          setUser(null);
          setUserProfile(null);
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
        setUserProfile(null);
      } finally {
        setAuthLoading(false);
      }
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
      setShowAdminDashboard(false);
      setUserProfile(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleOnboardingComplete = async () => {
    // Refresh user profile after onboarding
    if (user) {
      try {
        const updatedProfile = await getUserProfile(user.uid);
        setUserProfile(updatedProfile);
      } catch (error) {
        console.error('Error refreshing user profile:', error);
      }
    }
  };

  const isAdmin = user?.email === process.env.REACT_APP_ADMIN_EMAIL || userProfile?.isAdmin;

  // Show loading while checking auth state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="loading-spinner" />
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  // Show onboarding for users who haven't completed it
  if (user && (!userProfile || !userProfile.onboardingComplete)) {
    return <OnboardingForm user={user} onComplete={handleOnboardingComplete} />;
  }

  // If user is logged in and onboarded, show dashboard
  if (user && userProfile?.onboardingComplete) {
    return (
      <AppShell
        user={user}
        userProfile={userProfile}
        isAdmin={isAdmin}
        onLogout={handleLogout}
        onToggleAdminView={() => setShowAdminDashboard(!showAdminDashboard)}
        showAdminDashboard={showAdminDashboard}
      >
        {showAdminDashboard ? (
          <AdminDashboard 
            user={user} 
            userProfile={userProfile}
            onBack={() => setShowAdminDashboard(false)} 
          />
        ) : (
          <StudentDashboard 
            user={user}
            userProfile={userProfile}
          />
        )}
      </AppShell>
    );
  }

  // Clean login page with Tailwind utilities
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-semibold text-gray-900">
            Independent Study Dashboard
          </h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Single Sign In Button */}
        <div className="mb-12">
          <Button
            onClick={handleLogin}
            disabled={loading}
            size="lg"
            className="w-full"
          >
            {loading ? (
              <div className="loading-spinner" />
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
          </Button>
        </div>

        {/* Help */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Need help? Contact{' '}
            <a 
              href="mailto:zchien@bwscampus.com" 
              className="text-blue-600 hover:text-blue-700 underline"
            >
              zchien@bwscampus.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;