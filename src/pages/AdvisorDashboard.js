import React, { useState, useEffect } from 'react';
import { Users, Calendar, Target, History } from 'lucide-react';
import AdvisorDashboardGrid, { AdvisorGridContainer } from '../components/shared/AdvisorDashboardGrid';
import NeedsAttentionPanel from '../components/advisor/NeedsAttentionPanel';
import AdvisorStudentList from '../components/advisor/AdvisorStudentList';
import AdvisorImportantDates from '../components/advisor/AdvisorImportantDates';
import AdvisorImportantDatesPanel from '../components/advisor/AdvisorImportantDatesPanel';
import AdvisorMeetingsPanel from '../components/advisor/AdvisorMeetingsPanel';
import AdvisorActiveGoals from '../components/advisor/AdvisorActiveGoals';
import AdvisorStudentDetail from '../components/advisor/AdvisorStudentDetail';
import AdvisorTodoList from '../components/advisor/AdvisorTodoList';
import MeetingHistoryPanel from '../components/advisor/MeetingHistoryPanel';
import ProjectGroupManagement from '../components/advisor/ProjectGroupManagement';

import { isAdvisorLayoutV2Enabled, isAdvisorStudentListPreviewEnabled } from '../config/featureFlags.ts';
import { getAdvisorDashboardData, getStudentsByAdvisor } from '../services/firebase';
import AdminDashboard from '../components/admin/AdminDashboard';
import AdvisorNotesSection from '../components/advisor/AdvisorNotesSection';

/**
 * AdvisorDashboard - Main advisor dashboard page
 * 
 * Phase 3B: Now uses dynamic data from Firebase while maintaining
 * backward compatibility through feature flags.
 */
const AdvisorDashboard = ({ user, userProfile, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [showStudentList, setShowStudentList] = useState(false);
  const [showImportantDates, setShowImportantDates] = useState(false);
  const [showActiveGoals, setShowActiveGoals] = useState(false);
  const [showStudentDetail, setShowStudentDetail] = useState(false);
  const [showMeetingHistory, setShowMeetingHistory] = useState(false);
  const [showProjectGroups, setShowProjectGroups] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [students, setStudents] = useState([]);
  const [error, setError] = useState(null);
  
  // Feature flag checks
  const useNewLayout = isAdvisorLayoutV2Enabled();
  const isStudentListEnabled = isAdvisorStudentListPreviewEnabled();

  // Get advisor email for data queries (students are assigned by email, not name)
  const advisorEmail = userProfile?.email;

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!advisorEmail) {
        setLoading(false);
        setError('No advisor information available');
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const [data, studentsList] = await Promise.all([
          getAdvisorDashboardData(advisorEmail),
          getStudentsByAdvisor(advisorEmail)
        ]);
        setDashboardData(data);
        setStudents(studentsList);
      } catch (err) {
        console.error('Error fetching advisor dashboard data:', err);
        setError('Failed to load dashboard data');
        // Set fallback data to prevent complete failure
        setDashboardData({
          totalStudents: 0,
          activeStudents: 0,
          weeklyMeetings: 0,
          pendingReflections: 0,
          activeGoals: 0,
          overdueItems: 0
        });
      } finally {
        setLoading(false);
      }
    };

    // Simulate initial loading delay for UX
    const timer = setTimeout(() => {
      fetchDashboardData();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [advisorEmail]);

  // Fallback to legacy admin dashboard if feature flag is disabled
  if (!useNewLayout) {
    return (
      <AdminDashboard 
        user={user} 
        userProfile={userProfile}
        onBack={onBack}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="loading-spinner" />
          <span className="text-gray-600">Loading advisor dashboard...</span>
        </div>
      </div>
    );
  }

  // Click handlers for panels
  const handleStudentClick = (student) => {
    setSelectedStudent(student);
    setShowStudentDetail(true);
  };



  const handleViewAllStudentIssues = () => {
    setShowStudentList(true);
  };

  // Show student list if requested and feature is enabled (unless showing student detail)
  if (showStudentList && isStudentListEnabled && !showStudentDetail) {
    return (
      <AdvisorStudentList
        onBack={() => setShowStudentList(false)}
        advisorEmail={advisorEmail}
        userProfile={userProfile}
        onStudentClick={handleStudentClick}
      />
    );
  }

  // Show important dates management if requested
  if (showImportantDates) {
    return (
      <AdvisorImportantDates
        user={user}
        onBack={() => setShowImportantDates(false)}
      />
    );
  }

  // Show active goals if requested
  if (showActiveGoals) {
    return (
      <AdvisorActiveGoals
        advisorEmail={advisorEmail}
        userProfile={userProfile}
        onBack={() => setShowActiveGoals(false)}
      />
    );
  }

  // Show meeting history if requested
  if (showMeetingHistory) {
    return (
      <MeetingHistoryPanel
        advisorEmail={advisorEmail}
        userProfile={userProfile}
        onBack={() => setShowMeetingHistory(false)}
      />
    );
  }

  // Show project groups management if requested
  if (showProjectGroups) {
    return (
      <ProjectGroupManagement
        advisorId={user?.uid}
        advisorEmail={advisorEmail}
        onBack={() => setShowProjectGroups(false)}
      />
    );
  }

  // Show student detail if requested
  if (showStudentDetail && selectedStudent) {
    return (
      <AdvisorStudentDetail
        studentId={selectedStudent.id}
        studentName={selectedStudent.name}
        studentEmail={selectedStudent.email}
        userProfile={userProfile}
        onBack={() => {
          setShowStudentDetail(false);
          setSelectedStudent(null);
          // Return to student list instead of main dashboard
          setShowStudentList(true);
        }}
      />
    );
  }

  const statsData = dashboardData || {
    totalStudents: 0,
    activeStudents: 0,
    weeklyMeetings: 0,
    pendingReflections: 0,
    activeGoals: 0,
    overdueItems: 0,
    totalCompletedMeetings: 0
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Advisor Dashboard</h1>
          <p className="text-gray-600">Monitor student progress and provide guidance</p>
          {error && (
            <p className="text-red-600 text-sm mt-1">⚠️ Some data may be incomplete due to loading errors</p>
          )}
        </div>
      </div>

      {/* Stats Overview - Compact Stats and Important Dates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Compact stat cards - significantly reduced padding and sizing */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Total Students</p>
              <p className="text-lg font-bold text-gray-900">{statsData.totalStudents}</p>
            </div>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 shadow-sm p-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-green-700">Total Meeting Views</p>
              <p className="text-lg font-bold text-green-900">{statsData.totalCompletedMeetings}</p>
            </div>
            <Calendar className="w-4 h-4 text-green-600" />
          </div>
        </div>

        <div className="md:row-span-1">
          <AdvisorImportantDatesPanel
            userProfile={userProfile}
            onManageClick={() => setShowImportantDates(true)}
          />
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <AdvisorDashboardGrid>
        <AdvisorDashboardGrid.Main>
          {/* Quick Actions */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Quick Actions</h2>
            </div>
            <AdvisorGridContainer cols={2} gap={3}>
              <button 
                onClick={() => setShowStudentList(true)}
                className="btn btn-primary"
                disabled={!isStudentListEnabled}
              >
                <Users className="w-4 h-4" />
                View All Students
                {!isStudentListEnabled && (
                  <span className="text-xs opacity-75">(Preview)</span>
                )}
              </button>

              <button 
                onClick={() => setShowActiveGoals(true)}
                className="btn btn-secondary"
              >
                <Target className="w-4 h-4" />
                Review Active Goals
              </button>
              <button 
                onClick={() => setShowMeetingHistory(true)}
                className="btn btn-secondary"
              >
                <History className="w-4 h-4" />
                Meeting History
              </button>
              <button 
                onClick={() => setShowProjectGroups(true)}
                className="btn btn-secondary"
              >
                <Users className="w-4 h-4" />
                Project Teams
              </button>
            </AdvisorGridContainer>
          </div>



          {/* Meeting Management */}
          <AdvisorMeetingsPanel
            advisorEmail={advisorEmail}
            userProfile={userProfile}
            onViewHistory={() => setShowMeetingHistory(true)}
          />

          {/* Advisor Notes */}
          <AdvisorNotesSection
            advisorId={user?.uid}
            students={students}
          />
        </AdvisorDashboardGrid.Main>

        <AdvisorDashboardGrid.Sidebar>
          <NeedsAttentionPanel 
            advisorEmail={advisorEmail}
            userProfile={userProfile}
            onStudentClick={handleStudentClick}
            onViewAllClick={handleViewAllStudentIssues}
          />
          <AdvisorTodoList 
            advisorId={user?.uid}
            students={students}
          />
        </AdvisorDashboardGrid.Sidebar>
      </AdvisorDashboardGrid>
    </div>
  );
};

export default AdvisorDashboard;