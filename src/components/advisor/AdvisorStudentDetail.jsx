import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Mail, Calendar, Target, MessageSquare } from 'lucide-react';
import { getUserProfile, getUserGoals, getUserReflections, getUserMeetings } from '../../services/firebase';
import { meetingsService } from '../../services/meetingsService';

/**
 * AdvisorStudentDetail - Detailed view of a specific student for advisors
 */
const AdvisorStudentDetail = ({ studentId, studentName, studentEmail, onBack }) => {
  const [student, setStudent] = useState(null);
  const [goals, setGoals] = useState([]);
  const [reflections, setReflections] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [meetingCounts, setMeetingCounts] = useState({ completed: 0, missed: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        let studentGoals = [];
        let studentReflections = [];
        let studentMeetings = [];

        if (studentId) {
          [studentData, studentGoals, studentReflections, studentMeetings] = await Promise.all([
            getUserProfile(studentId),
            getUserGoals(studentId),
            getUserReflections(studentId),
            getUserMeetings(studentId)
          ]);
        }
        
        setStudent(studentData || { name: studentName, email: studentEmail });
        setGoals(studentGoals);
        setReflections(studentReflections);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Goals */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Current Goals ({goals.length})</h2>
        </div>
        {goals.length > 0 ? (
          <div className="space-y-3">
            {goals.slice(0, 5).map((goal) => (
              <div key={goal.id} className="p-3 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{goal.title}</h3>
                    {goal.description && (
                      <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>Due: {goal.targetDate}</span>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(goal.status)}`}>
                    {goal.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
            {goals.length > 5 && (
              <p className="text-sm text-gray-500 text-center">
                And {goals.length - 5} more goals...
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Target className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No goals set yet</p>
          </div>
        )}
      </div>

      {/* Recent Reflections */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Recent Reflections ({reflections.length})</h2>
        </div>
        {reflections.length > 0 ? (
          <div className="space-y-3">
            {reflections.slice(0, 3).map((reflection) => (
              <div key={reflection.id} className="p-3 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-900">{reflection.type}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(reflection.createdAt?.toDate?.() || reflection.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {reflection.content && (
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {reflection.content.substring(0, 150)}...
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {reflections.length > 3 && (
              <p className="text-sm text-gray-500 text-center">
                And {reflections.length - 3} more reflections...
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No reflections submitted yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvisorStudentDetail;