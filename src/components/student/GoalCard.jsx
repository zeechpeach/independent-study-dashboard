import React from 'react';
import { Calendar } from 'lucide-react';
import { goalDisplayStatus, getStatusClasses } from '../../utils/goals';
import { formatDatePacific } from '../../utils/dates';

const GoalCard = ({ 
  goal, 
  onClick, 
  formatDate 
}) => {
  const displayStatus = goalDisplayStatus(goal);

  const handleCardClick = (e) => {
    onClick(goal);
  };



  return (
    <div 
      className="card cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {goal.title}
            </h3>
            <span className={getStatusClasses(displayStatus.variant)}>
              {displayStatus.label}
            </span>
          </div>
          
          {goal.description && (
            <p className="text-gray-600 mb-3">{goal.description}</p>
          )}
          
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate ? formatDate(goal.targetDate) : formatDatePacific(goal.targetDate)}
            </div>
            {goal.category && (
              <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                {goal.category}
              </span>
            )}
          </div>
          
          {goal.successMetrics && (
            <div className="text-sm">
              <span className="font-medium text-gray-700">Success metrics: </span>
              <span className="text-gray-600">{goal.successMetrics}</span>
            </div>
          )}
        </div>
        

      </div>
    </div>
  );
};

export default GoalCard;