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
      
      // Auto-mark overdue meetings as missed
      const updatedMeetings = meetingsService.markOverdueMeetingsAsMissed(userMeetings);
      
      // Update any meetings that changed status
      for (const meeting of updatedMeetings) {
        if (meeting.status === 'missed' && !meeting.autoMarkedAt) continue; // Skip if not newly marked
        if (meeting.status === 'missed' && meeting.autoMarkedAt && 
            !userMeetings.find(m => m.id === meeting.id && m.status === 'missed')) {
          // This meeting was just marked as missed, update in database
          await meetingsService.updateMeeting(meeting.id, {
            status: 'missed',
            autoMarkedAt: meeting.autoMarkedAt
          });
        }
      }
      
      // Filter out meetings that have been overridden by advisor
      // But keep them in the raw list for audit purposes
      const effectiveMeetings = updatedMeetings.filter(meeting => !meeting.overriddenBy);
      
      setMeetings(effectiveMeetings);
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

  // Mark student attendance (self-reporting)
  const markStudentAttendance = useCallback(async (meetingId, attendanceStatus) => {
    try {
      await meetingsService.markStudentAttendance(meetingId, attendanceStatus);
      // Refresh meetings to get updated data
      await fetchMeetings();
    } catch (error) {
      console.error('Error marking student attendance:', error);
      throw error;
    }
  }, [fetchMeetings]);

  // Get attendance counts
  const getAttendanceCounts = useCallback(() => {
    return meetingsService.getMeetingAttendanceCounts(meetings);
  }, [meetings]);

  return {
    // State
    meetings,
    loading,
    error,

    // Actions
    createMeeting,
    updateMeeting,
    refreshMeetings,
    markStudentAttendance,

    // Computed data
    upcomingMeetings: getUpcomingMeetings(),
    pastMeetings: getPastMeetings(),
    todaysMeetings: getTodaysMeetings(),
    meetingCounts: getMeetingCounts(),
    attendanceCounts: getAttendanceCounts(),

    // Utilities
    formatDate: meetingsService.formatMeetingDate,
    isMeetingToday: meetingsService.isMeetingToday,
    isMeetingOverdue: meetingsService.isMeetingOverdue
  };
};

export default useMeetings;