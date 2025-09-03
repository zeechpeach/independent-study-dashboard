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
  }
};

export default meetingsService;