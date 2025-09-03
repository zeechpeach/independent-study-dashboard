import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, User, Calendar, Target, FileText, Settings } from 'lucide-react';

const Layout = ({ children }) => {
  const { user, userProfile, logout, isAdmin } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              Independent Study Dashboard
            </div>
            
            {user && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    {user.displayName}
                  </span>
                  {isAdmin && (
                    <span className="status status-info text-xs">Admin</span>
                  )}
                </div>
                
                <button
                  onClick={handleLogout}
                  className="btn btn-secondary btn-sm"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="container">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;