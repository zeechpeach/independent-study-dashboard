import React, { useState, useEffect } from 'react';
import { Users, Target, BookOpen, ChevronRight } from 'lucide-react';
import { GridContainer } from '../shared/DashboardGrid';
import { getStudentsByAdvisor, getUserGoals } from '../../services/firebase';

/**
 * AdvisorStudentList - Dynamic student list view for advisor
 * 
 * Phase 3B: Now uses real Firebase data to show students assigned to the advisor
 * with actual goal counts and activity information.
 */
const AdvisorStudentList = ({ onBack, advisorEmail, userProfile, onStudentClick }) => {
  const [studentsWithGoals, setStudentsWithGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get advisor email from userProfile if not provided directly
  const actualAdvisorEmail = advisorEmail || userProfile?.email;

  useEffect(() => {
    const fetchStudentsAndGoals = async () => {
      if (!actualAdvisorEmail) {
        setLoading(false);
        setError('No advisor information available');
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Get all students assigned to this advisor
        const assignedStudents = await getStudentsByAdvisor(actualAdvisorEmail);

        // Get goals for each student
        const studentsWithGoalData = await Promise.all(
          assignedStudents.map(async (student) => {
            try {
              const goals = await getUserGoals(student.id);
              const activeGoals = goals.filter(goal => goal.status !== 'completed');
              const completedGoals = goals.filter(goal => goal.status === 'completed');
              
              // Calculate days since last activity (simplified)
              const lastActivityDate = goals.length > 0 
                ? Math.max(...goals.map(g => g.updatedAt?.toDate?.() || new Date(g.updatedAt || g.createdAt)))
                : student.createdAt?.toDate?.() || new Date(student.createdAt);
              
              const daysSinceActivity = Math.floor(
                (new Date() - new Date(lastActivityDate)) / (1000 * 60 * 60 * 24)
              );

              // Determine if student needs attention
              const needsAttention = daysSinceActivity > 7 || activeGoals.some(goal => {
                const targetDate = goal.targetDate?.toDate?.() || new Date(goal.targetDate);
                return targetDate < new Date() && goal.status !== 'completed';
              });

              return {
                ...student,
                activeGoals: activeGoals.length,
                completedGoals: completedGoals.length,
                lastActivity: daysSinceActivity === 0 ? 'Today' : 
                              daysSinceActivity === 1 ? '1 day ago' : 
                              daysSinceActivity < 7 ? `${daysSinceActivity} days ago` :
                              `${Math.floor(daysSinceActivity / 7)} week${Math.floor(daysSinceActivity / 7) > 1 ? 's' : ''} ago`,
                needsAttention
              };
            } catch (err) {
              console.error(`Error fetching goals for student ${student.id}:`, err);
              return {
                ...student,
                activeGoals: 0,
                completedGoals: 0,
                lastActivity: 'Unknown',
                needsAttention: false
              };
            }
          })
        );

        setStudentsWithGoals(studentsWithGoalData);
      } catch (err) {
        console.error('Error fetching students:', err);
        setError('Failed to load student data');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentsAndGoals();
  }, [actualAdvisorEmail]);

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
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
        <div className="flex items-center justify-center py-12">
          <div className="loading-spinner w-8 h-8" />
          <span className="ml-3 text-gray-600">Loading students...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 sm:space-y-6">
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
        <div className="card">
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto mb-4 text-red-400" />
            <p className="text-red-600 font-medium">{error}</p>
            <p className="text-gray-500 text-sm mt-2">Please try refreshing the page</p>
          </div>
        </div>
      </div>
    );
  }

  const totalStudents = studentsWithGoals.length;
  const studentsNeedingAttention = studentsWithGoals.filter(s => s.needsAttention).length;
  const totalActiveGoals = studentsWithGoals.reduce((sum, s) => sum + s.activeGoals, 0);

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
            {totalStudents} student{totalStudents !== 1 ? 's' : ''}
          </span>
        </div>

        {totalStudents === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-base font-medium mb-2">No students assigned yet</p>
            <p className="text-sm">Students will appear here when they select you as their advisor during onboarding.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {studentsWithGoals.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => onStudentClick && onStudentClick(student)}
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
                    {student.pathway && (
                      <p className="text-xs sm:text-sm text-gray-500 truncate">{student.pathway}</p>
                    )}
                    <div className="flex items-center gap-3 sm:gap-4 text-xs text-gray-500 mt-1">
                      <span>{student.activeGoals} active goal{student.activeGoals !== 1 ? 's' : ''}</span>
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
        )}

        {/* Future Features Note */}
        {totalStudents > 0 && onStudentClick && (
          <div className="mt-6 p-3 sm:p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-sm font-medium text-blue-900">Interactive Features</p>
                <p className="text-xs sm:text-sm text-blue-700 mt-1">
                  Click on students to view detailed progress, provide feedback, and track goal completion.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvisorStudentList;