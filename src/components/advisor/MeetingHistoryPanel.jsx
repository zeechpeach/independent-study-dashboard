import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, User, Filter, ChevronDown, Edit2, Save, X } from 'lucide-react';
import { meetingsService } from '../../services/meetingsService';
import { getStudentsByAdvisor } from '../../services/firebase';

/**
 * Meeting History Panel - Display and manage all past meetings
 * Allows advisors to review and edit attendance status for historical meetings
 */
const MeetingHistoryPanel = ({ advisorEmail, userProfile, onBack }) => {
  const [meetings, setMeetings] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter state
  const [filters, setFilters] = useState({
    studentId: '',
    status: '',
    startDate: '',
    endDate: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Editing state
  const [editingMeetingId, setEditingMeetingId] = useState(null);
  const [editingStatus, setEditingStatus] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get students assigned to this advisor
      const studentsData = await getStudentsByAdvisor(advisorEmail);
      setStudents(studentsData);

      // Get all meetings and filter for our students
      const allMeetings = await meetingsService.getAllMeetings();
      // Use Set for O(1) lookup performance
      const studentIds = new Set(studentsData.map(s => s.id));
      const advisorMeetings = allMeetings.filter(meeting => 
        studentIds.has(meeting.studentId)
      );

      setMeetings(advisorMeetings);
    } catch (err) {
      console.error('Error fetching meeting history:', err);
      setError('Failed to load meeting history');
    } finally {
      setLoading(false);
    }
  }, [advisorEmail]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getFilteredMeetings = () => {
    let filtered = meetings.filter(meeting => {
      // Only show meetings where attendance has been marked
      if (!meeting.attendanceMarked) return false;
      
      // Don't show overridden meetings
      if (meeting.overriddenBy) return false;
      
      return true;
    });

    // Apply student filter
    if (filters.studentId) {
      filtered = filtered.filter(m => m.studentId === filters.studentId);
    }

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(m => m.status === filters.status);
    }

    // Apply date range filters
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      startDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(m => {
        const meetingDate = new Date(m.scheduledDate);
        meetingDate.setHours(0, 0, 0, 0);
        return meetingDate >= startDate;
      });
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(m => {
        const meetingDate = new Date(m.scheduledDate);
        return new Date(meetingDate) <= endDate;
      });
    }

    // Sort by date descending (most recent first)
    return filtered.sort((a, b) => new Date(b.scheduledDate) - new Date(a.scheduledDate));
  };

  const getStudentName = (studentId) => {
    const student = students.find(s => s.id === studentId);
    return student?.name || 'Unknown Student';
  };

  const handleStartEdit = (meeting) => {
    setEditingMeetingId(meeting.id);
    setEditingStatus(meeting.status);
  };

  const handleCancelEdit = () => {
    setEditingMeetingId(null);
    setEditingStatus(null);
  };

  const [saveError, setSaveError] = useState(null);

  const handleSaveEdit = async (meetingId) => {
    try {
      setSaveError(null);
      // Map status to studentAttended boolean
      const studentAttended = editingStatus === 'attended';
      
      await meetingsService.markAttendance(meetingId, {
        studentAttended: studentAttended,
        advisorAttended: true,
        notes: `Attendance updated by ${userProfile?.name || advisorEmail}`
      });
      
      // Refresh data
      await fetchData();
      handleCancelEdit();
    } catch (error) {
      console.error('Error updating attendance:', error);
      setSaveError('Failed to update attendance. Please try again.');
    }
  };

  const clearFilters = () => {
    setFilters({
      studentId: '',
      status: '',
      startDate: '',
      endDate: ''
    });
  };

  const filteredMeetings = getFilteredMeetings();

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto p-6">
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-800 text-sm mb-4"
          >
            ← Back to Dashboard
          </button>
          <div className="flex items-center justify-center py-12">
            <Clock className="w-8 h-8 text-gray-400 animate-spin mr-2" />
            <span className="text-gray-600">Loading meeting history...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-800 text-sm mb-2"
          >
            ← Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Meeting History</h1>
              <p className="text-gray-600">Review and edit past meeting attendance</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {filteredMeetings.length} meeting{filteredMeetings.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900">Filters</span>
              {(filters.studentId || filters.status || filters.startDate || filters.endDate) && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  Active
                </span>
              )}
            </div>
            <ChevronDown className={`w-5 h-5 text-gray-600 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          {showFilters && (
            <div className="p-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student
                  </label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={filters.studentId}
                    onChange={(e) => setFilters({ ...filters, studentId: e.target.value })}
                  >
                    <option value="">All Students</option>
                    {students.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  >
                    <option value="">All Statuses</option>
                    <option value="attended">Attended</option>
                    <option value="missed">Missed</option>
                    <option value="completed">Completed (Legacy)</option>
                    <option value="no-show">No Show (Legacy)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Save error state */}
        {saveError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center justify-between">
            <p className="text-red-600">{saveError}</p>
            <button 
              onClick={() => setSaveError(null)}
              className="text-red-600 hover:text-red-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Meetings list */}
        <div className="space-y-3">
          {filteredMeetings.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No meetings found</h3>
              <p className="text-gray-600">
                {(filters.studentId || filters.status || filters.startDate || filters.endDate)
                  ? 'Try adjusting your filters to see more results'
                  : 'No past meetings with confirmed attendance yet'}
              </p>
            </div>
          ) : (
            filteredMeetings.map(meeting => (
              <MeetingHistoryCard
                key={meeting.id}
                meeting={meeting}
                studentName={getStudentName(meeting.studentId)}
                isEditing={editingMeetingId === meeting.id}
                editingStatus={editingStatus}
                onStartEdit={handleStartEdit}
                onCancelEdit={handleCancelEdit}
                onSaveEdit={handleSaveEdit}
                onStatusChange={setEditingStatus}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Individual meeting history card component
const MeetingHistoryCard = ({ 
  meeting, 
  studentName, 
  isEditing,
  editingStatus,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onStatusChange
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'attended':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'missed':
      case 'no-show':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'attended':
      case 'completed':
        return 'Attended';
      case 'missed':
      case 'no-show':
        return 'Missed';
      default:
        return status;
    }
  };

  const getMeetingSource = (meeting) => {
    return {
      isStudentLogged: meeting.source === 'manual' || meeting.studentSelfReported,
      isAdvisorLogged: meeting.source === 'advisor-manual'
    };
  };

  const { isStudentLogged, isAdvisorLogged } = getMeetingSource(meeting);

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-medium text-gray-900">
              {meeting.title || 'Meeting'}
            </h3>
            
            {/* Status badge - editable */}
            {isEditing ? (
              <select
                value={editingStatus}
                onChange={(e) => onStatusChange(e.target.value)}
                className="text-xs px-2 py-1 rounded-full font-medium border border-gray-300 focus:ring-2 focus:ring-blue-500"
              >
                <option value="attended">Attended</option>
                <option value="missed">Missed</option>
              </select>
            ) : (
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(meeting.status)}`}>
                {getStatusLabel(meeting.status)}
              </span>
            )}

            {/* Source indicator */}
            {isStudentLogged && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                Student Logged
              </span>
            )}
            {isAdvisorLogged && (
              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-medium">
                Advisor Logged
              </span>
            )}
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

          {meeting.attendanceNotes && (
            <div className="bg-gray-50 p-2 rounded text-sm mb-2">
              <strong>Notes:</strong> {meeting.attendanceNotes}
            </div>
          )}

          {meeting.advisorFeedback && (
            <div className="bg-blue-50 p-2 rounded text-sm">
              <strong>Feedback:</strong> {meeting.advisorFeedback}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 ml-4">
          {isEditing ? (
            <>
              <button
                onClick={() => onSaveEdit(meeting.id)}
                className="btn btn-xs btn-success flex items-center gap-1"
              >
                <Save className="w-3 h-3" />
                Save
              </button>
              <button
                onClick={onCancelEdit}
                className="btn btn-xs btn-secondary flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => onStartEdit(meeting)}
              className="btn btn-xs btn-secondary flex items-center gap-1"
              title="Edit attendance status"
            >
              <Edit2 className="w-3 h-3" />
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetingHistoryPanel;
