import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, BookOpen, Target, Calendar, Clock, MessageSquare, AlertCircle, TrendingUp, Mail } from 'lucide-react';
import { getUserGoals, getUserReflections, getUserMeetings } from '../../services/firebase';

const StudentProfile = ({ student, onBack }) => {
  const [goals, setGoals] = useState([]);
  const [reflections, setReflections] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!student?.id) return;
      
      try {
        setLoading(true);
        const [studentGoals, studentReflections, studentMeetings] = await Promise.all([
          getUserGoals(student.id),
          getUserReflections(student.id),
          getUserMeetings(student.id)
        ]);

        setGoals(studentGoals);
        setReflections(studentReflections);
        setMeetings(studentMeetings);
      } catch (error) {
        console.error('Error fetching student data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [student?.id]);

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const date = dateString?.toDate ? dateString.toDate() : new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getActiveGoals = () => {
    return goals.filter(goal => goal.status !== 'completed');
  };

  const getUpcomingMeetings = () => {
    const today = new Date();
    return meetings
      .filter(meeting => new Date(meeting.scheduledDate) >= today)
      .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
  };

  const getCompletedMeetings = () => {
    return meetings.filter(meeting => meeting.status === 'completed');
  };

  const getMissedMeetings = () => {
    return meetings.filter(meeting => 
      meeting.status === 'missed' || meeting.status === 'no-show'
    );
  };

  const getPastMeetings = () => {
    const today = new Date();
    return meetings.filter(meeting => new Date(meeting.scheduledDate) < today);
  };

  const getMeetingAttendanceRate = () => {
    const completed = getCompletedMeetings().length;
    const missed = getMissedMeetings().length;
    const total = completed + missed;
    
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  const getRecentReflections = () => {
    return reflections.slice(0, 5);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="loading-spinner"></div>
        <span className="ml-2 text-gray-600">Loading student profile...</span>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Student not found</p>
        <button onClick={onBack} className="btn btn-secondary mt-4">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="btn btn-secondary btn-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Student Profile</h1>
      </div>

      {/* Student Info Card */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="card-title">{student.name || 'Unknown Student'}</h2>
              <p className="text-gray-600 text-sm">{student.email}</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Pathway</label>
              <p className="text-gray-900 mt-1">{student.pathway || 'Not specified'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Advisor</label>
              <p className="text-gray-900 mt-1">{student.advisor || 'Not assigned'}</p>
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-700">Project Description</label>
              <p className="text-gray-900 mt-1">
                {student.projectDescription || 'No project description provided'}
              </p>
            </div>
          </div>
          
          <div className="pt-2 border-t border-gray-200">
            <a
              href={`mailto:${encodeURIComponent(student.email)}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              title={`Send email to ${student.email}`}
            >
              <Mail className="w-4 h-4" />
              Email Student
            </a>
            <p className="text-xs text-gray-500 mt-1">
              Opens your email client to send a message to the student's account email
            </p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-5 gap-4">
        <div className="card p-4 text-center">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Target className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{getActiveGoals().length}</div>
          <div className="text-sm text-gray-600">Active Goals</div>
        </div>
        
        <div className="card p-4 text-center">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{getUpcomingMeetings().length}</div>
          <div className="text-sm text-gray-600">Upcoming Meetings</div>
        </div>
        
        <div className="card p-4 text-center">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <MessageSquare className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{getCompletedMeetings().length}</div>
          <div className="text-sm text-gray-600">Completed Meetings</div>
        </div>
        
        <div className="card p-4 text-center">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{getMissedMeetings().length}</div>
          <div className="text-sm text-gray-600">Missed Meetings</div>
        </div>
        
        <div className="card p-4 text-center">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{getMeetingAttendanceRate()}%</div>
          <div className="text-sm text-gray-600">Attendance Rate</div>
        </div>
        
        <div className="card p-4 text-center">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <BookOpen className="w-5 h-5 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{reflections.length}</div>
          <div className="text-sm text-gray-600">Total Reflections</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-2 gap-6">
        {/* Current Goals */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-600" />
              <h3 className="card-title">Current Goals</h3>
            </div>
          </div>
          <div className="space-y-3">
            {getActiveGoals().length > 0 ? (
              getActiveGoals().map((goal, index) => (
                <div key={goal.id || index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{goal.title || 'Untitled Goal'}</h4>
                    <span className={`status ${goal.status === 'on-track' ? 'status-success' : 'status-warning'}`}>
                      {goal.status || 'active'}
                    </span>
                  </div>
                  {goal.description && (
                    <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
                  )}
                  {goal.progress && (
                    <div className="progress mb-2">
                      <div 
                        className="progress-bar" 
                        style={{ width: `${goal.progress || 0}%` }}
                      ></div>
                    </div>
                  )}
                  {goal.targetDate && (
                    <p className="text-xs text-gray-500">
                      Due: {formatDate(goal.targetDate)}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <p className="text-sm text-gray-600">No active goals</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Meetings */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h3 className="card-title">Upcoming Meetings</h3>
            </div>
          </div>
          <div className="space-y-3">
            {getUpcomingMeetings().length > 0 ? (
              getUpcomingMeetings().map((meeting, index) => (
                <div key={meeting.id || index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {meeting.title || 'Independent Study Meeting'}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {formatDate(meeting.scheduledDate)}
                      </p>
                      {meeting.notes && (
                        <p className="text-xs text-gray-500 mt-1">{meeting.notes}</p>
                      )}
                    </div>
                    <span className="status status-info">Scheduled</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <p className="text-sm text-gray-600">No upcoming meetings</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Reflections */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-600" />
              <h3 className="card-title">Recent Reflections</h3>
            </div>
          </div>
          <div className="space-y-3">
            {getRecentReflections().length > 0 ? (
              getRecentReflections().map((reflection, index) => (
                <div key={reflection.id || index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <span className={`status ${reflection.type === 'pre-meeting' ? 'status-info' : 'status-success'}`}>
                      {reflection.type === 'pre-meeting' ? 'Pre-Meeting' : 'Post-Meeting'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(reflection.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {reflection.accomplishments || reflection.keyInsights || 'No content'}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <p className="text-sm text-gray-600">No reflections yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Meeting History */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-600" />
              <h3 className="card-title">Meeting History</h3>
            </div>
          </div>
          <div className="space-y-3">
            {getCompletedMeetings().length > 0 ? (
              getCompletedMeetings().slice(0, 5).map((meeting, index) => (
                <div key={meeting.id || index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {meeting.title || 'Meeting'}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {formatDate(meeting.scheduledDate)}
                      </p>
                    </div>
                    <span className="status status-success">Completed</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <p className="text-sm text-gray-600">No completed meetings</p>
              </div>
            )}
            {getCompletedMeetings().length > 5 && (
              <p className="text-xs text-gray-500 text-center">
                And {getCompletedMeetings().length - 5} more meetings...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;