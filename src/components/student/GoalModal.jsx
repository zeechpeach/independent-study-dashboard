import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { Calendar, Edit3, Trash2 } from 'lucide-react';
import { goalDisplayStatus, getStatusClasses } from '../../utils/goals';
import { formatDatePacific } from '../../utils/dates';

const GoalModal = ({ 
  goal, 
  isOpen, 
  onClose, 
  onEdit, 
  onDelete,
  formatDate 
}) => {
  if (!goal) return null;

  const displayStatus = goalDisplayStatus(goal);

  const handleEdit = () => {
    onEdit(goal);
    onClose();
  };

  const handleDelete = () => {
    onDelete(goal.id);
    onClose();
  };

  const formatDateDisplay = (dateString) => {
    if (!dateString) return 'No deadline set';
    if (formatDate) return formatDate(dateString);
    return formatDatePacific(dateString, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={goal.title}
      size="md"
    >
      <div className="space-y-4">
        {/* Status */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Status:</span>
          <span className={getStatusClasses(displayStatus.variant)}>
            {displayStatus.label}
          </span>
        </div>

        {/* Description */}
        {goal.description && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
            <p className="text-gray-600">{goal.description}</p>
          </div>
        )}

        {/* Target Date */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Target Date</h4>
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            {formatDateDisplay(goal.targetDate)}
          </div>
        </div>

        {/* Category */}
        {goal.category && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Category</h4>
            <Badge variant="gray">{goal.category}</Badge>
          </div>
        )}

        {/* Success Metrics */}
        {goal.successMetrics && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Success Metrics</h4>
            <p className="text-gray-600">{goal.successMetrics}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={handleEdit}
            className="flex items-center gap-2"
          >
            <Edit3 className="w-4 h-4" />
            Edit Goal
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDelete}
            className="flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete Goal
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default GoalModal;