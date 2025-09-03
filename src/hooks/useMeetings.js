import { useState, useEffect, useCallback } from 'react';
import { meetingsService } from '../services/meetingsService';

/**
 * Custom hook for managing meeting data and operations
 * Provides state management and actions for meetings
 */
export const useMeetings = (userId) => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch meetings for the user
  const fetchMeetings = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      const userMeetings = await meetingsService.getUserMeetings(userId);
      setMeetings(userMeetings);
    } catch (err) {
      console.error('Error fetching meetings:', err);
      setError('Failed to load meetings');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Load meetings on mount and when userId changes
  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  // Create a new meeting
  const createMeeting = useCallback(async (meetingData) => {
    try {
      setError(null);
      const meetingId = await meetingsService.createMeeting({
        ...meetingData,
        studentId: userId
      });
      
      // Refresh meetings list
      await fetchMeetings();
      return meetingId;
    } catch (err) {
      console.error('Error creating meeting:', err);
      setError('Failed to create meeting');
      throw err;
    }
  }, [userId, fetchMeetings]);

  // Update an existing meeting
  const updateMeeting = useCallback(async (meetingId, data) => {
    try {
      setError(null);
      await meetingsService.updateMeeting(meetingId, data);
      
      // Refresh meetings list
      await fetchMeetings();
    } catch (err) {
      console.error('Error updating meeting:', err);
      setError('Failed to update meeting');
      throw err;
    }
  }, [fetchMeetings]);

  // Get filtered meetings
  const getUpcomingMeetings = useCallback(() => {
    return meetingsService.filterMeetings(meetings, 'upcoming');
  }, [meetings]);

  const getPastMeetings = useCallback(() => {
    return meetingsService.filterMeetings(meetings, 'past');
  }, [meetings]);

  const getTodaysMeetings = useCallback(() => {
    return meetingsService.filterMeetings(meetings, 'today');
  }, [meetings]);

  // Get meeting counts
  const getMeetingCounts = useCallback(() => {
    const upcoming = getUpcomingMeetings().length;
    const past = getPastMeetings().length;
    const today = getTodaysMeetings().length;
    const overdue = meetings.filter(meeting => 
      meetingsService.isMeetingOverdue(meeting)
    ).length;

    return {
      total: meetings.length,
      upcoming,
      past,
      today,
      overdue
    };
  }, [meetings, getUpcomingMeetings, getPastMeetings, getTodaysMeetings]);

  // Refresh meetings data
  const refreshMeetings = useCallback(() => {
    return fetchMeetings();
  }, [fetchMeetings]);

  return {
    // State
    meetings,
    loading,
    error,

    // Actions
    createMeeting,
    updateMeeting,
    refreshMeetings,

    // Computed data
    upcomingMeetings: getUpcomingMeetings(),
    pastMeetings: getPastMeetings(),
    todaysMeetings: getTodaysMeetings(),
    meetingCounts: getMeetingCounts(),

    // Utilities
    formatDate: meetingsService.formatMeetingDate,
    isMeetingToday: meetingsService.isMeetingToday,
    isMeetingOverdue: meetingsService.isMeetingOverdue
  };
};

export default useMeetings;