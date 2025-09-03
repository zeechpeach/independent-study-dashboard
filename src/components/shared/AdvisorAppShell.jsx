import React from 'react';
import AppShell from './AppShell';

/**
 * AdvisorAppShell - Advisor-specific AppShell wrapper
 * 
 * Provides advisor-specific layout and functionality while leveraging
 * the base AppShell component. This wrapper ensures advisor-specific
 * role context and behavior.
 */
const AdvisorAppShell = ({ 
  children, 
  user, 
  userProfile, 
  isAdmin, 
  onLogout, 
  onToggleAdminView,
  showAdminDashboard 
}) => {
  return (
    <AppShell
      role="advisor"
      user={user}
      userProfile={userProfile}
      isAdmin={isAdmin}
      onLogout={onLogout}
      onToggleAdminView={onToggleAdminView}
      showAdminDashboard={showAdminDashboard}
    >
      {children}
    </AppShell>
  );
};

export default AdvisorAppShell;