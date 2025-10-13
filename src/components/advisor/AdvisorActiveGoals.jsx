import React, { useState, useEffect } from 'react';
import { Target, ChevronLeft, User, Calendar, AlertCircle } from 'lucide-react';
import { getStudentsByAdvisor, getUserActionItems } from '../../services/firebase';

/**
 * AdvisorActiveGoals - Displays students and their active goals (action items)
 * Replaces the Review Reflections functionality
 */
const AdvisorActiveGoals = ({ advisorEmail, userProfile, onBack }) => {
  const [studentsWithGoals, setStudentsWithGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStudentsAndGoals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [advisorEmail]);

  const fetchStudentsAndGoals = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get all students assigned to this advisor
      const students = await getStudentsByAdvisor(advisorEmail);

      // For each student, get their active action items (goals)
      const studentsData = await Promise.all(
        students.map(async (student) => {
          try {
            const actionItems = await getUserActionItems(student.id);
            const activeGoals = actionItems.filter(item => !item.completed);
            const overdueGoals = activeGoals.filter(item => {
              if (!item.targetDate) return false;
              const targetDate = item.targetDate?.toDate?.() || new Date(item.targetDate);
              return targetDate < new Date();
            });

            return {
              ...student,
              activeGoals,
              overdueGoals: overdueGoals.length,
              totalGoals: actionItems.length,
              completedGoals: actionItems.filter(item => item.completed).length
            };
          } catch (err) {
            console.error(`Error fetching goals for student ${student.id}:`, err);
            return {
              ...student,
              activeGoals: [],
              overdueGoals: 0,
              totalGoals: 0,
              completedGoals: 0,
              error: true
            };
          }
        })
      );

      // Sort by number of active goals (descending)
      studentsData.sort((a, b) => b.activeGoals.length - a.activeGoals.length);
      setStudentsWithGoals(studentsData);
    } catch (err) {
      console.error('Error fetching students and goals:', err);
      setError('Failed to load student goals');
    } finally {
      setLoading(false);
    }
  };

  const getGoalStatusColor = (goal) => {
    if (goal.completed) return 'bg-green-50 border-green-200 text-green-800';
    if (goal.struggling) return 'bg-orange-50 border-orange-200 text-orange-800';
    
    if (goal.targetDate) {
      const targetDate = goal.targetDate?.toDate?.() || new Date(goal.targetDate);
      if (targetDate < new Date()) {
        return 'bg-red-50 border-red-200 text-red-800';
      }
    }
    
    return 'bg-blue-50 border-blue-200 text-blue-800';
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return 'No deadline';
    const date = dateValue?.toDate?.() || new Date(dateValue);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-6">
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-800 text-sm mb-4 flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <div className="loading-spinner" />
            <span className="text-gray-600">Loading active goals...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white p-6">
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-800 text-sm mb-4 flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchStudentsAndGoals}
            className="mt-4 btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <button
        onClick={onBack}
        className="text-blue-600 hover:text-blue-800 text-sm mb-4 flex items-center gap-1"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Active Goals</h1>
        </div>
        <p className="text-gray-600">
          Review your students' active action items and goals
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card">
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">
              {studentsWithGoals.reduce((sum, s) => sum + s.activeGoals.length, 0)}
            </p>
            <p className="text-sm text-gray-600 mt-1">Total Active Goals</p>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <p className="text-3xl font-bold text-red-600">
              {studentsWithGoals.reduce((sum, s) => sum + s.overdueGoals, 0)}
            </p>
            <p className="text-sm text-gray-600 mt-1">Overdue Goals</p>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">
              {studentsWithGoals.reduce((sum, s) => sum + s.completedGoals, 0)}
            </p>
            <p className="text-sm text-gray-600 mt-1">Completed Goals</p>
          </div>
        </div>
      </div>

      {/* Students List */}
      <div className="space-y-4">
        {studentsWithGoals.length === 0 ? (
          <div className="card text-center py-12">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No students assigned yet</p>
          </div>
        ) : (
          studentsWithGoals.map((student) => (
            <div key={student.id} className="card">
              <div className="border-b border-gray-200 pb-3 mb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-gray-600" />
                    <h3 className="font-semibold text-gray-900">{student.name}</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">
                      {student.activeGoals.length} active
                    </span>
                    {student.overdueGoals > 0 && (
                      <span className="text-sm text-red-600 font-medium">
                        {student.overdueGoals} overdue
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-1">{student.email}</p>
              </div>

              {student.error ? (
                <div className="p-3 bg-red-50 rounded-lg text-sm text-red-600">
                  Error loading goals for this student
                </div>
              ) : student.activeGoals.length === 0 ? (
                <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600 text-center">
                  No active goals
                </div>
              ) : (
                <div className="space-y-2">
                  {student.activeGoals.map((goal) => (
                    <div
                      key={goal.id}
                      className={`p-3 rounded-lg border ${getGoalStatusColor(goal)}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{goal.title}</h4>
                          {goal.description && (
                            <p className="text-xs mt-1 opacity-80">{goal.description}</p>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-xs">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(goal.targetDate)}</span>
                            </div>
                            {goal.category && (
                              <span className="px-2 py-0.5 bg-white bg-opacity-50 rounded">
                                {goal.category}
                              </span>
                            )}
                          </div>
                        </div>
                        {goal.struggling && (
                          <span className="text-xs font-medium px-2 py-1 bg-orange-600 text-white rounded">
                            Need Help
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdvisorActiveGoals;
