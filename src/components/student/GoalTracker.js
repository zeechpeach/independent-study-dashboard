import React, { useState, useEffect } from 'react';
import { Target, Plus } from 'lucide-react';
import { GOAL_STATUS, isGoalOverdue, goalDisplayStatus } from '../../utils/goals';
import { isValidTargetDate } from '../../utils/dates';
import GoalCard from './GoalCard';
import GoalModal from './GoalModal';

const GoalTracker = ({ 
  user, 
  goals = [], 
  onCreateGoal, 
  onUpdateGoal, 
  onDeleteGoal,
  onBack 
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [filter, setFilter] = useState('all'); // all, active, completed, overdue
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [showGoalModal, setShowGoalModal] = useState(false);

  const openForm = (goal = null) => {
    setEditingGoal(goal);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingGoal(null);
  };

  const openGoalModal = (goal) => {
    setSelectedGoal(goal);
    setShowGoalModal(true);
  };

  const closeGoalModal = () => {
    setSelectedGoal(null);
    setShowGoalModal(false);
  };

  const getGoalsByStatus = () => {
    return goals.map(goal => {
      const status = goal.status || GOAL_STATUS.ACTIVE;
      const displayStatus = goalDisplayStatus(goal);
      
      return { 
        ...goal, 
        computedStatus: isGoalOverdue(goal) ? 'overdue' : status,
        displayStatus
      };
    });
  };

  const getFilteredGoals = () => {
    const goalsWithStatus = getGoalsByStatus();
    
    switch (filter) {
      case 'active':
        return goalsWithStatus.filter(g => g.computedStatus === GOAL_STATUS.ACTIVE);
      case 'completed':
        return goalsWithStatus.filter(g => g.computedStatus === GOAL_STATUS.COMPLETED);
      case 'overdue':
        return goalsWithStatus.filter(g => g.computedStatus === 'overdue');
      case 'not_started':
        return goalsWithStatus.filter(g => g.computedStatus === GOAL_STATUS.NOT_STARTED);
      default:
        return goalsWithStatus;
    }
  };





  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredGoals = getFilteredGoals();
  const goalCounts = {
    all: goals.length,
    active: getGoalsByStatus().filter(g => g.computedStatus === GOAL_STATUS.ACTIVE).length,
    completed: getGoalsByStatus().filter(g => g.computedStatus === GOAL_STATUS.COMPLETED).length,
    overdue: getGoalsByStatus().filter(g => g.computedStatus === 'overdue').length,
    not_started: getGoalsByStatus().filter(g => g.computedStatus === GOAL_STATUS.NOT_STARTED).length
  };

  if (showForm) {
    return (
      <GoalForm
        goal={editingGoal}
        onSave={async (goalData) => {
          if (editingGoal) {
            await onUpdateGoal(editingGoal.id, goalData);
          } else {
            await onCreateGoal(goalData);
          }
          closeForm();
        }}
        onCancel={closeForm}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 mb-6 border border-green-200 shadow-sm">
        <div>
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-800 text-sm mb-3 flex items-center gap-1 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Target className="w-8 h-8 text-green-600" />
            </div>
            Goal Tracker
          </h1>
          <p className="text-gray-600 mt-2">Manage your learning objectives and track your progress</p>
        </div>
        <button
          onClick={() => openForm()}
          className="btn btn-primary btn-lg shadow-lg hover:shadow-xl transition-shadow flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create New Goal
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 mb-6">
        <nav className="flex space-x-1">
          {[
            { key: 'all', label: 'All Goals', count: goalCounts.all },
            { key: 'active', label: 'Active', count: goalCounts.active },
            { key: 'completed', label: 'Completed', count: goalCounts.completed },
            { key: 'overdue', label: 'Overdue', count: goalCounts.overdue },
            { key: 'not_started', label: 'Not Started', count: goalCounts.not_started }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 ${
                filter === tab.key
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                  filter === tab.key
                    ? 'bg-blue-400 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {filteredGoals.length === 0 ? (
          <div className="card text-center py-12">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'all' ? 'No goals yet' : `No ${filter} goals`}
            </h3>
            <p className="text-gray-600 mb-4">
              {filter === 'all' 
                ? 'Create your first goal to start tracking your learning progress'
                : `You don't have any ${filter} goals at the moment`
              }
            </p>
            {filter === 'all' && (
              <button
                onClick={() => openForm()}
                className="btn btn-primary"
              >
                <Plus className="w-4 h-4" />
                Create Your First Goal
              </button>
            )}
          </div>
        ) : (
          filteredGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onClick={openGoalModal}
              onEdit={openForm}
              onDelete={onDeleteGoal}
              formatDate={formatDate}
            />
          ))
        )}
      </div>

      {/* Goal Modal */}
      <GoalModal
        goal={selectedGoal}
        isOpen={showGoalModal}
        onClose={closeGoalModal}
        onEdit={openForm}
        onDelete={onDeleteGoal}
        formatDate={formatDate}
      />
    </div>
  );
};

const GoalForm = ({ goal, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    targetDate: '',
    successMetrics: '',
    status: GOAL_STATUS.ACTIVE
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (goal) {
      setFormData({
        title: goal.title || '',
        description: goal.description || '',
        category: goal.category || '',
        targetDate: goal.targetDate ? goal.targetDate.split('T')[0] : '',
        successMetrics: goal.successMetrics || '',
        status: goal.status || GOAL_STATUS.ACTIVE
      });
    }
  }, [goal]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Goal title is required';
    }
    
    if (formData.targetDate && !isValidTargetDate(formData.targetDate)) {
      newErrors.targetDate = 'Target date cannot be in the past (Pacific time)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSave({
        ...formData,
        targetDate: formData.targetDate ? new Date(formData.targetDate).toISOString() : null
      });
    } catch (error) {
      console.error('Error saving goal:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            {goal ? 'Edit Goal' : 'Create New Goal'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Set a specific, measurable learning objective
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-group">
            <label className="form-label required">Goal Title</label>
            <input
              type="text"
              className={`form-input ${errors.title ? 'border-red-300' : ''}`}
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., Complete React tutorial series"
            />
            {errors.title && <p className="form-error">{errors.title}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Provide more details about this goal..."
              rows={3}
            />
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
              >
                <option value="">Select category</option>
                <option value="technical">Technical Skills</option>
                <option value="research">Research</option>
                <option value="project">Project Work</option>
                <option value="presentation">Presentation</option>
                <option value="writing">Writing</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Target Date</label>
              <input
                type="date"
                className={`form-input ${errors.targetDate ? 'border-red-300' : ''}`}
                value={formData.targetDate}
                onChange={(e) => handleInputChange('targetDate', e.target.value)}
              />
              {errors.targetDate && <p className="form-error">{errors.targetDate}</p>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Success Metrics</label>
            <textarea
              className="form-textarea"
              value={formData.successMetrics}
              onChange={(e) => handleInputChange('successMetrics', e.target.value)}
              placeholder="How will you know you've achieved this goal? What does success look like?"
              rows={2}
            />
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
              >
                <option value={GOAL_STATUS.NOT_STARTED}>Not Started</option>
                <option value={GOAL_STATUS.ACTIVE}>Active</option>
                <option value={GOAL_STATUS.COMPLETED}>Completed</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? (
                <div className="loading-spinner"></div>
              ) : (
                <>
                  <Target className="w-4 h-4" />
                  {goal ? 'Update Goal' : 'Create Goal'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoalTracker;