import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, Target, Calendar, Clock, Plus } from 'lucide-react';
import ReflectionForm from './ReflectionForm';
import GoalTracker from './GoalTracker';
import CalendlyEmbed from '../shared/CalendlyEmbed.jsx';
import GoalPreviewCard from './GoalPreviewCard';
import ReflectionCard from './ReflectionCard';
import ReflectionModal from './ReflectionModal';
import QuickActionCard from './QuickActionCard';
import GoalModal from './GoalModal';
import SegmentedControl from '../ui/SegmentedControl';
import { SkeletonCard, SkeletonQuickAction } from '../ui/Skeleton';
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
  const [showReflectionModal, setShowReflectionModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [selectedReflection, setSelectedReflection] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [reflectionType, setReflectionType] = useState('pre-meeting');
  const [editingReflection, setEditingReflection] = useState(null);
  const [showCalendlyEmbed, setShowCalendlyEmbed] = useState(false);
  const [goalFilter, setGoalFilter] = useState('all');

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
      closeGoalModal();
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

  const openReflectionModal = (reflection) => {
    setSelectedReflection(reflection);
    setShowReflectionModal(true);
  };

  const closeReflectionModal = () => {
    setSelectedReflection(null);
    setShowReflectionModal(false);
  };

  const openGoalModal = (goal) => {
    setSelectedGoal(goal);
    setShowGoalModal(true);
  };

  const closeGoalModal = () => {
    setSelectedGoal(null);
    setShowGoalModal(false);
  };

  const handleEditReflection = (reflection) => {
    openReflectionForm(reflection.type, reflection);
  };

  const handleEditGoal = (goal) => {
    // Close goal modal and open goal tracker in edit mode
    closeGoalModal();
    setShowGoalTracker(true);
    // We'll need to pass the goal to edit to GoalTracker
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

  const getGoalCounts = () => {
    const active = goals.filter(goal => goal.status === 'active').length;
    const completed = goals.filter(goal => goal.status === 'completed').length;
    const notStarted = goals.filter(goal => goal.status === 'not_started').length;
    const overdue = goals.filter(goal => {
      const isOverdue = goal.targetDate && new Date(goal.targetDate) < new Date() && goal.status !== 'completed';
      return isOverdue;
    }).length;

    return {
      all: goals.length,
      active,
      completed,
      not_started: notStarted,
      overdue
    };
  };

  const getFilteredGoals = () => {
    const counts = getGoalCounts();
    
    switch (goalFilter) {
      case 'active':
        return goals.filter(goal => goal.status === 'active');
      case 'completed':
        return goals.filter(goal => goal.status === 'completed');
      case 'not_started':
        return goals.filter(goal => goal.status === 'not_started');
      case 'overdue':
        return goals.filter(goal => {
          const isOverdue = goal.targetDate && new Date(goal.targetDate) < new Date() && goal.status !== 'completed';
          return isOverdue;
        });
      default:
        return goals;
    }
  };

  const getRelevantGoals = () => {
    const filteredGoals = getFilteredGoals();
    
    // If showing all goals, prioritize Active, then Not Started, then Overdue goals (if not already Active)
    if (goalFilter === 'all') {
      const activeGoals = goals.filter(goal => goal.status === 'active');
      const notStartedGoals = goals.filter(goal => goal.status === 'not_started');
      const overdueGoals = goals.filter(goal => {
        const isOverdue = goal.targetDate && new Date(goal.targetDate) < new Date() && goal.status !== 'completed';
        return isOverdue && goal.status !== 'active';
      });
      
      const relevantGoals = [...activeGoals, ...notStartedGoals, ...overdueGoals];
      return relevantGoals.slice(0, 3); // Limit to 3 most relevant
    }
    
    // For specific filters, show up to 3
    return filteredGoals.slice(0, 3);
  };

  const getUpcomingMeetings = () => {
    const today = new Date();
    return meetings
      .filter(meeting => new Date(meeting.scheduledDate) >= today)
      .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <div className="dashboard-main space-y-6">
          {/* Welcome Header Skeleton */}
          <div className="space-y-2">
            <div className="bg-gray-200 animate-pulse rounded h-8 w-80"></div>
            <div className="bg-gray-200 animate-pulse rounded h-5 w-64"></div>
          </div>

          {/* Quick Actions Skeleton */}
          <div className="space-y-4">
            <div className="bg-gray-200 animate-pulse rounded h-6 w-32"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SkeletonQuickAction />
              <SkeletonQuickAction />
              <SkeletonQuickAction />
              <SkeletonQuickAction />
            </div>
          </div>

          {/* Goals Skeleton */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <div className="bg-gray-200 animate-pulse rounded h-6 w-32"></div>
              <div className="bg-gray-200 animate-pulse rounded h-8 w-24"></div>
            </div>
            <div className="bg-gray-200 animate-pulse rounded h-10 w-96 mb-4"></div>
            <div className="space-y-3">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </div>

          {/* Reflections Skeleton */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <div className="bg-gray-200 animate-pulse rounded h-6 w-40"></div>
            </div>
            <div className="space-y-3">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </div>
        </div>

        <div className="dashboard-sidebar space-y-6">
          {/* Meetings Skeleton */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <div className="bg-gray-200 animate-pulse rounded h-6 w-24"></div>
              <div className="bg-gray-200 animate-pulse rounded h-8 w-16"></div>
            </div>
            <div className="space-y-3">
              <SkeletonCard />
            </div>
          </div>

          {/* Important Dates Skeleton */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <div className="bg-gray-200 animate-pulse rounded h-6 w-32"></div>
            </div>
            <div className="space-y-3">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </div>

          {/* Stats Skeleton */}
          <div className="card">
            <div className="bg-gray-200 animate-pulse rounded h-6 w-32 mb-4"></div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <div className="bg-gray-200 animate-pulse rounded h-4 w-20"></div>
                <div className="bg-gray-200 animate-pulse rounded h-4 w-8"></div>
              </div>
              <div className="flex justify-between">
                <div className="bg-gray-200 animate-pulse rounded h-4 w-24"></div>
                <div className="bg-gray-200 animate-pulse rounded h-4 w-8"></div>
              </div>
            </div>
          </div>
        </div>
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
    <div className="dashboard-layout">
      {/* Main Content */}
      <div className="dashboard-main space-y-6">
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
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <QuickActionCard
              icon={BookOpen}
              title="Pre-Meeting Reflection"
              subtitle="Prepare for your next meeting"
              onClick={() => openReflectionForm('pre-meeting')}
              isPrimary={true}
            />
            <QuickActionCard
              icon={BookOpen}
              title="Post-Meeting Summary"
              subtitle="Document insights and action items"
              onClick={() => openReflectionForm('post-meeting')}
            />
            <QuickActionCard
              icon={Target}
              title="Manage Goals"
              subtitle="Track progress and set new goals"
              onClick={() => setShowGoalTracker(true)}
            />
            <QuickActionCard
              icon={Calendar}
              title="Schedule Meeting"
              subtitle="Book time with your advisor"
              onClick={() => setShowCalendlyEmbed(true)}
            />
          </div>
        </div>

        {/* Goals Section with Filter */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              <h2 className="card-title">Goals</h2>
            </div>
            <button 
              onClick={() => setShowGoalTracker(true)}
              className="btn btn-sm btn-secondary"
            >
              <Plus className="w-4 h-4" />
              Add Goal
            </button>
          </div>
          
          {/* Goal Filter */}
          <div className="mb-6">
            <SegmentedControl
              options={[
                { label: 'All Goals', value: 'all', count: getGoalCounts().all },
                { label: 'Active', value: 'active', count: getGoalCounts().active },
                { label: 'Completed', value: 'completed', count: getGoalCounts().completed },
                { label: 'Overdue', value: 'overdue', count: getGoalCounts().overdue },
                { label: 'Not Started', value: 'not_started', count: getGoalCounts().not_started }
              ]}
              value={goalFilter}
              onChange={setGoalFilter}
            />
          </div>

          <div className="space-y-3">
            {getRelevantGoals().length > 0 ? (
              <>
                {getRelevantGoals().map((goal, index) => (
                  <GoalPreviewCard 
                    key={goal.id || index} 
                    goal={goal} 
                    onClick={openGoalModal}
                  />
                ))}
                <div className="pt-2">
                  <button
                    onClick={() => setShowGoalTracker(true)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View All Goals →
                  </button>
                </div>
              </>
            ) : (
              <div className="p-6 bg-gray-50 rounded-lg text-center">
                <Target className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-3">
                  {goalFilter === 'all' ? 'No goals set yet' : `No ${goalFilter.replace('_', ' ')} goals`}
                </p>
                <button
                  onClick={() => setShowGoalTracker(true)}
                  className="btn btn-primary btn-sm"
                >
                  {goalFilter === 'all' ? 'Set Your First Goal' : 'Create Goal'}
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
              <>
                {getRecentReflections().map((reflection, index) => (
                  <ReflectionCard
                    key={reflection.id || index}
                    reflection={reflection}
                    onClick={openReflectionModal}
                  />
                ))}
                <div className="pt-2 flex gap-3">
                  <button
                    onClick={() => openReflectionForm('pre-meeting')}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    New Reflection
                  </button>
                  <span className="text-gray-300">•</span>
                  <button
                    onClick={() => {/* Navigate to reflections page if exists */}}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View All Reflections →
                  </button>
                </div>
              </>
            ) : (
              <div className="p-6 bg-gray-50 rounded-lg text-center">
                <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-3">No reflections yet</p>
                <button
                  onClick={() => openReflectionForm('pre-meeting')}
                  className="btn btn-primary btn-sm"
                >
                  Write Your First Reflection
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="dashboard-sidebar space-y-6">
        {/* Upcoming Meetings */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-600" />
              <h2 className="card-title">Meetings</h2>
            </div>
            <button 
              onClick={() => setShowCalendlyEmbed(true)}
              className="btn btn-sm btn-secondary"
            >
              <Plus className="w-4 h-4" />
              Book
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
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-sm text-gray-600 mb-2">No meetings scheduled</p>
                <button 
                  onClick={() => setShowCalendlyEmbed(true)}
                  className="btn btn-primary btn-sm"
                >
                  Book a Meeting
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

        {/* Mini Stats Summary */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Progress Summary</h2>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Goals</span>
              <span className="font-medium text-gray-900">{goals.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Active Goals</span>
              <span className="font-medium text-green-600">{getGoalCounts().active}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Completed Goals</span>
              <span className="font-medium text-blue-600">{getGoalCounts().completed}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Reflections</span>
              <span className="font-medium text-purple-600">{reflections.length}</span>
            </div>
            {getGoalCounts().overdue > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Overdue</span>
                <span className="font-medium text-red-600">{getGoalCounts().overdue}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="col-span-full text-sm text-gray-500 text-center mt-8">
        Having issues? Contact your coordinator at {process.env.REACT_APP_ADMIN_EMAIL}
      </div>

      {/* Modals */}
      <ReflectionModal
        reflection={selectedReflection}
        isOpen={showReflectionModal}
        onClose={closeReflectionModal}
        onEdit={handleEditReflection}
      />
      
      <GoalModal
        goal={selectedGoal}
        isOpen={showGoalModal}
        onClose={closeGoalModal}
        onEdit={handleEditGoal}
        onDelete={handleDeleteGoal}
      />

      {/* Calendly Embed Modal */}
      <CalendlyEmbed
        isOpen={showCalendlyEmbed}
        onClose={() => setShowCalendlyEmbed(false)}
        schedulingLink={getSchedulingLink()}
        userName={user?.displayName}
      />
    </div>
  );
};

export default StudentDashboard;