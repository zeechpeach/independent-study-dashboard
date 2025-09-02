import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, Target, Calendar, Clock, Plus, Edit3 } from 'lucide-react';
import ReflectionForm from './ReflectionForm';
import GoalTracker from './GoalTracker';
import { 
  createReflection, 
  updateReflection, 
  getUserReflections,
  getUserGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  getUserMeetings,
  getAllImportantDates,
  getAdvisorByName
} from '../../services/firebase';

const StudentDashboard = ({ user, userProfile }) => {
  const [reflections, setReflections] = useState([]);
  const [goals, setGoals] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [importantDates, setImportantDates] = useState([]);
  const [advisorInfo, setAdvisorInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReflectionForm, setShowReflectionForm] = useState(false);
  const [showGoalTracker, setShowGoalTracker] = useState(false);
  const [reflectionType, setReflectionType] = useState('pre-meeting');
  const [editingReflection, setEditingReflection] = useState(null);

  // Wrap fetchUserData in useCallback to fix dependency warning
  const fetchUserData = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      const [userReflections, userGoals, userMeetings, dates] = await Promise.all([
        getUserReflections(user.uid),
        getUserGoals(user.uid),
        getUserMeetings(user.uid),
        getAllImportantDates()
      ]);

      setReflections(userReflections);
      setGoals(userGoals);
      setMeetings(userMeetings);
      setImportantDates(dates);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Fetch advisor info when user profile is available
  useEffect(() => {
    const fetchAdvisorInfo = async () => {
      if (userProfile?.advisor) {
        try {
          const advisor = await getAdvisorByName(userProfile.advisor);
          setAdvisorInfo(advisor);
        } catch (error) {
          console.error('Error fetching advisor info:', error);
        }
      }
    };

    fetchAdvisorInfo();
  }, [userProfile?.advisor]);

  const handleSaveReflection = async (reflectionData) => {
    try {
      if (editingReflection) {
        await updateReflection(editingReflection.id, reflectionData);
      } else {
        await createReflection(user.uid, reflectionData);
      }
      
      await fetchUserData();
      setShowReflectionForm(false);
      setEditingReflection(null);
    } catch (error) {
      console.error('Error saving reflection:', error);
      throw error;
    }
  };

  const handleCreateGoal = async (goalData) => {
    try {
      await createGoal(user.uid, goalData);
      await fetchUserData();
    } catch (error) {
      console.error('Error creating goal:', error);
      throw error;
    }
  };

  const handleUpdateGoal = async (goalId, goalData) => {
    try {
      await updateGoal(goalId, goalData);
      await fetchUserData();
    } catch (error) {
      console.error('Error updating goal:', error);
      throw error;
    }
  };

  const handleDeleteGoal = async (goalId) => {
    try {
      await deleteGoal(goalId);
      await fetchUserData();
    } catch (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }
  };

  const openReflectionForm = (type, reflection = null) => {
    setReflectionType(type);
    setEditingReflection(reflection);
    setShowReflectionForm(true);
  };

  // Get the appropriate Calendly link
  const getSchedulingLink = () => {
    // Use advisor's Calendly link if available
    if (advisorInfo?.schedulingTool) {
      return advisorInfo.schedulingTool;
    }
    // Fallback to admin Calendly for unassigned students
    return 'https://calendly.com/zacharychien';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getUpcomingDates = () => {
    const today = new Date();
    return importantDates
      .filter(date => new Date(date.date) >= today)
      .slice(0, 3)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const getRecentReflections = () => {
    return reflections.slice(0, 3);
  };

  const getActiveGoals = () => {
    return goals.filter(goal => goal.status !== 'completed').slice(0, 3);
  };

  const getUpcomingMeetings = () => {
    const today = new Date();
    return meetings
      .filter(meeting => new Date(meeting.scheduledDate) >= today)
      .slice(0, 2)
      .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="loading-spinner"></div>
        <span className="ml-2 text-gray-600">Loading your dashboard...</span>
      </div>
    );
  }

  if (showGoalTracker) {
    return (
      <GoalTracker
        user={user}
        goals={goals}
        onCreateGoal={handleCreateGoal}
        onUpdateGoal={handleUpdateGoal}
        onDeleteGoal={handleDeleteGoal}
        onBack={() => setShowGoalTracker(false)}
      />
    );
  }

  if (showReflectionForm) {
    return (
      <ReflectionForm
        type={reflectionType}
        existingReflection={editingReflection}
        onSave={handleSaveReflection}
        onCancel={() => {
          setShowReflectionForm(false);
          setEditingReflection(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.displayName?.split(' ')[0] || 'Student'}!
          </h1>
          <p className="text-gray-600 mt-1">
            Ready to continue your learning journey?
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => openReflectionForm('pre-meeting')}
            className="btn btn-primary"
          >
            <BookOpen className="w-4 h-4" />
            Pre-Meeting Reflection
          </button>
          <button
            onClick={() => openReflectionForm('post-meeting')}
            className="btn btn-secondary"
          >
            <BookOpen className="w-4 h-4" />
            Post-Meeting Summary
          </button>
          <button
            onClick={() => setShowGoalTracker(true)}
            className="btn btn-secondary"
          >
            <Target className="w-4 h-4" />
            Manage Goals
          </button>
          <button 
            onClick={() => window.open(getSchedulingLink(), '_blank')}
            className="btn btn-secondary"
          >
            <Calendar className="w-4 h-4" />
            Schedule Meeting
          </button>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-2">
        {/* Current Goals */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              <h2 className="card-title">Current Goals</h2>
            </div>
            <button 
              onClick={() => setShowGoalTracker(true)}
              className="btn btn-sm btn-secondary"
            >
              <Plus className="w-4 h-4" />
              Add Goal
            </button>
          </div>
          <div className="space-y-3">
            {getActiveGoals().length > 0 ? (
              getActiveGoals().map((goal, index) => (
                <div key={goal.id || index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{goal.title || 'Untitled Goal'}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {goal.description || 'No description'}
                      </p>
                      {goal.targetDate && (
                        <p className="text-xs text-gray-500 mt-2">
                          Due: {formatDate(goal.targetDate)}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`status ${goal.status === 'on-track' ? 'status-success' : 'status-warning'}`}>
                        {goal.status || 'active'}
                      </span>
                    </div>
                  </div>
                  {goal.progress && (
                    <div className="progress mt-2">
                      <div 
                        className="progress-bar" 
                        style={{ width: `${goal.progress || 0}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <p className="text-sm text-gray-600">No active goals set yet</p>
                <button
                  onClick={() => setShowGoalTracker(true)}
                  className="btn btn-primary btn-sm mt-2"
                >
                  Set Your First Goal
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Meetings */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-600" />
              <h2 className="card-title">Upcoming Meetings</h2>
            </div>
            <button 
              onClick={() => window.open(getSchedulingLink(), '_blank')}
              className="btn btn-sm btn-secondary"
            >
              <Plus className="w-4 h-4" />
              Book Meeting
            </button>
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
                    </div>
                    <button
                      onClick={() => openReflectionForm('pre-meeting', null, meeting.id)}
                      className="btn btn-sm btn-primary"
                    >
                      Prepare
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <p className="text-sm text-gray-600">No meetings scheduled</p>
                <button 
                  onClick={() => window.open(getSchedulingLink(), '_blank')}
                  className="btn btn-primary btn-sm mt-2"
                >
                  Book a Meeting
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Reflections */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-600" />
              <h2 className="card-title">Recent Reflections</h2>
            </div>
          </div>
          <div className="space-y-3">
            {getRecentReflections().length > 0 ? (
              getRecentReflections().map((reflection, index) => (
                <div key={reflection.id || index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`status ${reflection.type === 'pre-meeting' ? 'status-info' : 'status-success'}`}>
                          {reflection.type === 'pre-meeting' ? 'Pre-Meeting' : 'Post-Meeting'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(reflection.createdAt?.toDate?.() || reflection.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {reflection.accomplishments || reflection.keyInsights || 'No content'}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openReflectionForm(reflection.type, reflection)}
                        className="text-gray-500 hover:text-gray-700 p-1"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <p className="text-sm text-gray-600">No reflections yet</p>
                <button
                  onClick={() => openReflectionForm('pre-meeting')}
                  className="btn btn-primary btn-sm mt-2"
                >
                  Write Your First Reflection
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Important Dates */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <h2 className="card-title">Important Dates</h2>
            </div>
          </div>
          <div className="space-y-3">
            {getUpcomingDates().length > 0 ? (
              getUpcomingDates().map((date, index) => (
                <div key={date.id || index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{date.title}</h4>
                      <p className="text-sm text-gray-600">{formatDate(date.date)}</p>
                      {date.description && (
                        <p className="text-xs text-gray-500 mt-1">{date.description}</p>
                      )}
                    </div>
                    <span className={`status ${date.type === 'deadline' ? 'status-warning' : 'status-info'}`}>
                      {date.type || 'event'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 text-center">No upcoming important dates</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="text-sm text-gray-500 text-center">
        Having issues? Contact your coordinator at {process.env.REACT_APP_ADMIN_EMAIL}
      </div>
    </div>
  );
};

export default StudentDashboard;