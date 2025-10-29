import { 
  createMeeting, 
  updateMeeting, 
  deleteMeeting,
  getUserMeetings,
  getAllMeetings,
  createAdvisorMeetingLog
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

  // Delete a meeting
  async deleteMeeting(meetingId) {
    try {
      return await deleteMeeting(meetingId);
    } catch (error) {
      console.error('Error deleting meeting:', error);
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

  // Filter meetings by status and date (day-level precision)
  filterMeetings(meetings, filter = 'upcoming') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    switch (filter) {
      case 'upcoming':
        return meetings
          .filter(meeting => {
            const meetingDate = new Date(meeting.scheduledDate);
            meetingDate.setHours(0, 0, 0, 0);
            return meetingDate >= today;
          })
          .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
      
      case 'past':
        return meetings
          .filter(meeting => {
            const meetingDate = new Date(meeting.scheduledDate);
            meetingDate.setHours(0, 0, 0, 0);
            return meetingDate < today;
          })
          .sort((a, b) => new Date(b.scheduledDate) - new Date(a.scheduledDate));
      
      case 'today':
        return meetings
          .filter(meeting => {
            const meetingDate = new Date(meeting.scheduledDate);
            meetingDate.setHours(0, 0, 0, 0);
            return meetingDate.getTime() === today.getTime();
          })
          .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
      
      default:
        return meetings.sort((a, b) => new Date(b.scheduledDate) - new Date(a.scheduledDate));
    }
  },

  // Format meeting data for display (date only, no time)
  formatMeetingDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },

  // Check if a meeting is today
  isMeetingToday(meeting) {
    const today = new Date();
    const meetingDate = new Date(meeting.scheduledDate);
    
    return today.toDateString() === meetingDate.toDateString();
  },

  // Check if a meeting is overdue (day-level precision)
  isMeetingOverdue(meeting) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const meetingDate = new Date(meeting.scheduledDate);
    meetingDate.setHours(0, 0, 0, 0);
    
    return meetingDate < today && meeting.status !== 'completed' && meeting.status !== 'cancelled';
  },

  // Mark attendance for a meeting (advisor function)
  // Changes status from 'pending-review' to 'attended' or 'missed'
  async markAttendance(meetingId, attendanceData) {
    try {
      return await updateMeeting(meetingId, {
        attendanceMarked: true,
        studentAttended: attendanceData.studentAttended,
        advisorAttended: attendanceData.advisorAttended || true,
        attendanceNotes: attendanceData.notes || '',
        attendanceMarkedAt: new Date().toISOString(),
        // Use 'attended' instead of 'completed' and 'missed' instead of 'no-show' for clarity
        status: attendanceData.studentAttended ? 'attended' : 'missed'
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
  // All logged meetings appear here until advisor manually confirms attendance
  // This includes ALL meetings logged by students (past, present, or future) that haven't been reviewed
  getMeetingsNeedingAttention(meetings) {
    return meetings.filter(meeting => {
      // Skip cancelled meetings
      if (meeting.status === 'cancelled') return false;
      
      // Skip meetings where attendance has already been confirmed by advisor
      if (meeting.attendanceMarked) return false;
      
      // Show all pending-review meetings (new status for student-logged meetings)
      if (meeting.status === 'pending-review') return true;
      
      // For backward compatibility, also show scheduled meetings logged by students
      // that haven't been confirmed by advisor (legacy behavior)
      if (meeting.status === 'scheduled' && meeting.studentSelfReported && !meeting.attendanceMarked) {
        return true;
      }
      
      return false;
    });
  },

  // Auto-mark meetings as missed when they pass their scheduled time
  // DEPRECATED: This function is no longer used to prevent auto-marking student-logged meetings as missed
  // Meetings should only be marked as attended/missed by advisors after review
  markOverdueMeetingsAsMissed(meetings) {
    // Return meetings unchanged - no automatic status changes
    // Advisors must manually review and confirm attendance for all meetings
    return meetings;
  },

  // Mark student attendance for a meeting (student self-reporting)
  async markStudentAttendance(meetingId, attendanceStatus) {
    try {
      const now = new Date().toISOString();
      return await updateMeeting(meetingId, {
        status: attendanceStatus, // 'completed' or 'missed'
        studentSelfReported: true,
        studentAttendanceMarkedAt: now,
        updatedAt: now
      });
    } catch (error) {
      console.error('Error marking student attendance:', error);
      throw error;
    }
  },

  // Get meeting attendance counts for a student
  getMeetingAttendanceCounts(meetings) {
    const counts = {
      total: meetings.length,
      completed: 0,
      missed: 0,
      scheduled: 0,
      cancelled: 0,
      pendingReview: 0
    };

    meetings.forEach(meeting => {
      switch (meeting.status) {
        case 'attended':
        case 'completed': // backward compatibility
          counts.completed++;
          break;
        case 'missed':
        case 'no-show': // backward compatibility
          counts.missed++;
          break;
        case 'scheduled':
          counts.scheduled++;
          break;
        case 'pending-review':
          counts.pendingReview++;
          break;
        case 'cancelled':
          counts.cancelled++;
          break;
        default:
          break;
      }
    });

    return counts;
  },

  // Create meeting log on behalf of student (advisor function)
  // Automatically handles overriding student logs for the same date
  async createAdvisorMeetingLog(studentId, meetingDate, advisorId, advisorName, attended = true) {
    try {
      // Store the date at midnight local time to work with day-level precision
      const scheduledDateTime = new Date(`${meetingDate}T00:00:00`);
      
      // Determine status based on attendance
      const status = attended ? 'attended' : 'missed';
      
      const meetingData = {
        title: 'Meeting Log',
        description: `Meeting logged by advisor ${advisorName}`,
        scheduledDate: scheduledDateTime.toISOString(),
        duration: 30, // Default 30 minutes
        meetingLink: '',
        status: status,
        source: 'advisor-manual',
        attendanceMarked: true,  // Advisor has confirmed this meeting happened
        studentAttended: attended,
        advisorAttended: true,
        attendanceNotes: `Logged by ${advisorName}${attended ? '' : ' - Student did not attend'}`,
        attendanceMarkedAt: new Date().toISOString(),
        studentId: studentId,
        advisorFeedback: ''
      };
      
      return await createAdvisorMeetingLog(meetingData, advisorId);
    } catch (error) {
      console.error('Error creating advisor meeting log:', error);
      throw error;
    }
  }
};

export default meetingsService;