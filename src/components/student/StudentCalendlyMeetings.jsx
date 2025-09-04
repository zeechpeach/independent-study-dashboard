import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import { getCalendlyMeetings } from '../../services/firebase';

/**
 * StudentCalendlyMeetings - Displays Calendly meetings for a specific student
 * Shows synchronized meetings that were booked through Calendly
 */
const StudentCalendlyMeetings = ({ userId, maxMeetings = 5 }) => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMeetings = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const meetingsData = await getCalendlyMeetings(userId);
        setMeetings(meetingsData.slice(0, maxMeetings));
      } catch (err) {
        console.error('Error fetching Calendly meetings:', err);
        setError('Failed to load meetings');
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, [userId, maxMeetings]);

  const formatMeetingTime = (timestamp) => {
    if (!timestamp) return 'TBD';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isPast = date < now;
    
    return {
      formatted: date.toLocaleDateString('en-US', {
        weekday: isToday ? undefined : 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      }),
      isToday,
      isPast
    };
  };

  const getMeetingStatusColor = (status, isPast) => {
    if (status === 'cancelled') return 'text-red-600 bg-red-50 border-red-200';
    if (status === 'completed') return 'text-green-600 bg-green-50 border-green-200';
    if (isPast && status === 'scheduled') return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-blue-600 bg-blue-50 border-blue-200';
  };

  const getMeetingStatusIcon = (status, isPast) => {
    if (status === 'cancelled') return <XCircle className="w-4 h-4" />;
    if (status === 'completed') return <CheckCircle className="w-4 h-4" />;
    if (isPast && status === 'scheduled') return <Clock className="w-4 h-4" />;
    return <Calendar className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-md font-semibold mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          Scheduled Meetings
        </h3>
        <div className="flex items-center justify-center py-4">
          <div className="loading-spinner" />
          <span className="ml-2 text-gray-600 text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-md font-semibold mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          Scheduled Meetings
        </h3>
        <div className="text-center py-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-md font-semibold mb-3 flex items-center gap-2">
        <Calendar className="w-4 h-4 text-blue-600" />
        Scheduled Meetings
      </h3>

      {meetings.length > 0 ? (
        <div className="space-y-2">
          {meetings.map((meeting) => {
            const timeInfo = formatMeetingTime(meeting.scheduledDate);
            const statusColorClass = getMeetingStatusColor(meeting.status, timeInfo.isPast);
            
            return (
              <div 
                key={meeting.id} 
                className={`p-3 rounded-lg border ${statusColorClass}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getMeetingStatusIcon(meeting.status, timeInfo.isPast)}
                    <div>
                      <p className="font-medium text-sm">
                        {meeting.eventName || 'Meeting'}
                      </p>
                      <p className="text-xs opacity-75">
                        {timeInfo.isToday ? 'Today' : timeInfo.formatted}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-medium capitalize">
                      {meeting.status === 'scheduled' && timeInfo.isPast ? 'Past Due' : meeting.status}
                    </span>
                  </div>
                </div>
                
                {meeting.status === 'cancelled' && meeting.cancelationReason && (
                  <p className="text-xs mt-2 opacity-75">
                    Reason: {meeting.cancelationReason}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-6">
          <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">No meetings scheduled</p>
          <p className="text-gray-400 text-xs mt-1">
            Use the Calendly widget to book a meeting
          </p>
        </div>
      )}
    </div>
  );
};

export default StudentCalendlyMeetings;