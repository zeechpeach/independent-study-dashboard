import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Plus, CheckSquare } from 'lucide-react';
import ActionPlan from './ActionPlan';
import CalendlyEmbed from '../shared/CalendlyEmbed.jsx';
import MeetingsCard from './MeetingsCard';
import MeetingCreateModal from './MeetingCreateModal';
import NotesSection from './NotesSection';
import ImportantDateModal from './ImportantDateModal';
import { SkeletonCard } from '../ui/Skeleton';
import DashboardGrid from '../shared/DashboardGrid';
import useMeetings from '../../hooks/useMeetings';
import { 
  getUserActionItems,
  createActionItem,
  updateActionItem,
  deleteActionItem,
  getImportantDatesForAdvisors,
  getAdvisorByName,
  createImportantDate
} from '../../services/firebase';

const StudentDashboard = ({ user, userProfile }) => {
  const [actionItems, setActionItems] = useState([]);
  const [importantDates, setImportantDates] = useState([]);
  const [advisorInfo, setAdvisorInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showActionPlan, setShowActionPlan] = useState(false);
  const [showCalendlyEmbed, setShowCalendlyEmbed] = useState(false);
  const [showMeetingCreateModal, setShowMeetingCreateModal] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [showImportantDateModal, setShowImportantDateModal] = useState(false);

  // Use the meetings hook for meeting management
  const {
    upcomingMeetings,
    pastMeetings,
    attendanceCounts,
    loading: meetingsLoading,
    error: meetingsError,
    createMeeting,
    updateMeeting,
    markStudentAttendance,
    formatDate
  } = useMeetings(user?.uid);

  // Wrap fetchUserData in useCallback to fix dependency warning
  const fetchUserData = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      const userActionItems = await getUserActionItems(user.uid);
      setActionItems(userActionItems);
      
      // Fetch important dates from assigned advisors
      if (userProfile?.advisor) {
        try {
          // Get advisor ID from name  
          const advisor = await getAdvisorByName(userProfile.advisor);
          const advisorIds = advisor ? [advisor.id] : [];
          
          // Get important dates for advisor + global dates, filter for upcoming
          const allDates = await getImportantDatesForAdvisors(advisorIds);
          const today = new Date().toISOString().split('T')[0];
          const upcomingDates = allDates.filter(date => date.date >= today);
          
          setImportantDates(upcomingDates);
        } catch (error) {
          console.error('Error fetching advisor important dates:', error);
          setImportantDates([]);
        }
      } else {
        setImportantDates([]);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid, userProfile?.advisor]);

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

  // Handle action item operations
  const handleCreateActionItem = async (itemData) => {
    try {
      await createActionItem(user.uid, itemData);
      await fetchUserData();
    } catch (error) {
      console.error('Error creating action item:', error);
      throw error;
    }
  };

  const handleUpdateActionItem = async (itemId, itemData) => {
    try {
      await updateActionItem(itemId, itemData);
      await fetchUserData();
    } catch (error) {
      console.error('Error updating action item:', error);
      throw error;
    }
  };

  const handleDeleteActionItem = async (itemId) => {
    try {
      await deleteActionItem(itemId);
      await fetchUserData();
    } catch (error) {
      console.error('Error deleting action item:', error);
      throw error;
    }
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

  const getUpcomingDates = () => {
    const today = new Date();
    return importantDates
      .filter(date => new Date(date.date) >= today)
      .slice(0, 3)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const getActionItemStats = () => {
    const active = actionItems.filter(item => !item.completed).length;
    const completed = actionItems.filter(item => item.completed).length;
    const struggling = actionItems.filter(item => item.struggling && !item.completed).length;
    return { active, completed, struggling, total: actionItems.length };
  };

  // Meeting-related handlers
  const handleBookMeeting = () => {
    setShowMeetingCreateModal(true);
  };

  const handleCreateMeeting = async (meetingData) => {
    try {
      await createMeeting(meetingData);
      setShowMeetingCreateModal(false);
      setEditingMeeting(null);
    } catch (error) {
      console.error('Error creating meeting:', error);
      // Error will be displayed in the modal
    }
  };

  const handleEditMeeting = (meeting) => {
    setEditingMeeting(meeting);
    setShowMeetingCreateModal(true);
  };

  const handleUpdateMeeting = async (meetingId, meetingData) => {
    try {
      await updateMeeting(meetingId, meetingData);
      setShowMeetingCreateModal(false);
      setEditingMeeting(null);
    } catch (error) {
      console.error('Error updating meeting:', error);
      // Error will be displayed in the modal
    }
  };

  const handleSaveMeeting = async (meetingIdOrData, meetingData) => {
    if (editingMeeting) {
      // Editing mode: first param is meetingId, second is data
      await handleUpdateMeeting(meetingIdOrData, meetingData);
    } else {
      // Creating mode: first param is data
      await handleCreateMeeting(meetingIdOrData);
    }
  };

  const handleAddImportantDate = async (dateData) => {
    try {
      // Store important dates as student-specific (using userId as a "student" scope)
      await createImportantDate({
        ...dateData,
        createdBy: user?.uid,
        scope: 'student',  // Mark as student-created
        studentId: user?.uid
      });
      // Refresh data to show the new date
      await fetchUserData();
    } catch (error) {
      console.error('Error creating important date:', error);
      throw error;
    }
  };

  const handleJoinMeeting = (meeting) => {
    if (meeting?.meetingLink) {
      window.open(meeting.meetingLink, '_blank');
    }
  };

  // Format date for important dates (simpler format)
  const formatImportantDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };



  if (loading) {
    return (
      <DashboardGrid>
        <DashboardGrid.Main>
          {/* Welcome Header Skeleton */}
          <div className="space-y-2">
            <div className="bg-gray-200 animate-pulse rounded h-8 w-80"></div>
            <div className="bg-gray-200 animate-pulse rounded h-5 w-64"></div>
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
        </DashboardGrid.Main>

        <DashboardGrid.Sidebar>
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
        </DashboardGrid.Sidebar>
      </DashboardGrid>
    );
  }

  if (showActionPlan) {
    return (
      <ActionPlan
        user={user}
        actionItems={actionItems}
        onCreateItem={handleCreateActionItem}
        onUpdateItem={handleUpdateActionItem}
        onDeleteItem={handleDeleteActionItem}
        onBack={() => setShowActionPlan(false)}
      />
    );
  }

  return (
    <DashboardGrid>
      {/* Main Content */}
      <DashboardGrid.Main>
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

        {/* Action Plan Summary */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-blue-600" />
              <h2 className="card-title">Action Plan</h2>
            </div>
            <button 
              onClick={() => setShowActionPlan(true)}
              className="btn btn-sm btn-secondary"
            >
              View All
            </button>
          </div>

          <div className="space-y-4">
            {/* Quick Add Form */}
            <QuickAddActionItem onAdd={handleCreateActionItem} />

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{getActionItemStats().active}</p>
                <p className="text-xs text-gray-600">Active</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{getActionItemStats().completed}</p>
                <p className="text-xs text-gray-600">Completed</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">{getActionItemStats().struggling}</p>
                <p className="text-xs text-gray-600">Need Help</p>
              </div>
            </div>

            {/* Recent active items */}
            {getActionItemStats().total > 0 ? (
              <>
                <div className="space-y-2">
                  {actionItems
                    .filter(item => !item.completed)
                    .slice(0, 3)
                    .map(item => (
                      <div key={item.id} className={`p-3 rounded-lg border ${item.struggling ? 'border-orange-300 bg-orange-50' : 'border-gray-200 bg-gray-50'}`}>
                        <p className="text-sm text-gray-900">{item.text}</p>
                        {item.struggling && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-orange-600 text-white text-xs rounded">
                            Need Help
                          </span>
                        )}
                      </div>
                    ))}
                </div>
                <button
                  onClick={() => setShowActionPlan(true)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium w-full text-center"
                >
                  View Full Action Plan →
                </button>
              </>
            ) : (
              <div className="p-6 bg-gray-50 rounded-lg text-center">
                <CheckSquare className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-3">No action items yet</p>
                <p className="text-xs text-gray-500">Use the form above to add your first item</p>
              </div>
            )}
          </div>
        </div>

        {/* Notes Section */}
        <NotesSection userId={user?.uid} />
      </DashboardGrid.Main>

      {/* Sidebar */}
      <DashboardGrid.Sidebar>
        {/* Upcoming Meetings */}
        <MeetingsCard
          upcomingMeetings={upcomingMeetings}
          pastMeetings={pastMeetings}
          attendanceCounts={attendanceCounts}
          loading={meetingsLoading}
          error={meetingsError}
          onBookMeeting={handleBookMeeting}
          onJoinMeeting={handleJoinMeeting}
          onEditMeeting={handleEditMeeting}
          onMarkAttendance={markStudentAttendance}
          formatDate={formatDate}
        />

        {/* Important Dates */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <h2 className="card-title">Important Dates</h2>
            </div>
            <button 
              onClick={() => setShowImportantDateModal(true)}
              className="btn btn-sm btn-secondary"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
          <div className="space-y-3">
            {getUpcomingDates().length > 0 ? (
              getUpcomingDates().map((date, index) => (
                <div key={date.id || index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{date.title}</h4>
                      <p className="text-sm text-gray-600">{formatImportantDate(date.date)}</p>
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
              <span className="text-sm text-gray-600">Total Action Items</span>
              <span className="font-medium text-gray-900">{getActionItemStats().total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Active Items</span>
              <span className="font-medium text-blue-600">{getActionItemStats().active}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Completed</span>
              <span className="font-medium text-green-600">{getActionItemStats().completed}</span>
            </div>
            {getActionItemStats().struggling > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Need Help</span>
                <span className="font-medium text-orange-600">{getActionItemStats().struggling}</span>
              </div>
            )}
          </div>
        </div>
      </DashboardGrid.Sidebar>

      {/* Calendly Embed Modal */}
      <CalendlyEmbed
        isOpen={showCalendlyEmbed}
        onClose={() => setShowCalendlyEmbed(false)}
        schedulingLink={getSchedulingLink()}
        userName={user?.displayName}
      />

      {/* Manual Meeting Create Modal */}
      <MeetingCreateModal
        isOpen={showMeetingCreateModal}
        onClose={() => {
          setShowMeetingCreateModal(false);
          setEditingMeeting(null);
        }}
        onSave={handleSaveMeeting}
        editingMeeting={editingMeeting}
        userProfile={{ id: user?.uid, name: user?.displayName, email: user?.email }}
      />

      {/* Important Date Modal */}
      <ImportantDateModal
        isOpen={showImportantDateModal}
        onClose={() => setShowImportantDateModal(false)}
        onSave={handleAddImportantDate}
      />
    </DashboardGrid>
  );
};

// Quick Add Action Item Component
const QuickAddActionItem = ({ onAdd }) => {
  const [text, setText] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsAdding(true);
    try {
      await onAdd({
        text: text.trim(),
        completed: false,
        struggling: false
      });
      setText('');
    } catch (error) {
      console.error('Error adding action item:', error);
      alert('Failed to add action item. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a new action item..."
        className="flex-1 p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        disabled={isAdding}
      />
      <button
        type="submit"
        disabled={!text.trim() || isAdding}
        className="btn btn-primary btn-sm whitespace-nowrap"
      >
        <Plus className="w-4 h-4" />
        {isAdding ? 'Adding...' : 'Add'}
      </button>
    </form>
  );
};

export default StudentDashboard;