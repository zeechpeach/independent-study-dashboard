import { meetingsService } from './meetingsService';

// Mock the firebase functions
jest.mock('./firebase', () => ({
  updateMeeting: jest.fn(),
  createAdvisorMeetingLog: jest.fn()
}));

describe('meetingsService', () => {
  describe('markOverdueMeetingsAsMissed', () => {
    it('should mark overdue scheduled meetings as missed', () => {
      // Create dates that are definitely in the past and future
      const now = new Date();
      const pastDate = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(); // 1 day ago
      const futureDate = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(); // 1 day from now
      
      const meetings = [
        { id: '1', scheduledDate: pastDate, status: 'scheduled' },
        { id: '2', scheduledDate: futureDate, status: 'scheduled' },
        { id: '3', scheduledDate: pastDate, status: 'completed' }
      ];

      const result = meetingsService.markOverdueMeetingsAsMissed(meetings);

      expect(result).toHaveLength(3);
      expect(result[0].status).toBe('missed');
      expect(result[0]).toHaveProperty('autoMarkedAt');
      expect(result[1].status).toBe('scheduled'); // Future meeting stays scheduled
      expect(result[2].status).toBe('completed'); // Completed meeting stays completed
    });
  });

  describe('getMeetingAttendanceCounts', () => {
    it('should calculate attendance counts correctly', () => {
      const meetings = [
        { status: 'completed' },
        { status: 'completed' },
        { status: 'missed' },
        { status: 'no-show' },
        { status: 'scheduled' },
        { status: 'cancelled' }
      ];

      const counts = meetingsService.getMeetingAttendanceCounts(meetings);

      expect(counts).toEqual({
        total: 6,
        completed: 2,
        missed: 2, // includes both 'missed' and 'no-show'
        scheduled: 1,
        cancelled: 1
      });
    });
  });

  describe('markStudentAttendance', () => {
    it('should call updateMeeting with correct data', async () => {
      const { updateMeeting } = require('./firebase');
      updateMeeting.mockResolvedValue({ id: 'meeting1' });

      await meetingsService.markStudentAttendance('meeting1', 'completed');

      expect(updateMeeting).toHaveBeenCalledWith('meeting1', expect.objectContaining({
        status: 'completed',
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
          status: 'completed',
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
});