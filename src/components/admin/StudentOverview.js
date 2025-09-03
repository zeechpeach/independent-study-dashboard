import React, { useState } from 'react';
import { User, BookOpen, Target, Calendar, TrendingUp, AlertTriangle, Eye } from 'lucide-react';

const StudentOverview = ({ users, reflections, goals, meetings, onBack }) => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [filter, setFilter] = useState('all'); // all, active, needs-attention

  const getStudentData = (student) => {
    const studentReflections = reflections.filter(r => r.userId === student.id);
    const studentGoals = goals.filter(g => g.userId === student.id);
    const studentMeetings = meetings.filter(m => m.studentId === student.id);

    const lastReflection = studentReflections.sort((a, b) => {
      const aDate = new Date(a.createdAt?.toDate?.() || a.createdAt);
      const bDate = new Date(b.createdAt?.toDate?.() || b.createdAt);
      return bDate - aDate;
    })[0];

    const activeGoals = studentGoals.filter(g => g.status !== 'completed');
    const completedGoals = studentGoals.filter(g => g.status === 'completed');
    
    const overdueGoals = studentGoals.filter(g => {
      if (g.status === 'completed') return false;
      const targetDate = g.targetDate ? new Date(g.targetDate) : null;
      return targetDate && targetDate < new Date();
    });

    const daysSinceLastReflection = lastReflection ? 
      Math.floor((new Date() - new Date(lastReflection.createdAt?.toDate?.() || lastReflection.createdAt)) / (1000 * 60 * 60 * 24)) : 
      null;

    const needsAttention = 
      daysSinceLastReflection > 14 || 
      overdueGoals.length > 0 || 
      studentGoals.length === 0 ||
      studentMeetings.length === 0;

    return {
      student,
      reflections: studentReflections,
      goals: studentGoals,
      meetings: studentMeetings,
      activeGoals: activeGoals.length,
      completedGoals: completedGoals.length,
      overdueGoals: overdueGoals.length,
      totalReflections: studentReflections.length,
      lastReflection,
      daysSinceLastReflection,
      needsAttention
    };
  };

  const getFilteredStudents = () => {
    const studentData = users.map(getStudentData);
    
    switch (filter) {
      case 'active':
        return studentData.filter(data => 
          data.totalReflections > 0 || data.goals.length > 0
        );
      case 'needs-attention':
        return studentData.filter(data => data.needsAttention);
      default:
        return studentData;
    }
  };



  const formatDaysAgo = (days) => {
    if (days === null) return 'Never';
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };



  const getEngagementLevel = (data) => {
    if (data.totalReflections === 0 && data.goals.length === 0) return 'No Activity';
    if (data.totalReflections >= 10 && data.activeGoals >= 3) return 'High';
    if (data.totalReflections >= 5 && data.activeGoals >= 1) return 'Medium';
    return 'Low';
  };

  if (selectedStudent) {
    return (
      <StudentDetailView
        studentData={getStudentData(selectedStudent)}
        onBack={() => setSelectedStudent(null)}
      />
    );
  }

  const filteredStudents = getFilteredStudents();
  const totalStudents = users.length;
  const activeStudents = users.filter(u => {
    const data = getStudentData(u);
    return data.totalReflections > 0 || data.goals.length > 0;
  }).length;
  const needsAttentionCount = users.filter(u => getStudentData(u).needsAttention).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-800 text-sm mb-2"
          >
            ← Back to Admin Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Student Overview</h1>
          <p className="text-gray-600">Monitor individual student progress and engagement</p>
        </div>
      </div>

      {/* Filter Stats */}
      <div className="grid grid-3">
        <div className="card">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
            <p className="text-sm text-gray-600">Total Students</p>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{activeStudents}</p>
            <p className="text-sm text-gray-600">Active Students</p>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{needsAttentionCount}</p>
            <p className="text-sm text-gray-600">Need Attention</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { key: 'all', label: 'All Students', count: totalStudents },
            { key: 'active', label: 'Active', count: activeStudents },
            { key: 'needs-attention', label: 'Needs Attention', count: needsAttentionCount }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                filter === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </nav>
      </div>

      {/* Students List */}
      <div className="space-y-4">
        {filteredStudents.map((data) => (
          <div key={data.student.id} className="card">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {data.student.name}
                    </h3>
                    <span className={`status ${
                      getEngagementLevel(data) === 'High' ? 'status-success' :
                      getEngagementLevel(data) === 'Medium' ? 'status-warning' :
                      getEngagementLevel(data) === 'Low' ? 'status-info' : 'text-gray-500'
                    } text-xs`}>
                      {getEngagementLevel(data)} Engagement
                    </span>
                    {data.needsAttention && (
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{data.student.email}</p>
                  
                  <div className="grid grid-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-purple-600" />
                      <span>{data.totalReflections} reflections</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-blue-600" />
                      <span>{data.activeGoals} active goals</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-green-600" />
                      <span>{data.meetings.length} meetings</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-orange-600" />
                      <span>{data.completedGoals} completed</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 text-sm text-gray-500">
                    Last reflection: {formatDaysAgo(data.daysSinceLastReflection)}
                  </div>
                  
                  {data.overdueGoals > 0 && (
                    <div className="mt-2">
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                        {data.overdueGoals} overdue goals
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedStudent(data.student)}
                  className="btn btn-sm btn-secondary"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {filteredStudents.length === 0 && (
          <div className="card text-center py-12">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No students found
            </h3>
            <p className="text-gray-600">
              {filter === 'all' ? 'No students in the system yet' :
               filter === 'active' ? 'No active students found' :
               'No students need attention right now'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Student Detail View Component
const StudentDetailView = ({ studentData, onBack }) => {
  const { student, reflections, goals, meetings } = studentData;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-800 text-sm mb-2"
          >
            ← Back to Student List
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{student.name}</h1>
          <p className="text-gray-600">{student.email}</p>
        </div>
      </div>

      {/* Student Stats */}
      <div className="grid grid-4">
        <div className="card text-center">
          <p className="text-2xl font-bold text-purple-600">{reflections.length}</p>
          <p className="text-sm text-gray-600">Total Reflections</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-blue-600">{goals.length}</p>
          <p className="text-sm text-gray-600">Total Goals</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-green-600">{meetings.length}</p>
          <p className="text-sm text-gray-600">Total Meetings</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-orange-600">
            {goals.filter(g => g.status === 'completed').length}
          </p>
          <p className="text-sm text-gray-600">Completed Goals</p>
        </div>
      </div>

      <div className="grid grid-2">
        {/* Recent Reflections */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Reflections</h2>
          </div>
          <div className="space-y-3">
            {reflections.slice(0, 5).map((reflection, index) => (
              <div key={reflection.id || index} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`status ${reflection.type === 'pre-meeting' ? 'status-info' : 'status-success'} text-xs`}>
                    {reflection.type === 'pre-meeting' ? 'Pre-Meeting' : 'Post-Meeting'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDate(reflection.createdAt?.toDate?.() || reflection.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-gray-700">
                  {reflection.accomplishments || reflection.keyInsights || 'No content available'}
                </p>
                {reflection.challenges && (
                  <p className="text-xs text-gray-500 mt-1">
                    <strong>Challenges:</strong> {reflection.challenges}
                  </p>
                )}
              </div>
            ))}
            {reflections.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No reflections submitted yet</p>
            )}
          </div>
        </div>

        {/* Goals */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Goals</h2>
          </div>
          <div className="space-y-3">
            {goals.slice(0, 5).map((goal, index) => (
              <div key={goal.id || index} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{goal.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                    {goal.targetDate && (
                      <p className="text-xs text-gray-500 mt-1">
                        Due: {formatDate(goal.targetDate)}
                      </p>
                    )}
                  </div>
                  <span className={`status ${
                    goal.status === 'completed' ? 'status-success' :
                    goal.status === 'paused' ? 'text-gray-500' : 'status-info'
                  } text-xs`}>
                    {goal.status || 'active'}
                  </span>
                </div>
                {goal.progress && (
                  <div className="progress mt-2">
                    <div 
                      className="progress-bar" 
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                )}
              </div>
            ))}
            {goals.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No goals set yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentOverview;