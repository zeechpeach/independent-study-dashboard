/**
 * Date utilities for Pacific timezone normalization
 */

/**
 * Get current date in Pacific timezone
 * @returns {Date} Current date normalized to Pacific timezone
 */
export const getPacificDate = () => {
  const now = new Date();
  // Convert to Pacific timezone (UTC-8 standard, UTC-7 daylight)
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const pacificOffset = -8; // Pacific Standard Time
  const pacificTime = new Date(utc + (pacificOffset * 3600000));
  return pacificTime;
};

/**
 * Check if a date is the same day in Pacific timezone
 * @param {Date|string} date1 - First date
 * @param {Date|string} date2 - Second date
 * @returns {boolean} True if dates are same day in Pacific timezone
 */
export const isSameDayPacific = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  // Convert both dates to Pacific timezone
  const pacific1 = convertToPacific(d1);
  const pacific2 = convertToPacific(d2);
  
  return pacific1.toDateString() === pacific2.toDateString();
};

/**
 * Convert a date to Pacific timezone
 * @param {Date|string} date - Date to convert
 * @returns {Date} Date converted to Pacific timezone
 */
export const convertToPacific = (date) => {
  const d = new Date(date);
  const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
  const pacificOffset = -8; // Pacific Standard Time (adjust for daylight saving if needed)
  return new Date(utc + (pacificOffset * 3600000));
};

/**
 * Check if a target date allows same-day completion (Pacific timezone)
 * This allows for same-day goals to be created and completed
 * @param {Date|string} targetDate - Target date to check
 * @param {Date|string} currentDate - Current date (defaults to now)
 * @returns {boolean} True if target date is today or in the future (Pacific time)
 */
export const isValidTargetDate = (targetDate, currentDate = null) => {
  if (!targetDate) return true; // No target date is always valid
  
  const target = new Date(targetDate);
  const current = currentDate ? new Date(currentDate) : getPacificDate();
  
  // Convert both to Pacific timezone and compare dates only
  const targetPacific = convertToPacific(target);
  const currentPacific = convertToPacific(current);
  
  // Reset time to start of day for accurate comparison
  targetPacific.setHours(0, 0, 0, 0);
  currentPacific.setHours(0, 0, 0, 0);
  
  return targetPacific >= currentPacific;
};

/**
 * Format date for display in Pacific timezone
 * @param {Date|string} date - Date to format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatDatePacific = (date, options = {}) => {
  if (!date) return 'No date';
  
  const d = convertToPacific(date);
  const defaultOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'America/Los_Angeles'
  };
  
  return d.toLocaleDateString('en-US', { ...defaultOptions, ...options });
};