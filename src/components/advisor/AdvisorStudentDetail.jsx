import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Mail, Target, CheckSquare, FileText, ChevronDown, ChevronUp, Plus, Calendar, Clock, Edit2, Save, X } from 'lucide-react';
import { getUserProfile, getUserActionItems, getUserNotes, getUserMeetings } from '../../services/firebase';
import { meetingsService } from '../../services/meetingsService';
import AdvisorMeetingLogModal from './AdvisorMeetingLogModal';

/**
 * AdvisorStudentDetail - Detailed view of a specific student for advisors
 */
const AdvisorStudentDetail = ({ studentId, studentName, studentEmail, onBack, userProfile }) => {
  const [student, setStudent] = useState(null);
  const [actionItems, setActionItems] = useState([]);
  const [notes, setNotes] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [meetingCounts, setMeetingCounts] = useState({ completed: 0, missed: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionItemsExpanded, setActionItemsExpanded] = useState(false);
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [meetingsExpanded, setMeetingsExpanded] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [editingMeetingId, setEditingMeetingId] = useState(null);
  const [editingStatus, setEditingStatus] = useState(null);

  useEffect(() => {
    const fetchStudentDetails = async () => {
      if (!studentId && !studentEmail) {
        setError('No student identifier provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // If we have studentId, use it directly, otherwise we'd need to find by email
        let studentData = null;
        let studentActionItems = [];
        let studentNotes = [];
        let studentMeetings = [];

        if (studentId) {
          [studentData, studentActionItems, studentNotes, studentMeetings] = await Promise.all([
            getUserProfile(studentId),
            getUserActionItems(studentId),
            getUserNotes(studentId),
            getUserMeetings(studentId)
          ]);
        }
        
        setStudent(studentData || { name: studentName, email: studentEmail });
        setActionItems(studentActionItems);
        setNotes(studentNotes);
        setMeetings(studentMeetings);
        
        // Calculate meeting attendance counts
        const counts = meetingsService.getMeetingAttendanceCounts(studentMeetings);
        setMeetingCounts(counts);
      } catch (err) {
        console.error('Error fetching student details:', err);
        setError('Failed to load student details');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentDetails();
  }, [studentId, studentEmail, studentName]);

  const handleLogMeeting = async (meetingStudentId, meetingDate, attended = true) => {
    try {
      // Use the provided studentId (from modal) which matches this component's studentId
      await meetingsService.createAdvisorMeetingLog(
        meetingStudentId,
        meetingDate,
        userProfile?.id,
        userProfile?.name || userProfile?.email,
        attended
      );
      
      // Refresh student details to update meeting counts and list
      const studentMeetings = await getUserMeetings(meetingStudentId);
      const counts = meetingsService.getMeetingAttendanceCounts(studentMeetings);
      setMeetingCounts(counts);
      setMeetings(studentMeetings);
    } catch (error) {
      console.error('Error logging meeting:', error);
      throw error;
    }
  };

  const handleStartEdit = (meeting) => {
    setEditingMeetingId(meeting.id);
    setEditingStatus(meeting.status);
  };

  const handleCancelEdit = () => {
    setEditingMeetingId(null);
    setEditingStatus(null);
  };

  const handleSaveEdit = async (meetingId) => {
    try {
      // Map status to studentAttended boolean
      const studentAttended = editingStatus === 'attended';
      
      await meetingsService.markAttendance(meetingId, {
        studentAttended: studentAttended,
        advisorAttended: true,
        notes: `Attendance updated by ${userProfile?.name || userProfile?.email}`
      });
      
      // Refresh student details to update meeting counts and list
      const studentMeetings = await getUserMeetings(studentId);
      const counts = meetingsService.getMeetingAttendanceCounts(studentMeetings);
      setMeetingCounts(counts);
      setMeetings(studentMeetings);
      handleCancelEdit();
    } catch (error) {
      console.error('Error updating attendance:', error);
      alert('Failed to update attendance. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Student Details</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="loading-spinner w-8 h-8" />
          <span className="ml-3 text-gray-600">Loading student details...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Student Details</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString();
  };

  // Filter out overridden meetings to avoid duplication
  const activeMeetings = meetings.filter(m => !m.overriddenBy);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{student?.name || studentName}</h1>
            <p className="text-gray-600">Student Progress Overview</p>
          </div>
        </div>
        <button
          onClick={() => setShowLogModal(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Log Meeting
        </button>
      </div>

      {/* Student Info */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Student Information</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-gray-500" />
            <span className="font-medium">{student?.name || studentName}</span>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-gray-500" />
            <span className="text-gray-700">{student?.email || studentEmail}</span>
          </div>
          <div className="pt-2">
            <a
              href={`mailto:${encodeURIComponent(student?.email || studentEmail)}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              title={`Send email to ${student?.email || studentEmail}`}
            >
              <Mail className="w-4 h-4" />
              Email Student
            </a>
            <p className="text-xs text-gray-500 mt-1">
              Opens your email client to send a message to the student's account email
            </p>
          </div>
          {student?.pathway && (
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-gray-500" />
              <span className="text-gray-700">Pathway: {student.pathway}</span>
            </div>
          )}
          <div className="pt-3 border-t border-gray-200">
            <div className="text-sm font-medium text-gray-700 mb-2">Meeting Attendance</div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{meetingCounts.total}</div>
                <div className="text-xs text-gray-500">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{meetingCounts.completed}</div>
                <div className="text-xs text-gray-500">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{meetingCounts.missed}</div>
                <div className="text-xs text-gray-500">Missed</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Items */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h2 className="card-title">Action Items ({actionItems.length})</h2>
            {actionItems.length > 5 && (
              <button
                onClick={() => setActionItemsExpanded(!actionItemsExpanded)}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
              >
                {actionItemsExpanded ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Show All
                  </>
                )}
              </button>
            )}
          </div>
        </div>
        {actionItems.length > 0 ? (
          <div className="space-y-3">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{actionItems.filter(item => !item.completed).length}</p>
                <p className="text-xs text-gray-600">Active</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{actionItems.filter(item => item.completed).length}</p>
                <p className="text-xs text-gray-600">Completed</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">{actionItems.filter(item => item.struggling && !item.completed).length}</p>
                <p className="text-xs text-gray-600">Need Help</p>
              </div>
            </div>
            {/* Action items list */}
            {(actionItemsExpanded ? actionItems : actionItems.slice(0, 5)).map((item) => (
              <div key={item.id} className={`p-3 rounded-lg border ${
                item.struggling && !item.completed ? 'border-orange-300 bg-orange-50' : 
                item.completed ? 'border-green-300 bg-green-50' : 
                'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className={`text-sm ${item.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                      {item.text}
                    </p>
                    {item.struggling && !item.completed && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-orange-600 text-white text-xs rounded">
                        Need Help
                      </span>
                    )}
                    {item.completed && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-green-600 text-white text-xs rounded">
                        Completed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <CheckSquare className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No action items yet</p>
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h2 className="card-title">Notes ({notes.length})</h2>
            {notes.length > 5 && (
              <button
                onClick={() => setNotesExpanded(!notesExpanded)}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
              >
                {notesExpanded ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Show All
                  </>
                )}
              </button>
            )}
          </div>
        </div>
        {notes.length > 0 ? (
          <div className="space-y-3">
            {(notesExpanded ? notes : notes.slice(0, 5)).map((note) => (
              <NoteItem key={note.id} note={note} formatTimeAgo={formatTimeAgo} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No notes yet</p>
          </div>
        )}
      </div>

      {/* Meeting History */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h2 className="card-title flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-500" />
              Meeting History ({activeMeetings.length})
            </h2>
            {activeMeetings.length > 5 && (
              <button
                onClick={() => setMeetingsExpanded(!meetingsExpanded)}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
              >
                {meetingsExpanded ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Show All
                  </>
                )}
              </button>
            )}
          </div>
        </div>
        {activeMeetings.length > 0 ? (
          <div className="space-y-3">
            {(meetingsExpanded ? activeMeetings : activeMeetings.slice(0, 5))
              .sort((a, b) => new Date(b.scheduledDate) - new Date(a.scheduledDate))
              .map((meeting) => (
              <MeetingHistoryItem 
                key={meeting.id} 
                meeting={meeting}
                isEditing={editingMeetingId === meeting.id}
                editingStatus={editingStatus}
                onStartEdit={handleStartEdit}
                onCancelEdit={handleCancelEdit}
                onSaveEdit={handleSaveEdit}
                onStatusChange={setEditingStatus}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No meeting history yet</p>
          </div>
        )}
      </div>

      {/* Meeting Log Modal */}
      {studentId && (
        <AdvisorMeetingLogModal
          isOpen={showLogModal}
          onClose={() => setShowLogModal(false)}
          onSave={handleLogMeeting}
          students={[{ 
            id: studentId, 
            name: student?.name || studentName, 
            email: student?.email || studentEmail 
          }]}
          selectedStudentId={studentId}
          userProfile={userProfile}
        />
      )}
    </div>
  );
};

// Utility function to determine meeting source
const getMeetingSource = (meeting) => {
  return {
    isStudentLogged: meeting.source === 'manual' || meeting.studentSelfReported,
    isAdvisorLogged: meeting.source === 'advisor-manual'
  };
};

// Individual meeting history item component
const MeetingHistoryItem = ({ 
  meeting, 
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
      case 'pending-review':
        return 'bg-yellow-100 text-yellow-800';
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
      case 'pending-review':
        return 'Pending Review';
      default:
        return status;
    }
  };

  const { isStudentLogged, isAdvisorLogged } = getMeetingSource(meeting);

  return (
    <div className="p-3 border rounded-lg bg-gray-50">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-purple-500" />
            <span className="font-medium text-gray-900">
              {meetingsService.formatMeetingDate(meeting.scheduledDate)}
            </span>
            
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

          {meeting.title && meeting.title !== 'Meeting Log' && (
            <p className="text-sm text-gray-900 mb-1">{meeting.title}</p>
          )}

          {meeting.description && (
            <p className="text-sm text-gray-600 mb-1">{meeting.description}</p>
          )}

          {meeting.attendanceNotes && (
            <div className="bg-white p-2 rounded text-xs mt-1">
              <strong>Notes:</strong> {meeting.attendanceNotes}
            </div>
          )}

          {meeting.advisorFeedback && (
            <div className="bg-blue-50 p-2 rounded text-xs mt-1">
              <strong>Feedback:</strong> {meeting.advisorFeedback}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1 ml-2">
          {isEditing ? (
            <>
              <button
                onClick={() => onSaveEdit(meeting.id)}
                className="p-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                title="Save"
              >
                <Save className="w-3 h-3" />
              </button>
              <button
                onClick={onCancelEdit}
                className="p-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                title="Cancel"
              >
                <X className="w-3 h-3" />
              </button>
            </>
          ) : (
            <button
              onClick={() => onStartEdit(meeting)}
              className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              title="Edit attendance status"
            >
              <Edit2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Individual note component with expand/collapse
const NoteItem = ({ note, formatTimeAgo }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentPreview = note.content && note.content.length > 150 
    ? note.content.substring(0, 150) + '...' 
    : note.content;
  const needsExpansion = note.content && note.content.length > 150;

  return (
    <div className="p-3 border rounded-lg bg-gray-50">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-purple-500" />
            <span className="font-medium text-gray-900">{note.title || 'Untitled Note'}</span>
          </div>
          {note.content && (
            <div 
              className="text-sm text-gray-700 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: isExpanded ? note.content : contentPreview
              }}
            />
          )}
          {needsExpansion && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-blue-600 hover:text-blue-800 mt-2"
            >
              {isExpanded ? 'Show Less' : 'Show More'}
            </button>
          )}
          <p className="text-xs text-gray-500 mt-2">
            Updated {formatTimeAgo(note.updatedAt)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdvisorStudentDetail;