import React from 'react';
import { LogOut } from 'lucide-react';

/**
 * AppShell - Application layout wrapper component
 * 
 * Provides consistent header, navigation, and main content layout
 * using Tailwind CSS utilities. Replaces legacy header and layout classes.
 * 
 * Supports role-based display and navigation for student, advisor, and admin views.
 */
const AppShell = ({ 
  children, 
  user, 
  userProfile, 
  isAdmin, 
  onLogout, 
  onToggleAdminView,
  showAdminDashboard,
  role = 'student' // Default role if not provided
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900">
                Independent Study Dashboard
              </h1>
            </div>
            
            {/* User section */}
            {user && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    {user.displayName}
                  </span>
                  {isAdmin && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                      Admin
                    </span>
                  )}
                  {userProfile?.userType && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                      {userProfile.userType}
                    </span>
                  )}
                </div>
                
                {/* Role toggle button - supports admin/advisor switching */}
                {isAdmin && onToggleAdminView && (
                  <button
                    onClick={onToggleAdminView}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    {showAdminDashboard ? 'Student View' : (role === 'advisor' ? 'Advisor View' : 'Admin View')}
                  </button>
                )}
                
                {/* Logout button */}
                <button
                  onClick={onLogout}
                  className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main content area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default AppShell;