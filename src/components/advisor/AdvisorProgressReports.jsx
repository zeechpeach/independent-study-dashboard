import React, { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, Users, FileText, Calendar } from 'lucide-react';
import { getAdvisorDashboardData } from '../../services/firebase';

/**
 * AdvisorProgressReports - Generate and view progress reports for students
 */
const AdvisorProgressReports = ({ advisorEmail, userProfile, onBack }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportPeriod, setReportPeriod] = useState('monthly');

  const actualAdvisorEmail = advisorEmail || userProfile?.email;

  useEffect(() => {
    const fetchData = async () => {
      if (!actualAdvisorEmail) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getAdvisorDashboardData(actualAdvisorEmail);
        setDashboardData(data);
      } catch (err) {
        console.error('Error fetching progress report data:', err);
        setError('Failed to load progress report data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [actualAdvisorEmail]);

  const generateReport = () => {
    // Placeholder for report generation functionality
    alert(`Generating ${reportPeriod} progress report... (Feature coming soon!)`);
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Progress Reports</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="loading-spinner w-8 h-8" />
          <span className="ml-3 text-gray-600">Loading data...</span>
        </div>
      </div>
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
      <div className="flex items-center gap-3">
        <button 
          onClick={onBack}
          className="text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Progress Reports</h1>
          <p className="text-gray-600">Generate comprehensive reports for your students</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Report Generation */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Generate New Report</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Period
            </label>
            <select 
              value={reportPeriod}
              onChange={(e) => setReportPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="weekly">Weekly Report</option>
              <option value="monthly">Monthly Report</option>
              <option value="quarterly">Quarterly Report</option>
              <option value="semester">Semester Report</option>
            </select>
          </div>
          
          <button 
            onClick={generateReport}
            className="btn btn-primary"
          >
            <FileText className="w-4 h-4" />
            Generate Report
          </button>
        </div>
      </div>

      {/* Current Stats Overview */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Current Performance Overview</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-900">{statsData.totalStudents}</p>
            <p className="text-sm text-blue-700">Total Students</p>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-900">{statsData.activeGoals}</p>
            <p className="text-sm text-green-700">Active Goals</p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <FileText className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-900">{statsData.pendingReflections}</p>
            <p className="text-sm text-purple-700">Pending Reviews</p>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <Calendar className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-orange-900">{statsData.weeklyMeetings}</p>
            <p className="text-sm text-orange-700">Weekly Meetings</p>
          </div>
        </div>
      </div>

      {/* Report History */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Recent Reports</h2>
        </div>
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No reports generated yet</h3>
          <p className="text-gray-600">Generate your first progress report to see it here.</p>
        </div>
      </div>
    </div>
  );
};

export default AdvisorProgressReports;