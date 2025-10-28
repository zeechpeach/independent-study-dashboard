import React, { useState } from 'react';
import { Clock, Calendar, AlertCircle, Edit3, CheckCircle, XCircle } from 'lucide-react';

/**
 * Individual meeting item component
 * Displays meeting details with appropriate styling and actions
 */
const MeetingItem = ({ 
  meeting, 
  onPrepare, 
  onJoin,
  onEdit,
  onMarkAttendance,
  showPrepareButton = true,
  formatDate 
}) => {
  const [isMarkingAttendance, setIsMarkingAttendance] = useState(false);
  const isToday = () => {
    const today = new Date();
    const meetingDate = new Date(meeting.scheduledDate);
    return today.toDateString() === meetingDate.toDateString();
  };

  const isOverdue = () => {
    const now = new Date();
    const meetingDate = new Date(meeting.scheduledDate);
    return meetingDate < now && meeting.status === 'scheduled';
  };

  const isPastMeeting = () => {
    const now = new Date();
    const meetingDate = new Date(meeting.scheduledDate);
    return meetingDate < now;
  };

  const canMarkAttendance = () => {
    return isPastMeeting() && 
           (meeting.status === 'scheduled' || meeting.status === 'missed') &&
           !meeting.studentSelfReported;
  };

  const getStatusBadge = () => {
    if (meeting.status === 'completed') {
      return <span className="status status-success">Completed</span>;
    }
    if (meeting.status === 'cancelled') {
      return <span className="status status-error">Cancelled</span>;
    }
    if (meeting.status === 'missed' || meeting.status === 'no-show') {
      return <span className="status status-error">Missed</span>;
    }
    if (isOverdue()) {
      return <span className="status status-error">Missed</span>;
    }
    if (isToday()) {
      return <span className="status status-warning">Today</span>;
    }
    return <span className="status status-info">Scheduled</span>;
  };

  const handleMarkAttendance = async (status) => {
    if (!onMarkAttendance || isMarkingAttendance) return;
    
    setIsMarkingAttendance(true);
    try {
      await onMarkAttendance(meeting.id, status);
    } catch (error) {
      console.error('Error marking attendance:', error);
      // Error handling could be improved with user feedback
    } finally {
      setIsMarkingAttendance(false);
    }
  };

  const getTimeUntilMeeting = () => {
    const now = new Date();
    const meetingDate = new Date(meeting.scheduledDate);
    const diffMs = meetingDate - now;
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));

    if (diffHours < 0) return null;
    if (diffHours < 1) return 'Starting soon';
    if (diffHours < 24) return `In ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    
    const diffDays = Math.ceil(diffHours / 24);
    return `In ${diffDays} day${diffDays > 1 ? 's' : ''}`;
  };

  return (
    <div className={`p-3 rounded-lg border ${
      isToday() ? 'bg-blue-50 border-blue-200' : 
      isOverdue() ? 'bg-red-50 border-red-200' : 
      'bg-gray-50 border-gray-200'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-gray-900">
              {meeting.title || 'Independent Study Meeting'}
            </h4>
            {getStatusBadge()}
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate ? formatDate(meeting.scheduledDate) : new Date(meeting.scheduledDate).toLocaleDateString()}</span>
            </div>
            
            {getTimeUntilMeeting() && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{getTimeUntilMeeting()}</span>
              </div>
            )}
          </div>

          {meeting.description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
              {meeting.description}
            </p>
          )}

          {(isOverdue() || meeting.status === 'missed') && !meeting.studentSelfReported && (
            <div className="flex items-center gap-1 mt-2 text-xs text-red-600">
              <AlertCircle className="w-3 h-3" />
              <span>This meeting was missed - please mark your attendance</span>
            </div>
          )}

          {/* Student attendance self-reporting for past meetings */}
          {canMarkAttendance() && (
            <div className="mt-3 p-2 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-700 mb-2 font-medium">
                Did you attend this meeting?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleMarkAttendance('completed')}
                  disabled={isMarkingAttendance}
                  className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded text-xs font-medium hover:bg-green-200 transition-colors disabled:opacity-50"
                  title="Mark as attended"
                >
                  <CheckCircle className="w-3 h-3" />
                  {isMarkingAttendance ? 'Saving...' : 'Yes, I attended'}
                </button>
                <button
                  onClick={() => handleMarkAttendance('missed')}
                  disabled={isMarkingAttendance}
                  className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded text-xs font-medium hover:bg-red-200 transition-colors disabled:opacity-50"
                  title="Mark as missed"
                >
                  <XCircle className="w-3 h-3" />
                  {isMarkingAttendance ? 'Saving...' : 'No, I missed it'}
                </button>
              </div>
            </div>
          )}

          {meeting.studentSelfReported && isPastMeeting() && (
            <div className="mt-2 text-xs text-gray-600 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              <span>You marked this meeting as {meeting.status}</span>
            </div>
          )}

          {/* Show when advisor has logged this meeting */}
          {meeting.loggedBy === 'advisor' && (
            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-xs text-blue-800 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                <span className="font-medium">Logged by your advisor</span>
              </div>
            </div>
          )}

          {/* Show when meeting was overridden */}
          {meeting.overriddenBy && (
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-xs text-yellow-800 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>Your log for this date was replaced by your advisor's entry</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 ml-3">
          {/* Show edit button for upcoming meetings */}
          {!isPastMeeting() && meeting.status !== 'completed' && meeting.status !== 'cancelled' && onEdit && (
            <button
              onClick={() => onEdit(meeting)}
              className="btn btn-sm btn-secondary"
              title="Edit meeting"
            >
              <Edit3 className="w-3 h-3" />
            </button>
          )}

          {/* Show prepare button for upcoming meetings */}
          {showPrepareButton && !isPastMeeting() && meeting.status !== 'completed' && onPrepare && (
            <button
              onClick={() => onPrepare(meeting)}
              className="btn btn-sm btn-primary"
              title="Prepare for this meeting"
            >
              {isToday() ? 'Prepare' : 'Prepare'}
            </button>
          )}

          {/* Show join button for today's meetings */}
          {isToday() && meeting.meetingLink && onJoin && (
            <button
              onClick={() => onJoin(meeting)}
              className="btn btn-sm btn-success"
              title="Join meeting"
            >
              Join
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetingItem;