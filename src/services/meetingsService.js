import { 
  createMeeting, 
  updateMeeting, 
  getUserMeetings,
  getAllMeetings 
} from './firebase';

/**
 * Service for handling meeting-related operations
 * Provides a clean interface for meeting data management
 */
export const meetingsService = {
  // Create a new meeting
  async createMeeting(meetingData) {
    try {
      return await createMeeting(meetingData);
    } catch (error) {
      console.error('Error creating meeting:', error);
      throw error;
    }
  },

  // Update an existing meeting
  async updateMeeting(meetingId, data) {
    try {
      return await updateMeeting(meetingId, data);
    } catch (error) {
      console.error('Error updating meeting:', error);
      throw error;
    }
  },

  // Get meetings for a specific user
  async getUserMeetings(userId) {
    try {
      return await getUserMeetings(userId);
    } catch (error) {
      console.error('Error fetching user meetings:', error);
      throw error;
    }
  },

  // Get all meetings (admin function)
  async getAllMeetings() {
    try {
      return await getAllMeetings();
    } catch (error) {
      console.error('Error fetching all meetings:', error);
      throw error;
    }
  },

  // Filter meetings by status and date
  filterMeetings(meetings, filter = 'upcoming') {
    const now = new Date();
    
    switch (filter) {
      case 'upcoming':
        return meetings
          .filter(meeting => new Date(meeting.scheduledDate) >= now)
          .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
      
      case 'past':
        return meetings
          .filter(meeting => new Date(meeting.scheduledDate) < now)
          .sort((a, b) => new Date(b.scheduledDate) - new Date(a.scheduledDate));
      
      case 'today':
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        return meetings
          .filter(meeting => {
            const meetingDate = new Date(meeting.scheduledDate);
            return meetingDate >= today && meetingDate < tomorrow;
          })
          .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
      
      default:
        return meetings.sort((a, b) => new Date(b.scheduledDate) - new Date(a.scheduledDate));
    }
  },

  // Format meeting data for display
  formatMeetingDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  },

  // Check if a meeting is today
  isMeetingToday(meeting) {
    const today = new Date();
    const meetingDate = new Date(meeting.scheduledDate);
    
    return today.toDateString() === meetingDate.toDateString();
  },

  // Check if a meeting is overdue
  isMeetingOverdue(meeting) {
    const now = new Date();
    const meetingDate = new Date(meeting.scheduledDate);
    
    return meetingDate < now && meeting.status !== 'completed' && meeting.status !== 'cancelled';
  },

  // Mark attendance for a meeting (advisor function)
  async markAttendance(meetingId, attendanceData) {
    try {
      return await updateMeeting(meetingId, {
        attendanceMarked: true,
        studentAttended: attendanceData.studentAttended,
        advisorAttended: attendanceData.advisorAttended || true,
        attendanceNotes: attendanceData.notes || '',
        attendanceMarkedAt: new Date().toISOString(),
        status: attendanceData.studentAttended ? 'completed' : 'no-show'
      });
    } catch (error) {
      console.error('Error marking attendance:', error);
      throw error;
    }
  },

  // Add feedback to a meeting (advisor function)
  async addFeedback(meetingId, feedbackData) {
    try {
      return await updateMeeting(meetingId, {
        advisorFeedback: feedbackData.feedback,
        actionItems: feedbackData.actionItems || [],
        nextSteps: feedbackData.nextSteps || '',
        feedbackAddedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error adding feedback:', error);
      throw error;
    }
  },

  // Get meetings for an advisor (by advisor name)
  async getAdvisorMeetings(advisorName) {
    try {
      const allMeetings = await getAllMeetings();
      // Filter meetings where the student's advisor matches
      // This requires looking up student profiles, but for now we'll use a simpler approach
      // In a real implementation, we'd need to join with user data
      return allMeetings.filter(meeting => meeting.advisorName === advisorName);
    } catch (error) {
      console.error('Error getting advisor meetings:', error);
      throw error;
    }
  },

  // Get meetings that need attention (for advisors)
  getMeetingsNeedingAttention(meetings) {
    const now = new Date();
    return meetings.filter(meeting => {
      // Meetings that are overdue or completed but missing feedback
      return this.isMeetingOverdue(meeting) || 
             (meeting.status === 'completed' && !meeting.advisorFeedback) ||
             (meeting.status === 'scheduled' && !meeting.attendanceMarked && new Date(meeting.scheduledDate) < now);
    });
  }
};

export default meetingsService;