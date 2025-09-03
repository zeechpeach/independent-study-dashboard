import React from 'react';
import { AlertTriangle, Clock, Users } from 'lucide-react';

/**
 * NeedsAttentionPanel - Displays students requiring advisor attention
 * 
 * Static placeholder content for Phase 3A structural migration.
 * Future phases will implement actual data integration.
 */
const NeedsAttentionPanel = ({ className = '' }) => {
  // Static placeholder data
  const studentsNeedingAttention = [
    {
      id: '1',
      name: 'Alex Johnson',
      issue: 'No reflection submitted this week',
      priority: 'high',
      daysOverdue: 3
    },
    {
      id: '2', 
      name: 'Morgan Chen',
      issue: 'Missing goal progress updates',
      priority: 'medium',
      daysOverdue: 1
    },
    {
      id: '3',
      name: 'Jordan Smith',
      issue: 'Missed scheduled meeting',
      priority: 'high',
      daysOverdue: 2
    }
  ];

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

  return (
    <div className={`card ${className}`}>
      <div className="card-header">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <h2 className="card-title">Students Needing Attention</h2>
          <span className="ml-auto bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
            {studentsNeedingAttention.length}
          </span>
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
                <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>{student.daysOverdue} day(s) overdue</span>
                </div>
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