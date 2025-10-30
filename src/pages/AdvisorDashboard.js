import React, { useState, useEffect } from 'react';
import { Users, Target, History } from 'lucide-react';
import { AdvisorGridContainer } from '../components/shared/AdvisorDashboardGrid';
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
      {/* Header with inline stats */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-800 text-sm mb-2"
          >
            ← Back to Student View
          </button>
          <div className="flex items-center gap-4 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900">Advisor Dashboard</h1>
            {/* Compact inline stats next to title */}
            <div className="flex items-center gap-3">
              <div className="bg-white rounded border border-gray-300 px-3 py-1.5">
                <span className="text-xs font-medium text-gray-600">Total Students: </span>
                <span className="text-sm font-bold text-gray-900">{statsData.totalStudents}</span>
              </div>
              <div className="bg-white rounded border border-gray-300 px-3 py-1.5">
                <span className="text-xs font-medium text-gray-600">Total Meetings Completed: </span>
                <span className="text-sm font-bold text-gray-900">{statsData.totalCompletedMeetings}</span>
              </div>
            </div>
          </div>
          <p className="text-gray-600 mt-1">Monitor student progress and provide guidance</p>
          {error && (
            <p className="text-red-600 text-sm mt-1">⚠️ Some data may be incomplete due to loading errors</p>
          )}
        </div>
      </div>

      {/* Two-column layout: Main Content (65%) + Sidebar (35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
        {/* Main Content Area (Left side, ~65% width) */}
        <div className="space-y-6">
          {/* Quick Actions Panel */}
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

          {/* Meeting Management Panel */}
          <AdvisorMeetingsPanel
            advisorEmail={advisorEmail}
            userProfile={userProfile}
            onViewHistory={() => setShowMeetingHistory(true)}
          />

          {/* Meeting Notes Panel */}
          <AdvisorNotesSection
            advisorId={user?.uid}
            students={students}
          />
        </div>

        {/* Sidebar (Right side, ~35% width, ~350px) */}
        <div className="space-y-4">
          {/* Important Dates - compact, max ~300px tall */}
          <div className="max-h-[300px]">
            <AdvisorImportantDatesPanel
              userProfile={userProfile}
              onManageClick={() => setShowImportantDates(true)}
            />
          </div>

          {/* Students Needing Help - compact, max ~150px tall */}
          <div className="max-h-[400px]">
            <NeedsAttentionPanel 
              advisorEmail={advisorEmail}
              userProfile={userProfile}
              onStudentClick={handleStudentClick}
              onViewAllClick={handleViewAllStudentIssues}
            />
          </div>

          {/* Action Items - moved from main area to sidebar */}
          <AdvisorTodoList 
            advisorId={user?.uid}
            students={students}
          />
        </div>
      </div>
    </div>
  );
};

export default AdvisorDashboard;