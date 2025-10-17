import React, { useState, useEffect } from 'react';
import { Users, Calendar, TrendingUp, Target } from 'lucide-react';
import AdvisorDashboardGrid, { AdvisorGridContainer } from '../components/shared/AdvisorDashboardGrid';
import NeedsAttentionPanel from '../components/advisor/NeedsAttentionPanel';
import StrugglingItemsPanel from '../components/advisor/StrugglingItemsPanel';
import AdvisorStudentList from '../components/advisor/AdvisorStudentList';
import AdvisorImportantDates from '../components/advisor/AdvisorImportantDates';
import AdvisorMeetingsPanel from '../components/advisor/AdvisorMeetingsPanel';
import AdvisorActiveGoals from '../components/advisor/AdvisorActiveGoals';
import AdvisorProgressReports from '../components/advisor/AdvisorProgressReports';
import AdvisorStudentDetail from '../components/advisor/AdvisorStudentDetail';

import { isAdvisorLayoutV2Enabled, isAdvisorStudentListPreviewEnabled } from '../config/featureFlags.ts';
import { getAdvisorDashboardData } from '../services/firebase';
import AdminDashboard from '../components/admin/AdminDashboard';

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
  const [showProgressReports, setShowProgressReports] = useState(false);
  const [showStudentDetail, setShowStudentDetail] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
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
        const data = await getAdvisorDashboardData(advisorEmail);
        setDashboardData(data);
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

  // Show progress reports if requested
  if (showProgressReports) {
    return (
      <AdvisorProgressReports
        advisorEmail={advisorEmail}
        userProfile={userProfile}
        onBack={() => setShowProgressReports(false)}
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
    overdueItems: 0
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

      {/* Stats Overview */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Students</p>
            <p className="text-2xl font-bold text-gray-900">{statsData.totalStudents}</p>
            <p className="text-xs text-gray-500">{statsData.activeStudents} active</p>
          </div>
          <Users className="w-8 h-8 text-blue-600" />
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
                onClick={() => setShowImportantDates(true)}
                className="btn btn-secondary"
              >
                <Calendar className="w-4 h-4" />
                Important Dates
              </button>
              <button 
                onClick={() => setShowProgressReports(true)}
                className="btn btn-secondary"
              >
                <TrendingUp className="w-4 h-4" />
                Progress Reports
              </button>
            </AdvisorGridContainer>
          </div>

          {/* Dashboard Overview */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Dashboard Overview</h2>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">
                    {statsData.activeGoals} active goals across all students
                  </span>
                </div>
                {statsData.overdueItems > 0 && (
                  <p className="text-xs text-red-600 mt-1">
                    {statsData.overdueItems} goal{statsData.overdueItems > 1 ? 's' : ''} overdue
                  </p>
                )}
              </div>


              {statsData.totalStudents === 0 && (
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-medium">
                      No students assigned yet
                    </span>
                  </div>
                  <p className="text-xs text-yellow-700 mt-1">
                    Students will appear when they select you as their advisor during onboarding
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Meeting Management */}
          <AdvisorMeetingsPanel
            advisorEmail={advisorEmail}
            userProfile={userProfile}
          />
        </AdvisorDashboardGrid.Main>

        <AdvisorDashboardGrid.Sidebar>
          <NeedsAttentionPanel 
            advisorEmail={advisorEmail}
            userProfile={userProfile}
            onStudentClick={handleStudentClick}
            onViewAllClick={handleViewAllStudentIssues}
          />
          <StrugglingItemsPanel 
            advisorEmail={advisorEmail}
            userProfile={userProfile}
          />
        </AdvisorDashboardGrid.Sidebar>
      </AdvisorDashboardGrid>
    </div>
  );
};

export default AdvisorDashboard;