import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { getAllCalendlyEvents, getCalendlyMeetings } from '../../services/firebase';

/**
 * CalendlyEventsPanel - Displays Calendly webhook events and meeting synchronization status
 * Used in advisor dashboards to monitor meeting scheduling activity
 */
const CalendlyEventsPanel = ({ userProfile, showAllEvents = false, maxEvents = 10 }) => {
  const [events, setEvents] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCalendlyData = async () => {
      try {
        setLoading(true);
        
        // Fetch Calendly events and meetings
        const [eventsData, meetingsData] = await Promise.all([
          showAllEvents ? getAllCalendlyEvents() : [],
          getCalendlyMeetings()
        ]);

        setEvents(eventsData.slice(0, maxEvents));
        setMeetings(meetingsData.slice(0, maxEvents));
      } catch (err) {
        console.error('Error fetching Calendly data:', err);
        setError('Failed to load Calendly events');
      } finally {
        setLoading(false);
      }
    };

    fetchCalendlyData();
  }, [showAllEvents, maxEvents]);

  const getEventStatusIcon = (eventType) => {
    switch (eventType) {
      case 'invitee.created':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'invitee.canceled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const formatEventTime = (timestamp) => {
    if (!timestamp) return 'Unknown time';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Calendly Activity</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="loading-spinner" />
          <span className="ml-2 text-gray-600">Loading events...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Calendly Activity</h3>
        </div>
        <div className="text-center py-8">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Calendly Activity</h3>
        </div>
        <span className="text-sm text-gray-500">
          {showAllEvents ? 'All Events' : 'Recent Meetings'}
        </span>
      </div>

      {/* Calendly-sourced meetings */}
      {meetings.length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Synchronized Meetings
          </h4>
          <div className="space-y-2">
            {meetings.map((meeting) => (
              <div key={meeting.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {meeting.status === 'scheduled' ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : meeting.status === 'cancelled' ? (
                      <XCircle className="w-4 h-4 text-red-500" />
                    ) : (
                      <Clock className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{meeting.eventName || 'Meeting'}</p>
                    <p className="text-sm text-gray-600">
                      {meeting.studentName || meeting.studentEmail}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {formatEventTime(meeting.scheduledDate)}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{meeting.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Raw webhook events (for admins) */}
      {showAllEvents && events.length > 0 && (
        <div>
          <h4 className="text-md font-medium text-gray-700 mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Webhook Events
          </h4>
          <div className="space-y-2">
            {events.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {getEventStatusIcon(event.eventType)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{event.eventType}</p>
                    <p className="text-sm text-gray-600">
                      {event.payload?.email || 'Unknown user'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {formatEventTime(event.processedAt)}
                  </p>
                  <p className="text-xs text-gray-500">Processed</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {meetings.length === 0 && (!showAllEvents || events.length === 0) && (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No Calendly activity yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Events will appear here when students book or cancel meetings through Calendly
          </p>
        </div>
      )}
    </div>
  );
};

export default CalendlyEventsPanel;