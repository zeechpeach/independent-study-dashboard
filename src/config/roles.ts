/**
 * User Roles and Role-based Configuration
 * 
 * Defines the available user roles and their properties.
 */

export type UserRole = 'student' | 'advisor' | 'sysadmin';

export interface RoleConfig {
  id: UserRole;
  displayName: string;
  description: string;
  capabilities: string[];
}

/**
 * Role configuration mapping
 */
export const roleConfigs: Record<UserRole, RoleConfig> = {
  student: {
    id: 'student',
    displayName: 'Student',
    description: 'Independent study participant',
    capabilities: [
      'view_own_data',
      'create_reflections',
      'manage_goals',
      'book_meetings',
      'view_assignments'
    ]
  },
  advisor: {
    id: 'advisor',
    displayName: 'Advisor',
    description: 'Student advisor and mentor',
    capabilities: [
      'view_student_data',
      'manage_meetings',
      'review_reflections',
      'provide_feedback',
      'track_progress',
      'manage_important_dates'
    ]
  },
  sysadmin: {
    id: 'sysadmin',
    displayName: 'System Administrator',
    description: 'System administrator (reserved for future use)',
    capabilities: [
      'system_administration',
      'user_management',
      'full_access'
    ]
  }
};

/**
 * Get role configuration by role ID
 */
export const getRoleConfig = (role: UserRole): RoleConfig => {
  return roleConfigs[role];
};

/**
 * Check if a role has a specific capability
 */
export const hasCapability = (role: UserRole, capability: string): boolean => {
  return roleConfigs[role].capabilities.includes(capability);
};

/**
 * Get display name for a role
 */
export const getRoleDisplayName = (role: UserRole): string => {
  return roleConfigs[role].displayName;
};