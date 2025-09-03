// Goal status constants
export const GOAL_STATUS = {
  NOT_STARTED: 'not_started',
  ACTIVE: 'active', 
  COMPLETED: 'completed'
};

/**
 * Checks if a goal is overdue
 * A goal is overdue if its target date is before today and it's not completed
 * @param {Object} goal - Goal object with targetDate and status
 * @returns {boolean} - True if goal is overdue
 */
export const isGoalOverdue = (goal) => {
  if (!goal || !goal.targetDate) return false;
  
  const today = new Date();
  const targetDate = new Date(goal.targetDate);
  
  // Reset time to start of day for accurate comparison
  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);
  
  const status = goal.status || GOAL_STATUS.ACTIVE;
  
  return targetDate < today && status !== GOAL_STATUS.COMPLETED;
};

/**
 * Returns display status information for a goal
 * @param {Object} goal - Goal object with status and targetDate
 * @returns {Object} - Object with label and variant for display
 */
export const goalDisplayStatus = (goal) => {
  if (!goal) {
    return { label: 'Unknown', variant: 'gray' };
  }
  
  const status = goal.status || GOAL_STATUS.ACTIVE;
  
  // Check if overdue first (highest priority)
  if (isGoalOverdue(goal)) {
    return { label: 'Overdue', variant: 'red' };
  }
  
  // Return status-based display
  switch (status) {
    case GOAL_STATUS.NOT_STARTED:
      return { label: 'Not Started', variant: 'gray' };
    case GOAL_STATUS.ACTIVE:
      return { label: 'Active', variant: 'blue' };
    case GOAL_STATUS.COMPLETED:
      return { label: 'Done', variant: 'green' };
    default:
      return { label: 'Unknown', variant: 'gray' };
  }
};

/**
 * Gets the appropriate status color classes for display
 * @param {string} variant - Color variant (red, blue, green, gray)
 * @returns {string} - CSS classes for the status
 */
export const getStatusClasses = (variant) => {
  const baseClasses = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium';
  
  switch (variant) {
    case 'red':
      return `${baseClasses} bg-red-100 text-red-800`;
    case 'blue':
      return `${baseClasses} bg-blue-100 text-blue-800`;
    case 'green':
      return `${baseClasses} bg-green-100 text-green-800`;
    case 'gray':
    default:
      return `${baseClasses} bg-gray-100 text-gray-800`;
  }
};