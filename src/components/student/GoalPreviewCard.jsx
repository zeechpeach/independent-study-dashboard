import React from 'react';
import { Calendar, AlertTriangle } from 'lucide-react';
import { goalDisplayStatus, isGoalOverdue } from '../../utils/goals';
import { formatDatePacific } from '../../utils/dates';

const GoalPreviewCard = ({ goal, onClick }) => {
  const displayStatus = goalDisplayStatus(goal);
  const isOverdue = isGoalOverdue(goal);

  const handleClick = () => {
    onClick(goal);
  };

  return (
    <div 
      className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:shadow-md hover:border-gray-300 transition-all duration-200 group"
      onClick={handleClick}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-gray-900 truncate flex-1 group-hover:text-blue-600 transition-colors duration-200">
          {goal.title || 'Untitled Goal'}
        </h4>
        <div className="flex items-center gap-2 ml-2">
          {isOverdue && (
            <AlertTriangle className="w-4 h-4 text-red-500" />
          )}
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            displayStatus.variant === 'green' ? 'bg-green-100 text-green-800' :
            displayStatus.variant === 'red' ? 'bg-red-100 text-red-800' :
            displayStatus.variant === 'gray' ? 'bg-gray-100 text-gray-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {displayStatus.label}
          </span>
        </div>
      </div>
      
      {goal.targetDate && (
        <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
          <Calendar className="w-4 h-4" />
          <span>Due {formatDatePacific(goal.targetDate)}</span>
        </div>
      )}
      
      {goal.description && (
        <p className="text-sm text-gray-600 line-clamp-2">
          {goal.description}
        </p>
      )}
    </div>
  );
};

export default GoalPreviewCard;