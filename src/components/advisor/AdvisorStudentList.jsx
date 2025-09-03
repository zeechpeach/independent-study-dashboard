import React from 'react';
import { Users, Target, BookOpen, ChevronRight } from 'lucide-react';
import { GridContainer } from '../shared/DashboardGrid';

/**
 * AdvisorStudentList - Placeholder component for advisor student list view
 * 
 * This is scaffolding for the future advisor goal feedback workflow.
 * Currently shows static placeholder data for assigned students with
 * goal counts and basic information.
 * 
 * Feature-flagged behind `advisorStudentListPreview` flag.
 */
const AdvisorStudentList = ({ onBack }) => {
  // Static placeholder data for assigned students
  const placeholderStudents = [
    {
      id: 1,
      name: 'Alex Chen',
      email: 'alex.chen@email.com',
      pathway: 'Computer Science',
      activeGoals: 3,
      completedGoals: 2,
      lastActivity: '2 days ago',
      needsAttention: false
    },
    {
      id: 2,
      name: 'Maria Rodriguez',
      email: 'maria.rodriguez@email.com',
      pathway: 'Data Science',
      activeGoals: 2,
      completedGoals: 4,
      lastActivity: '1 day ago',
      needsAttention: false
    },
    {
      id: 3,
      name: 'Jordan Smith',
      email: 'jordan.smith@email.com',
      pathway: 'Business Administration',
      activeGoals: 1,
      completedGoals: 1,
      lastActivity: '5 days ago',
      needsAttention: true
    },
    {
      id: 4,
      name: 'Sam Taylor',
      email: 'sam.taylor@email.com',
      pathway: 'Psychology',
      activeGoals: 4,
      completedGoals: 3,
      lastActivity: '1 day ago',
      needsAttention: false
    }
  ];

  const totalStudents = placeholderStudents.length;
  const studentsNeedingAttention = placeholderStudents.filter(s => s.needsAttention).length;
  const totalActiveGoals = placeholderStudents.reduce((sum, s) => sum + s.activeGoals, 0);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-800 text-sm mb-2"
          >
            ← Back to Advisor Dashboard
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Students</h1>
          <p className="text-gray-600">Monitor and support your assigned students</p>
        </div>
      </div>

      {/* Stats Overview */}
      <GridContainer cols={3} gap={4}>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{totalStudents}</p>
            </div>
            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Need Attention</p>
              <p className="text-xl sm:text-2xl font-bold text-red-600">{studentsNeedingAttention}</p>
            </div>
            <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Goals</p>
              <p className="text-xl sm:text-2xl font-bold text-green-600">{totalActiveGoals}</p>
            </div>
            <Target className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
          </div>
        </div>
      </GridContainer>

      {/* Student List */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Assigned Students</h2>
          <span className="text-xs sm:text-sm text-gray-500">
            {totalStudents} students
          </span>
        </div>

        <div className="space-y-3">
          {placeholderStudents.map((student) => (
            <div
              key={student.id}
              className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Student Avatar */}
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs sm:text-sm font-semibold text-blue-700">
                    {student.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>

                {/* Student Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-medium text-gray-900 truncate">
                      {student.name}
                    </h3>
                    {student.needsAttention && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 flex-shrink-0">
                        Attention
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">{student.pathway}</p>
                  <div className="flex items-center gap-3 sm:gap-4 text-xs text-gray-500 mt-1">
                    <span>{student.activeGoals} active goals</span>
                    <span>•</span>
                    <span>{student.completedGoals} completed</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline">Last activity: {student.lastActivity}</span>
                  </div>
                </div>
              </div>

              {/* Action Indicator */}
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
            </div>
          ))}
        </div>

        {/* Future Features Note */}
        <div className="mt-6 p-3 sm:p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="text-sm font-medium text-blue-900">Coming Soon</p>
              <p className="text-xs sm:text-sm text-blue-700 mt-1">
                Student goal drill-down, feedback submission, and progress tracking features will be available in future updates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvisorStudentList;