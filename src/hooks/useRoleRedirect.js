import { useEffect, useRef } from 'react';

/**
 * Custom hook for role-aware redirection after authentication
 * 
 * Automatically redirects users to their appropriate dashboard based on their role:
 * - Advisors → advisor dashboard view
 * - Students → student dashboard view
 * 
 * This hook prevents advisors from being misrouted to the student dashboard
 * and ensures proper role-based navigation flow.
 */
export const useRoleRedirect = (userProfile, setShowAdminDashboard) => {
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Only redirect once per session and if we have a complete user profile
    if (!userProfile || !userProfile.onboardingComplete || hasRedirected.current) {
      return;
    }

    const userType = userProfile.userType;
    
    // Role-aware redirect logic
    if (userType === 'advisor') {
      // Advisors should automatically see their advisor dashboard
      if (setShowAdminDashboard) {
        setShowAdminDashboard(true);
        hasRedirected.current = true;
      }
    } else if (userType === 'student') {
      // Students should see the student dashboard (default behavior)
      if (setShowAdminDashboard) {
        setShowAdminDashboard(false);
        hasRedirected.current = true;
      }
    }
  }, [userProfile, setShowAdminDashboard]);

  // Reset redirect flag when user profile changes (e.g., logout/login)
  useEffect(() => {
    if (!userProfile) {
      hasRedirected.current = false;
    }
  }, [userProfile]);
};

export default useRoleRedirect;