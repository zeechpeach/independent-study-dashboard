import React, { useState } from 'react';
import { Calendar, Plus, Clock, AlertCircle, Loader2 } from 'lucide-react';
import MeetingItem from './MeetingItem';

/**
 * Meetings card component for the student dashboard
 * Displays upcoming and past meetings with actions
 */
const MeetingsCard = ({ 
  upcomingMeetings = [],
  pastMeetings = [],
  loading = false,
  error = null,
  onBookMeeting,
  onPrepareForMeeting,
  onJoinMeeting,
  formatDate,
  className = ''
}) => {
  const [showPastMeetings, setShowPastMeetings] = useState(false);

  // Show loading state
  if (loading) {
    return (
      <div className={`card ${className}`}>
        <div className="card-header">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-600" />
            <h2 className="card-title">Meetings</h2>
          </div>
          <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Loading meetings...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className={`card ${className}`}>
        <div className="card-header">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-600" />
            <h2 className="card-title">Meetings</h2>
          </div>
          <button 
            onClick={onBookMeeting}
            className="btn btn-sm btn-secondary"
          >
            <Plus className="w-4 h-4" />
            Book
          </button>
        </div>
        <div className="p-4 bg-red-50 rounded-lg text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-sm text-red-600 mb-2">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="btn btn-sm btn-secondary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`card ${className}`}>
      <div className="card-header">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-green-600" />
          <h2 className="card-title">Meetings</h2>
          {upcomingMeetings.length > 0 && (
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
              {upcomingMeetings.length}
            </span>
          )}
        </div>
        <button 
          onClick={onBookMeeting}
          className="btn btn-sm btn-secondary"
          title="Schedule a new meeting"
        >
          <Plus className="w-4 h-4" />
          Book
        </button>
      </div>

      <div className="space-y-3">
        {/* Upcoming Meetings */}
        {upcomingMeetings.length > 0 ? (
          <>
            <div className="space-y-2">
              {upcomingMeetings.slice(0, 3).map((meeting, index) => (
                <MeetingItem
                  key={meeting.id || index}
                  meeting={meeting}
                  onPrepare={onPrepareForMeeting}
                  onJoin={onJoinMeeting}
                  formatDate={formatDate}
                  showPrepareButton={true}
                />
              ))}
            </div>
            
            {upcomingMeetings.length > 3 && (
              <div className="text-center pt-2">
                <p className="text-xs text-gray-500">
                  + {upcomingMeetings.length - 3} more upcoming meetings
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">No meetings scheduled</p>
            <button 
              onClick={onBookMeeting}
              className="btn btn-primary btn-sm"
            >
              Book a Meeting
            </button>
          </div>
        )}

        {/* Past Meetings Toggle */}
        {pastMeetings.length > 0 && (
          <div className="pt-3 border-t border-gray-100">
            <button
              onClick={() => setShowPastMeetings(!showPastMeetings)}
              className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-2 w-full"
            >
              <Clock className="w-4 h-4" />
              <span>
                {showPastMeetings ? 'Hide' : 'Show'} Past Meetings ({pastMeetings.length})
              </span>
            </button>

            {showPastMeetings && (
              <div className="mt-3 space-y-2">
                {pastMeetings.slice(0, 3).map((meeting, index) => (
                  <MeetingItem
                    key={meeting.id || index}
                    meeting={meeting}
                    formatDate={formatDate}
                    showPrepareButton={false}
                  />
                ))}
                {pastMeetings.length > 3 && (
                  <div className="text-center pt-1">
                    <p className="text-xs text-gray-500">
                      + {pastMeetings.length - 3} more past meetings
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingsCard;