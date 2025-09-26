import React, { useState } from 'react';
import MeetingItem from '../student/MeetingItem';
import { Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';

/**
 * Demo component showcasing the new meeting attendance tracking features
 * This demonstrates how meetings automatically get marked as missed and how students can self-report
 */
const MeetingAttendanceDemo = () => {
  const [meetings, setMeetings] = useState([
    {
      id: '1',
      title: 'Weekly Check-in',
      scheduledDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      status: 'scheduled',
      description: 'Regular progress meeting'
    },
    {
      id: '2', 
      title: 'Project Review',
      scheduledDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      status: 'completed',
      studentSelfReported: true,
      description: 'Monthly project review'
    },
    {
      id: '3',
      title: 'Goal Planning',
      scheduledDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      status: 'missed',
      studentSelfReported: true,
      description: 'Setting up quarterly goals'
    },
    {
      id: '4',
      title: 'Upcoming Meeting',
      scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
      status: 'scheduled',
      description: 'Future meeting'
    }
  ]);

  const handleMarkAttendance = async (meetingId, attendanceStatus) => {
    console.log(`Marking meeting ${meetingId} as ${attendanceStatus}`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setMeetings(prev => prev.map(meeting => 
      meeting.id === meetingId 
        ? { 
            ...meeting, 
            status: attendanceStatus,
            studentSelfReported: true,
            studentAttendanceMarkedAt: new Date().toISOString()
          }
        : meeting
    ));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  // Calculate attendance statistics
  const attendanceStats = {
    total: meetings.filter(m => new Date(m.scheduledDate) < new Date()).length,
    completed: meetings.filter(m => m.status === 'completed').length,
    missed: meetings.filter(m => m.status === 'missed').length,
  };

  const attendanceRate = attendanceStats.total > 0 
    ? Math.round((attendanceStats.completed / attendanceStats.total) * 100)
    : 0;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Meeting Attendance System Demo
        </h1>
        <p className="text-gray-600">
          Demonstrates automatic missed meeting marking and student self-reporting
        </p>
      </div>

      {/* Attendance Statistics */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h2 className="card-title">Meeting Attendance Summary</h2>
          </div>
        </div>
        <div className="grid grid-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{attendanceStats.total}</div>
            <div className="text-sm text-gray-600">Total Past Meetings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{attendanceStats.completed}</div>
            <div className="text-sm text-gray-600">Attended</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{attendanceStats.missed}</div>
            <div className="text-sm text-gray-600">Missed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{attendanceRate}%</div>
            <div className="text-sm text-gray-600">Attendance Rate</div>
          </div>
        </div>
      </div>

      {/* Meeting List */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-green-600" />
            <h2 className="card-title">Meeting List</h2>
          </div>
        </div>
        <div className="space-y-3">
          {meetings.map((meeting, index) => (
            <MeetingItem
              key={meeting.id}
              meeting={meeting}
              onMarkAttendance={handleMarkAttendance}
              formatDate={formatDate}
              showPrepareButton={false}
            />
          ))}
        </div>
      </div>

      {/* Feature Explanation */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">How It Works</h2>
        </div>
        <div className="space-y-4 text-sm text-gray-700">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <strong>Automatic Missed Marking:</strong> Meetings automatically get marked as "missed" 
              once their scheduled time passes, if they haven't been marked as completed or cancelled.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <strong>Student Self-Reporting:</strong> Students can mark past meetings as "attended" or 
              "missed" using the checkboxes that appear for overdue meetings.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <strong>Running Statistics:</strong> The system maintains counts of attended vs missed 
              meetings and calculates attendance rates for both students and advisors to view.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <strong>Admin Visibility:</strong> Advisors can see detailed attendance statistics 
              for each student in the admin dashboard.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingAttendanceDemo;