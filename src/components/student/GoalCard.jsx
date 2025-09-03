import React from 'react';
import { Calendar, Edit3, Trash2 } from 'lucide-react';
import { goalDisplayStatus, getStatusClasses } from '../../utils/goals';
import { formatDatePacific } from '../../utils/dates';

const GoalCard = ({ 
  goal, 
  onClick, 
  onEdit, 
  onDelete,
  formatDate 
}) => {
  const displayStatus = goalDisplayStatus(goal);

  const handleCardClick = (e) => {
    // Don't trigger modal if clicking on action buttons
    if (e.target.closest('.goal-actions')) {
      return;
    }
    onClick(goal);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(goal);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(goal.id);
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
        
        <div className="goal-actions flex gap-2">
          <button
            onClick={handleEdit}
            className="text-gray-500 hover:text-gray-700 p-1"
            title="Edit goal"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700 p-1"
            title="Delete goal"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoalCard;