import React, { useState, useEffect } from 'react';
import { Users, Calendar, TrendingUp, AlertTriangle, BookOpen, Target, Clock, Eye, MessageSquare } from 'lucide-react';
import StudentOverview from './StudentOverview';
import ImportantDates from './ImportantDates';
import { GridContainer } from '../shared/DashboardGrid';
import {
  getAllUsers,
  getAllMeetings,
  getAllReflections,
  getAllGoals,
  getAllImportantDates,
  createImportantDate,
  updateImportantDate,
  deleteImportantDate
} from '../../services/firebase';

const AdminDashboard = ({ user, onBack }) => {
  const [users, setUsers] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [reflections, setReflections] = useState([]);
  const [goals, setGoals] = useState([]);
  const [importantDates, setImportantDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('dashboard'); // dashboard, students, dates

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [allUsers, allMeetings, allReflections, allGoals, dates] = await Promise.all([
        getAllUsers(),
        getAllMeetings(),
        getAllReflections(),
        getAllGoals(),
        getAllImportantDates()
      ]);

      setUsers(allUsers);
      setMeetings(allMeetings);
      setReflections(allReflections);
      setGoals(allGoals);
      setImportantDates(dates);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Analytics calculations
  const getStudentStats = () => {
    const students = users.filter(u => !u.isAdmin);
    const totalStudents = students.length;
    const activeStudents = students.filter(student => {
      const studentReflections = reflections.filter(r => r.userId === student.id);
      const studentGoals = goals.filter(g => g.userId === student.id);
      return studentReflections.length > 0 || studentGoals.length > 0;
    }).length;

    return { totalStudents, activeStudents };
  };

  const getMeetingStats = () => {
    const now = new Date();
    const thisWeek = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    
    const thisWeekMeetings = meetings.filter(meeting => {
      const meetingDate = new Date(meeting.scheduledDate || meeting.createdAt);
      return meetingDate >= thisWeek && meetingDate <= now;
    }).length;

    const upcomingMeetings = meetings.filter(meeting => {
      const meetingDate = new Date(meeting.scheduledDate || meeting.createdAt);
      return meetingDate > now;
    }).length;

    return { thisWeekMeetings, upcomingMeetings, totalMeetings: meetings.length };
  };

  const getGoalStats = () => {
    const activeGoals = goals.filter(g => g.status !== 'completed').length;
    const completedGoals = goals.filter(g => g.status === 'completed').length;
    const overdueGoals = goals.filter(g => {
      if (g.status === 'completed') return false;
      const targetDate = g.targetDate ? new Date(g.targetDate) : null;
      return targetDate && targetDate < new Date();
    }).length;

    return { activeGoals, completedGoals, overdueGoals, totalGoals: goals.length };
  };

  const getStudentsNeedingAttention = () => {
    const students = users.filter(u => !u.isAdmin);
    const needsAttention = [];

    students.forEach(student => {
      const studentReflections = reflections.filter(r => r.userId === student.id);
      const studentGoals = goals.filter(g => g.userId === student.id);
      const studentMeetings = meetings.filter(m => m.studentId === student.id);

      const lastReflection = studentReflections.sort((a, b) => {
        const aDate = new Date(a.createdAt?.toDate?.() || a.createdAt);
        const bDate = new Date(b.createdAt?.toDate?.() || b.createdAt);
        return bDate - aDate;
      })[0];

      const daysSinceLastReflection = lastReflection ? 
        Math.floor((new Date() - new Date(lastReflection.createdAt?.toDate?.() || lastReflection.createdAt)) / (1000 * 60 * 60 * 24)) : 
        999;

      const overdueGoals = studentGoals.filter(g => {
        if (g.status === 'completed') return false;
        const targetDate = g.targetDate ? new Date(g.targetDate) : null;
        return targetDate && targetDate < new Date();
      }).length;

      let reasons = [];
      if (daysSinceLastReflection > 14) reasons.push('No recent reflections');
      if (overdueGoals > 0) reasons.push(`${overdueGoals} overdue goals`);
      if (studentGoals.length === 0) reasons.push('No goals set');
      if (studentMeetings.length === 0) reasons.push('No meetings scheduled');

      if (reasons.length > 0) {
        needsAttention.push({
          student,
          reasons,
          priority: reasons.length > 2 ? 'high' : reasons.length > 1 ? 'medium' : 'low',
          lastActivity: lastReflection ? new Date(lastReflection.createdAt?.toDate?.() || lastReflection.createdAt) : null
        });
      }
    });

    return needsAttention.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  const getCommonChallenges = () => {
    const challenges = {};
    
    reflections.forEach(reflection => {
      if (reflection.challenges) {
        // Simple keyword extraction - in a real app you'd use more sophisticated analysis
        const words = reflection.challenges.toLowerCase().split(/\s+/);
        const commonWords = ['time', 'understanding', 'resources', 'motivation', 'focus', 'research', 'writing', 'coding', 'presentation'];
        
        commonWords.forEach(word => {
          if (words.some(w => w.includes(word))) {
            challenges[word] = (challenges[word] || 0) + 1;
          }
        });
      }
    });

    return Object.entries(challenges)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([challenge, count]) => ({ challenge, count }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="loading-spinner"></div>
        <span className="ml-2 text-gray-600">Loading admin dashboard...</span>
      </div>
    );
  }

  // Route to different views
  if (activeView === 'students') {
    return (
      <StudentOverview
        users={users.filter(u => !u.isAdmin)}
        reflections={reflections}
        goals={goals}
        meetings={meetings}
        onBack={() => setActiveView('dashboard')}
      />
    );
  }

  if (activeView === 'dates') {
    return (
      <ImportantDates
        importantDates={importantDates}
        onBack={() => setActiveView('dashboard')}
        onCreateDate={async (dateData) => {
          await createImportantDate(dateData);
          await fetchAllData();
        }}
        onUpdateDate={async (dateId, dateData) => {
          await updateImportantDate(dateId, dateData);
          await fetchAllData();
        }}
        onDeleteDate={async (dateId) => {
          await deleteImportantDate(dateId);
          await fetchAllData();
        }}
      />
    );
  }

  const studentStats = getStudentStats();
  const meetingStats = getMeetingStats();
  const goalStats = getGoalStats();
  const studentsNeedingAttention = getStudentsNeedingAttention();
  const commonChallenges = getCommonChallenges();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-800 text-sm mb-2"
          >
            ← Back to Student View
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Monitor student progress and manage the system</p>
        </div>
      </div>

      {/* Stats Overview */}
      <GridContainer cols={3}>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{studentStats.totalStudents}</p>
              <p className="text-xs text-gray-500">{studentStats.activeStudents} active</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Week's Meetings</p>
              <p className="text-2xl font-bold text-gray-900">{meetingStats.thisWeekMeetings}</p>
              <p className="text-xs text-gray-500">{meetingStats.upcomingMeetings} upcoming</p>
            </div>
            <Calendar className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Goals</p>
              <p className="text-2xl font-bold text-gray-900">{goalStats.activeGoals}</p>
              <p className="text-xs text-gray-500">{goalStats.completedGoals} completed</p>
            </div>
            <Target className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </GridContainer>

      <GridContainer cols={2}>
        {/* Students Needing Attention */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <h2 className="card-title">Students Needing Attention</h2>
            </div>
            <button
              onClick={() => setActiveView('students')}
              className="btn btn-sm btn-secondary"
            >
              <Eye className="w-4 h-4" />
              View All
            </button>
          </div>
          <div className="space-y-3">
            {studentsNeedingAttention.length > 0 ? (
              studentsNeedingAttention.slice(0, 5).map((item, index) => (
                <div key={item.student.id || index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.student.name}</h4>
                      <p className="text-sm text-gray-600">{item.student.email}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.reasons.map((reason, i) => (
                          <span key={i} className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                            {reason}
                          </span>
                        ))}
                      </div>
                      {item.lastActivity && (
                        <p className="text-xs text-gray-500 mt-1">
                          Last activity: {formatDate(item.lastActivity)}
                        </p>
                      )}
                    </div>
                    <span className={`status ${
                      item.priority === 'high' ? 'status-danger' : 
                      item.priority === 'medium' ? 'status-warning' : 'status-info'
                    } text-xs`}>
                      {item.priority}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <p className="text-sm text-gray-600">All students are up to date!</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <h2 className="card-title">Recent Activity</h2>
            </div>
          </div>
          <div className="space-y-3">
            {reflections.slice(0, 5).map((reflection, index) => {
              const student = users.find(u => u.id === reflection.userId);
              return (
                <div key={reflection.id || index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-purple-600" />
                        <span className="font-medium text-sm text-gray-900">
                          {student?.name || 'Unknown Student'}
                        </span>
                        <span className={`status ${reflection.type === 'pre-meeting' ? 'status-info' : 'status-success'} text-xs`}>
                          {reflection.type === 'pre-meeting' ? 'Pre' : 'Post'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {reflection.accomplishments || reflection.keyInsights || 'New reflection submitted'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(reflection.createdAt?.toDate?.() || reflection.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            {reflections.length === 0 && (
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <p className="text-sm text-gray-600">No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Common Challenges */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-red-600" />
              <h2 className="card-title">Common Challenges</h2>
            </div>
          </div>
          <div className="space-y-3">
            {commonChallenges.length > 0 ? (
              commonChallenges.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2">
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {item.challenge}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: `${(item.count / Math.max(...commonChallenges.map(c => c.count))) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-6">{item.count}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <p className="text-sm text-gray-600">No challenges reported yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button
              onClick={() => setActiveView('students')}
              className="w-full btn btn-secondary justify-start"
            >
              <Users className="w-4 h-4" />
              View All Students
            </button>
            <button
              onClick={() => setActiveView('dates')}
              className="w-full btn btn-secondary justify-start"
            >
              <Calendar className="w-4 h-4" />
              Manage Important Dates
            </button>
            <button className="w-full btn btn-secondary justify-start">
              <TrendingUp className="w-4 h-4" />
              Generate Progress Report
            </button>
          </div>
        </div>
      </GridContainer>
    </div>
  );
};

export default AdminDashboard;