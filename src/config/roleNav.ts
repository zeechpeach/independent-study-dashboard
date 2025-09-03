/**
 * Role-based Navigation Configuration
 * 
 * Defines navigation items and structure for different user roles.
 */

import { UserRole } from './roles';

export interface NavItem {
  id: string;
  label: string;
  href?: string;
  icon?: string;
  children?: NavItem[];
  capabilities?: string[];
}

/**
 * Advisor navigation items
 * Focused on student oversight, progress tracking, and mentoring activities
 */
export const advisorNavItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/advisor',
    icon: 'LayoutDashboard',
    capabilities: ['view_student_data']
  },
  {
    id: 'students',
    label: 'Students',
    href: '/advisor/students',
    icon: 'Users',
    capabilities: ['view_student_data']
  },
  {
    id: 'meetings',
    label: 'Meetings',
    href: '/advisor/meetings',
    icon: 'Calendar',
    capabilities: ['manage_meetings']
  },
  {
    id: 'reflections',
    label: 'Reflections',
    href: '/advisor/reflections',
    icon: 'MessageSquare',
    capabilities: ['review_reflections']
  },
  {
    id: 'progress',
    label: 'Progress Tracking',
    href: '/advisor/progress',
    icon: 'TrendingUp',
    capabilities: ['track_progress']
  },
  {
    id: 'dates',
    label: 'Important Dates',
    href: '/advisor/dates',
    icon: 'Calendar',
    capabilities: ['manage_important_dates']
  }
];

/**
 * Student navigation items (for reference/consistency)
 */
export const studentNavItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/student',
    icon: 'LayoutDashboard',
    capabilities: ['view_own_data']
  },
  {
    id: 'goals',
    label: 'Goals',
    href: '/student/goals',
    icon: 'Target',
    capabilities: ['manage_goals']
  },
  {
    id: 'reflections',
    label: 'Reflections',
    href: '/student/reflections',
    icon: 'BookOpen',
    capabilities: ['create_reflections']
  },
  {
    id: 'meetings',
    label: 'Meetings',
    href: '/student/meetings',
    icon: 'Calendar',
    capabilities: ['book_meetings']
  }
];

/**
 * Get navigation items for a specific role
 */
export const getNavItemsForRole = (role: UserRole): NavItem[] => {
  switch (role) {
    case 'advisor':
      return advisorNavItems;
    case 'student':
      return studentNavItems;
    case 'sysadmin':
      // Sysadmin gets both advisor and student items for now
      return [...advisorNavItems, ...studentNavItems];
    default:
      return [];
  }
};

/**
 * Filter navigation items by user capabilities
 */
export const filterNavByCapabilities = (
  navItems: NavItem[],
  userCapabilities: string[]
): NavItem[] => {
  return navItems.filter(item => {
    if (!item.capabilities || item.capabilities.length === 0) {
      return true; // No capabilities required
    }
    return item.capabilities.some(cap => userCapabilities.includes(cap));
  });
};