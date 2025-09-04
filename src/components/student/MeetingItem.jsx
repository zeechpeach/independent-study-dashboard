import React from 'react';
import { Clock, Calendar, AlertCircle, Edit3 } from 'lucide-react';

/**
 * Individual meeting item component
 * Displays meeting details with appropriate styling and actions
 */
const MeetingItem = ({ 
  meeting, 
  onPrepare, 
  onJoin,
  onEdit,
  showPrepareButton = true,
  formatDate 
}) => {
  const isToday = () => {
    const today = new Date();
    const meetingDate = new Date(meeting.scheduledDate);
    return today.toDateString() === meetingDate.toDateString();
  };

  const isOverdue = () => {
    const now = new Date();
    const meetingDate = new Date(meeting.scheduledDate);
    return meetingDate < now && meeting.status !== 'completed' && meeting.status !== 'cancelled';
  };

  const getStatusBadge = () => {
    if (meeting.status === 'completed') {
      return <span className="status status-success">Completed</span>;
    }
    if (meeting.status === 'cancelled') {
      return <span className="status status-error">Cancelled</span>;
    }
    if (isOverdue()) {
      return <span className="status status-error">Missed</span>;
    }
    if (isToday()) {
      return <span className="status status-warning">Today</span>;
    }
    return <span className="status status-info">Scheduled</span>;
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

          {isOverdue() && (
            <div className="flex items-center gap-1 mt-2 text-xs text-red-600">
              <AlertCircle className="w-3 h-3" />
              <span>This meeting was missed</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 ml-3">
          {/* Show edit button for upcoming meetings */}
          {!isOverdue() && meeting.status !== 'completed' && meeting.status !== 'cancelled' && onEdit && (
            <button
              onClick={() => onEdit(meeting)}
              className="btn btn-sm btn-secondary"
              title="Edit meeting"
            >
              <Edit3 className="w-3 h-3" />
            </button>
          )}

          {/* Show prepare button for upcoming meetings */}
          {showPrepareButton && !isOverdue() && meeting.status !== 'completed' && onPrepare && (
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