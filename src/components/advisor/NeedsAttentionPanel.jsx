import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, Users } from 'lucide-react';
import { getStudentsNeedingAttention } from '../../services/firebase';

/**
 * NeedsAttentionPanel - Displays students requiring advisor attention
 * 
 * Phase 3B: Now uses dynamic data from Firebase to show real students
 * who need attention based on missing reflections, overdue goals, etc.
 */
const NeedsAttentionPanel = ({ className = '', advisorEmail, userProfile }) => {
  const [studentsNeedingAttention, setStudentsNeedingAttention] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get advisor email from userProfile if not provided directly
  const actualAdvisorEmail = advisorEmail || userProfile?.email;

  useEffect(() => {
    const fetchStudentsNeedingAttention = async () => {
      if (!actualAdvisorEmail) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const students = await getStudentsNeedingAttention(actualAdvisorEmail);
        
        // Transform the data to match the expected format
        const transformedStudents = students.map(student => ({
          id: student.id,
          name: student.name,
          issue: student.attentionReasons.join(', '),
          priority: determinePriority(student),
          daysOverdue: student.daysSinceLastReflection || 0,
          rawReasons: student.attentionReasons,
          overdueGoals: student.overdueGoals
        }));
        
        setStudentsNeedingAttention(transformedStudents);
      } catch (err) {
        console.error('Error fetching students needing attention:', err);
        setError('Failed to load student data');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentsNeedingAttention();
  }, [actualAdvisorEmail]);

  const determinePriority = (student) => {
    // High priority: multiple issues or >7 days since reflection
    if (student.attentionReasons.length > 1 || student.daysSinceLastReflection > 7) {
      return 'high';
    }
    // Medium priority: overdue goals or 3-7 days since reflection
    if (student.overdueGoals > 0 || student.daysSinceLastReflection > 3) {
      return 'medium';
    }
    // Low priority: other issues
    return 'low';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className={`card ${className}`}>
        <div className="card-header">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h2 className="card-title">Students Needing Attention</h2>
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="loading-spinner w-6 h-6" />
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`card ${className}`}>
        <div className="card-header">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h2 className="card-title">Students Needing Attention</h2>
          </div>
        </div>
        <div className="text-center py-8">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-400" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`card ${className}`}>
      <div className="card-header">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <h2 className="card-title">Students Needing Attention</h2>
          {studentsNeedingAttention.length > 0 && (
            <span className="ml-auto bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
              {studentsNeedingAttention.length}
            </span>
          )}
        </div>
      </div>
      
      <div className="space-y-3">
        {studentsNeedingAttention.map((student) => (
          <div 
            key={student.id}
            className={`p-3 rounded-lg border ${getPriorityColor(student.priority)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-sm">{student.name}</h3>
                  <span className="text-xs font-medium uppercase px-1.5 py-0.5 rounded">
                    {student.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{student.issue}</p>
                {student.daysOverdue > 0 && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{student.daysOverdue} day(s) since last reflection</span>
                  </div>
                )}
              </div>
              <button className="text-xs bg-white text-gray-700 border border-gray-300 px-2 py-1 rounded hover:bg-gray-50">
                View
              </button>
            </div>
          </div>
        ))}
        
        {studentsNeedingAttention.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">All students are up to date!</p>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <button className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium">
          View All Student Issues
        </button>
      </div>
    </div>
  );
};

export default NeedsAttentionPanel;