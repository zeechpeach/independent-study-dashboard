import { meetingsService } from './meetingsService';

// Mock the firebase functions
jest.mock('./firebase', () => ({
  updateMeeting: jest.fn(),
  createAdvisorMeetingLog: jest.fn()
}));

describe('meetingsService', () => {
  describe('markOverdueMeetingsAsMissed', () => {
    it('should return meetings unchanged (deprecated function)', () => {
      // This function is deprecated and should no longer auto-mark meetings
      const now = new Date();
      const pastDate = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(); // 1 day ago
      const futureDate = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(); // 1 day from now
      
      const meetings = [
        { id: '1', scheduledDate: pastDate, status: 'pending-review' },
        { id: '2', scheduledDate: futureDate, status: 'pending-review' },
        { id: '3', scheduledDate: pastDate, status: 'attended' }
      ];

      const result = meetingsService.markOverdueMeetingsAsMissed(meetings);

      expect(result).toHaveLength(3);
      // Meetings should remain unchanged
      expect(result[0].status).toBe('pending-review');
      expect(result[1].status).toBe('pending-review');
      expect(result[2].status).toBe('attended');
    });
  });

  describe('getMeetingAttendanceCounts', () => {
    it('should calculate attendance counts correctly with new statuses', () => {
      const meetings = [
        { status: 'attended' },
        { status: 'completed' }, // backward compatibility
        { status: 'missed' },
        { status: 'no-show' }, // backward compatibility
        { status: 'scheduled' },
        { status: 'pending-review' },
        { status: 'cancelled' }
      ];

      const counts = meetingsService.getMeetingAttendanceCounts(meetings);

      expect(counts).toEqual({
        total: 7,
        completed: 2, // includes both 'attended' and 'completed'
        missed: 2, // includes both 'missed' and 'no-show'
        scheduled: 1,
        pendingReview: 1,
        cancelled: 1
      });
    });
  });

  describe('markStudentAttendance', () => {
    it('should call updateMeeting with correct data', async () => {
      const { updateMeeting } = require('./firebase');
      updateMeeting.mockResolvedValue({ id: 'meeting1' });

      await meetingsService.markStudentAttendance('meeting1', 'attended');

      expect(updateMeeting).toHaveBeenCalledWith('meeting1', expect.objectContaining({
        status: 'attended',
        studentSelfReported: true,
        studentAttendanceMarkedAt: expect.any(String)
      }));
    });
  });

  describe('createAdvisorMeetingLog', () => {
    it('should call createAdvisorMeetingLog with correct meeting data', async () => {
      const { createAdvisorMeetingLog } = require('./firebase');
      createAdvisorMeetingLog.mockResolvedValue('meeting123');

      const studentId = 'student1';
      const meetingDate = '2024-03-15';
      const advisorId = 'advisor1';
      const advisorName = 'Dr. Smith';

      const meetingId = await meetingsService.createAdvisorMeetingLog(
        studentId,
        meetingDate,
        advisorId,
        advisorName
      );

      expect(createAdvisorMeetingLog).toHaveBeenCalledWith(
        expect.objectContaining({
          studentId: studentId,
          scheduledDate: expect.stringContaining('2024-03-15'),
          status: 'attended',
          source: 'advisor-manual',
          attendanceMarked: true,
          studentAttended: true,
          advisorAttended: true,
          title: 'Meeting Log',
          description: expect.stringContaining(advisorName),
          attendanceNotes: expect.stringContaining(advisorName)
        }),
        advisorId
      );

      expect(meetingId).toBe('meeting123');
    });
  });

  describe('getMeetingsNeedingAttention', () => {
    it('should return all pending-review meetings regardless of date', () => {
      const now = new Date();
      const pastDate = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(); // 1 day ago
      const futureDate = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(); // 1 day from now
      
      const meetings = [
        { id: '1', scheduledDate: pastDate, status: 'pending-review', attendanceMarked: false },
        { id: '2', scheduledDate: futureDate, status: 'pending-review', attendanceMarked: false },
        { id: '3', scheduledDate: pastDate, status: 'attended', attendanceMarked: true },
        { id: '4', scheduledDate: futureDate, status: 'scheduled', attendanceMarked: false },
        { id: '5', scheduledDate: pastDate, status: 'cancelled', attendanceMarked: false }
      ];

      const result = meetingsService.getMeetingsNeedingAttention(meetings);

      // Should return both pending-review meetings (past and future)
      expect(result).toHaveLength(2);
      expect(result.map(m => m.id)).toEqual(expect.arrayContaining(['1', '2']));
    });

    it('should handle legacy scheduled meetings with studentSelfReported flag', () => {
      const now = new Date();
      const pastDate = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      
      const meetings = [
        { id: '1', scheduledDate: pastDate, status: 'scheduled', studentSelfReported: true, attendanceMarked: false },
        { id: '2', scheduledDate: pastDate, status: 'scheduled', studentSelfReported: false, attendanceMarked: false }
      ];

      const result = meetingsService.getMeetingsNeedingAttention(meetings);

      // Should return the student-logged scheduled meeting
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });
  });
});