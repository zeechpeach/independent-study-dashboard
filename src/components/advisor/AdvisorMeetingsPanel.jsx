import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, User, CheckCircle, AlertCircle, Users, Plus } from 'lucide-react';
import { meetingsService } from '../../services/meetingsService';
import { getStudentsByAdvisor } from '../../services/firebase';
import AdvisorMeetingLogModal from './AdvisorMeetingLogModal';

/**
 * Component for advisors to manage meetings - mark attendance and provide feedback
 */
const AdvisorMeetingsPanel = ({ advisorEmail, userProfile }) => {
  const [meetings, setMeetings] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('upcoming'); // upcoming, past, needs-attention
  const [showLogModal, setShowLogModal] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get students assigned to this advisor
      const studentsData = await getStudentsByAdvisor(advisorEmail);
      setStudents(studentsData);

      // Get all meetings and filter for our students
      const allMeetings = await meetingsService.getAllMeetings();
      const studentIds = studentsData.map(s => s.id);
      const advisorMeetings = allMeetings.filter(meeting => 
        studentIds.includes(meeting.studentId)
      );

      setMeetings(advisorMeetings);
    } catch (err) {
      console.error('Error fetching advisor meetings:', err);
      setError('Failed to load meetings');
    } finally {
      setLoading(false);
    }
  }, [advisorEmail]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleMarkAttendance = async (meeting, attended) => {
    try {
      await meetingsService.markAttendance(meeting.id, {
        studentAttended: attended,
        advisorAttended: true,
        notes: `Attendance marked by ${userProfile?.name || advisorEmail}`
      });
      
      // Refresh data
      await fetchData();
    } catch (error) {
      console.error('Error marking attendance:', error);
      alert('Failed to mark attendance. Please try again.');
    }
  };

  const handleLogMeeting = async (studentId, meetingDate) => {
    try {
      await meetingsService.createAdvisorMeetingLog(
        studentId,
        meetingDate,
        userProfile.id,
        userProfile.name || advisorEmail
      );
      
      // Refresh data
      await fetchData();
    } catch (error) {
      console.error('Error logging meeting:', error);
      throw error; // Let the modal handle the error display
    }
  };

  const getFilteredMeetings = () => {
    switch (filter) {
      case 'upcoming':
        // Only show future meetings that are actually upcoming (not logged meetings needing confirmation)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return meetings
          .filter(meeting => {
            const meetingDate = new Date(meeting.scheduledDate);
            meetingDate.setHours(0, 0, 0, 0);
            // Show only meetings that are in the future and have been confirmed (attendanceMarked = true)
            // OR meetings that are truly upcoming (scheduled from booking systems, not manually logged)
            return meetingDate >= today && (meeting.attendanceMarked || meeting.source !== 'manual');
          })
          .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
      case 'past':
        // Only show meetings where attendance has been marked (confirmed by advisor)
        // Filter out meetings that were overridden
        return meetings
          .filter(meeting => meeting.attendanceMarked && !meeting.overriddenBy)
          .sort((a, b) => new Date(b.scheduledDate) - new Date(a.scheduledDate));
      case 'needs-attention':
        return meetingsService.getMeetingsNeedingAttention(meetings);
      default:
        return meetings;
    }
  };

  const getStudentName = (studentId) => {
    const student = students.find(s => s.id === studentId);
    return student?.name || 'Unknown Student';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Meeting Management</h3>
        </div>
        <div className="text-center py-8">
          <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-spin" />
          <p className="text-gray-600">Loading meetings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Meeting Management</h3>
        </div>
        <div className="text-center py-8">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchData}
            className="btn btn-sm btn-secondary mt-2"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const filteredMeetings = getFilteredMeetings();

  return (
    <>
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Meeting Management</h3>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">{students.length} students</span>
              </div>
              <button
                onClick={() => setShowLogModal(true)}
                className="btn btn-sm btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Log Meeting
              </button>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex border-b border-gray-200 mb-4">
            {[
              { key: 'upcoming', label: 'Upcoming' },
              { key: 'needs-attention', label: 'Needs Attention' },
              { key: 'past', label: 'Past' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  filter === tab.key
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {tab.key === 'needs-attention' && meetingsService.getMeetingsNeedingAttention(meetings).length > 0 && (
                  <span className="ml-1 bg-red-100 text-red-600 text-xs px-1.5 py-0.5 rounded-full">
                    {meetingsService.getMeetingsNeedingAttention(meetings).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Meetings list */}
          <div className="space-y-3">
            {filteredMeetings.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">
                  {filter === 'upcoming' && 'No upcoming meetings'}
                  {filter === 'past' && 'No past meetings'}
                  {filter === 'needs-attention' && 'No meetings need attention'}
                </p>
              </div>
            ) : (
              filteredMeetings.map(meeting => (
                <MeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  studentName={getStudentName(meeting.studentId)}
                  onMarkAttendance={handleMarkAttendance}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <AdvisorMeetingLogModal
        isOpen={showLogModal}
        onClose={() => setShowLogModal(false)}
        onSave={handleLogMeeting}
        students={students}
        userProfile={userProfile}
      />
    </>
  );
};

// Individual meeting card component
const MeetingCard = ({ meeting, studentName, onMarkAttendance }) => {
  const isToday = meetingsService.isMeetingToday(meeting);
  const isOverdue = meetingsService.isMeetingOverdue(meeting);
  
  // Check if past using day-level precision
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const meetingDate = new Date(meeting.scheduledDate);
  meetingDate.setHours(0, 0, 0, 0);
  const isPast = meetingDate < today;

  const getStatusColor = () => {
    if (meeting.status === 'completed') return 'bg-green-50 border-green-200';
    if (meeting.status === 'cancelled') return 'bg-red-50 border-red-200';
    if (meeting.status === 'no-show') return 'bg-orange-50 border-orange-200';
    if (isOverdue) return 'bg-red-50 border-red-200';
    if (isToday) return 'bg-blue-50 border-blue-200';
    return 'bg-gray-50 border-gray-200';
  };

  return (
    <div className={`p-4 rounded-lg border ${getStatusColor()}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-gray-900">
              {meeting.title || 'Meeting'}
            </h4>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              meeting.status === 'completed' ? 'bg-green-100 text-green-800' :
              meeting.status === 'cancelled' ? 'bg-red-100 text-red-800' :
              meeting.status === 'no-show' ? 'bg-orange-100 text-orange-800' :
              isOverdue ? 'bg-red-100 text-red-800' :
              isToday ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {meeting.status === 'no-show' ? 'No Show' : 
               meeting.status === 'completed' ? 'Completed' :
               meeting.status === 'cancelled' ? 'Cancelled' :
               isOverdue ? 'Overdue' :
               isToday ? 'Today' : 'Scheduled'}
            </span>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>{studentName}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{meetingsService.formatMeetingDate(meeting.scheduledDate)}</span>
            </div>
          </div>

          {meeting.description && (
            <p className="text-sm text-gray-600 mb-2">{meeting.description}</p>
          )}

          {meeting.advisorFeedback && (
            <div className="bg-blue-50 p-2 rounded text-sm">
              <strong>Feedback:</strong> {meeting.advisorFeedback}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 ml-4">
          {/* Attendance buttons */}
          {isPast && !meeting.attendanceMarked && (
            <div className="flex gap-1">
              <button
                onClick={() => onMarkAttendance(meeting, true)}
                className="btn btn-xs btn-success"
                title="Mark as attended"
              >
                <CheckCircle className="w-3 h-3" />
                Attended
              </button>
              <button
                onClick={() => onMarkAttendance(meeting, false)}
                className="btn btn-xs btn-error"
                title="Mark as no-show"
              >
                No Show
              </button>
            </div>
          )}

          {/* Status indicators */}
          {meeting.attendanceMarked && (
            <div className="text-xs text-green-600 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Attendance marked
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvisorMeetingsPanel;