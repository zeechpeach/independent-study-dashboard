import React, { useState, useEffect } from 'react';
import { Users, Calendar, TrendingUp, BookOpen, Target } from 'lucide-react';
import AdvisorDashboardGrid, { AdvisorGridContainer } from '../components/shared/AdvisorDashboardGrid';
import NeedsAttentionPanel from '../components/advisor/NeedsAttentionPanel';
import RecentReflectionsPanel from '../components/advisor/RecentReflectionsPanel';
import AdvisorStudentList from '../components/advisor/AdvisorStudentList';
import { isAdvisorLayoutV2Enabled, isAdvisorStudentListPreviewEnabled } from '../config/featureFlags.ts';
import AdminDashboard from '../components/admin/AdminDashboard';

/**
 * AdvisorDashboard - Main advisor dashboard page
 * 
 * Implements the new advisor layout structure with feature flag support.
 * Falls back to legacy admin dashboard when advisorLayoutV2 is disabled.
 */
const AdvisorDashboard = ({ user, userProfile, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [showStudentList, setShowStudentList] = useState(false);
  
  // Feature flag checks
  const useNewLayout = isAdvisorLayoutV2Enabled();
  const isStudentListEnabled = isAdvisorStudentListPreviewEnabled();

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

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

  // Static placeholder data for stats overview
  const statsData = {
    totalStudents: 12,
    activeStudents: 10,
    weeklyMeetings: 8,
    pendingReflections: 3,
    activeGoals: 24,
    overdueItems: 2
  };

  // Show student list if requested and feature is enabled
  if (showStudentList && isStudentListEnabled) {
    return (
      <AdvisorStudentList
        onBack={() => setShowStudentList(false)}
      />
    );
  }

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
        </div>
      </div>

      {/* Stats Overview */}
      <AdvisorGridContainer cols={3}>
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

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Week's Meetings</p>
              <p className="text-2xl font-bold text-gray-900">{statsData.weeklyMeetings}</p>
              <p className="text-xs text-gray-500">{statsData.pendingReflections} pending reflections</p>
            </div>
            <Calendar className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Goals</p>
              <p className="text-2xl font-bold text-gray-900">{statsData.activeGoals}</p>
              <p className="text-xs text-gray-500">{statsData.overdueItems} need attention</p>
            </div>
            <Target className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </AdvisorGridContainer>

      {/* Main Dashboard Content */}
      <AdvisorDashboardGrid>
        <AdvisorDashboardGrid.Main>
          {/* Quick Actions */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Quick Actions</h2>
            </div>
            <AdvisorGridContainer cols={2} gap={3}>
              <button 
                className="btn btn-primary"
                onClick={() => isStudentListEnabled ? setShowStudentList(true) : null}
                disabled={!isStudentListEnabled}
              >
                <Users className="w-4 h-4" />
                View All Students
                {!isStudentListEnabled && (
                  <span className="text-xs opacity-75">(Preview)</span>
                )}
              </button>
              <button className="btn btn-secondary">
                <Calendar className="w-4 h-4" />
                Schedule Meetings
              </button>
              <button className="btn btn-secondary">
                <BookOpen className="w-4 h-4" />
                Review Reflections
              </button>
              <button className="btn btn-secondary">
                <TrendingUp className="w-4 h-4" />
                Progress Reports
              </button>
            </AdvisorGridContainer>
          </div>

          {/* Recent Activity Overview */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Recent Activity</h2>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">Alex Johnson submitted a pre-meeting reflection</span>
                  <span className="text-xs text-gray-500 ml-auto">2h ago</span>
                </div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">Morgan Chen completed milestone goal</span>
                  <span className="text-xs text-gray-500 ml-auto">4h ago</span>
                </div>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium">Meeting scheduled with Jordan Smith</span>
                  <span className="text-xs text-gray-500 ml-auto">1d ago</span>
                </div>
              </div>
            </div>
          </div>
        </AdvisorDashboardGrid.Main>

        <AdvisorDashboardGrid.Sidebar>
          {/* Needs Attention Panel */}
          <NeedsAttentionPanel />
          
          {/* Recent Reflections Panel */}
          <RecentReflectionsPanel />
          
          {/* Quick Stats Card */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-sm font-semibold text-gray-700">This Week</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Meetings conducted</span>
                <span className="font-medium">8</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Reflections reviewed</span>
                <span className="font-medium">15</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Goals updated</span>
                <span className="font-medium">6</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Students contacted</span>
                <span className="font-medium">12</span>
              </div>
            </div>
          </div>
        </AdvisorDashboardGrid.Sidebar>
      </AdvisorDashboardGrid>
    </div>
  );
};

export default AdvisorDashboard;