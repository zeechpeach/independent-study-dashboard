import React, { useState } from 'react';
import { Plus, CheckCircle, Circle, AlertCircle, Trash2 } from 'lucide-react';

/**
 * ActionPlan - Simple checklist component to replace reflections and goals
 * Students can add to-do items, mark them as complete or struggling
 */
const ActionPlan = ({ 
  user, 
  actionItems = [], 
  onCreateItem, 
  onUpdateItem, 
  onDeleteItem,
  onBack 
}) => {
  const [showForm, setShowForm] = useState(false);
  const [newItemText, setNewItemText] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, completed, struggling

  const handleCreateItem = async (e) => {
    e.preventDefault();
    if (!newItemText.trim()) return;

    await onCreateItem({
      text: newItemText.trim(),
      completed: false,
      struggling: false
    });

    setNewItemText('');
    setShowForm(false);
  };

  const handleToggleComplete = async (item) => {
    await onUpdateItem(item.id, {
      ...item,
      completed: !item.completed,
      completedAt: !item.completed ? new Date().toISOString() : null
    });
  };

  const handleToggleStruggling = async (item) => {
    await onUpdateItem(item.id, {
      ...item,
      struggling: !item.struggling
    });
  };

  const getFilteredItems = () => {
    switch (filter) {
      case 'active':
        return actionItems.filter(item => !item.completed);
      case 'completed':
        return actionItems.filter(item => item.completed);
      case 'struggling':
        return actionItems.filter(item => item.struggling && !item.completed);
      default:
        return actionItems;
    }
  };

  const filteredItems = getFilteredItems();
  const itemCounts = {
    all: actionItems.length,
    active: actionItems.filter(item => !item.completed).length,
    completed: actionItems.filter(item => item.completed).length,
    struggling: actionItems.filter(item => item.struggling && !item.completed).length
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-800 text-sm mb-2"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Action Plan</h1>
          <p className="text-gray-600">Track your tasks and goals for the program</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card text-center">
          <p className="text-2xl font-bold text-gray-900">{itemCounts.all}</p>
          <p className="text-sm text-gray-600">Total Items</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-blue-600">{itemCounts.active}</p>
          <p className="text-sm text-gray-600">Active</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-green-600">{itemCounts.completed}</p>
          <p className="text-sm text-gray-600">Completed</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-orange-600">{itemCounts.struggling}</p>
          <p className="text-sm text-gray-600">Need Help</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {[
          { key: 'all', label: 'All', count: itemCounts.all },
          { key: 'active', label: 'Active', count: itemCounts.active },
          { key: 'completed', label: 'Completed', count: itemCounts.completed },
          { key: 'struggling', label: 'Need Help', count: itemCounts.struggling }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              filter === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
            <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-gray-100">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* New Item Form */}
      {showForm && (
        <div className="card">
          <form onSubmit={handleCreateItem} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What do you want to accomplish?
              </label>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                placeholder="Describe your goal or task..."
                autoFocus
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setNewItemText('');
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                disabled={!newItemText.trim()}
              >
                Add Item
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Action Items List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-500">
              {filter === 'all' 
                ? 'No action items yet. Click "Add Item" to get started!'
                : `No ${filter} items`}
            </p>
          </div>
        ) : (
          filteredItems.map(item => (
            <ActionItem
              key={item.id}
              item={item}
              onToggleComplete={handleToggleComplete}
              onToggleStruggling={handleToggleStruggling}
              onDelete={onDeleteItem}
            />
          ))
        )}
      </div>

      {/* Accomplishments Section */}
      {itemCounts.completed > 0 && filter !== 'completed' && (
        <div className="card bg-green-50 border-green-200">
          <h3 className="font-semibold text-green-900 mb-2">🎉 Recent Accomplishments</h3>
          <div className="space-y-2">
            {actionItems
              .filter(item => item.completed)
              .slice(0, 3)
              .map(item => (
                <div key={item.id} className="flex items-center gap-2 text-sm text-green-800">
                  <CheckCircle className="w-4 h-4" />
                  <span>{item.text}</span>
                </div>
              ))}
          </div>
          {itemCounts.completed > 3 && (
            <button
              onClick={() => setFilter('completed')}
              className="text-sm text-green-700 hover:text-green-900 mt-2"
            >
              View all {itemCounts.completed} accomplishments →
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// Individual action item component
const ActionItem = ({ item, onToggleComplete, onToggleStruggling, onDelete }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = () => {
    onDelete(item.id);
    setShowDeleteConfirm(false);
  };

  return (
    <div className={`card ${item.completed ? 'bg-gray-50 opacity-75' : ''} ${item.struggling ? 'border-orange-300 bg-orange-50' : ''}`}>
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => onToggleComplete(item)}
          className="mt-1 flex-shrink-0"
        >
          {item.completed ? (
            <CheckCircle className="w-6 h-6 text-green-600" />
          ) : (
            <Circle className="w-6 h-6 text-gray-400 hover:text-gray-600" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`text-gray-900 ${item.completed ? 'line-through text-gray-500' : ''}`}>
            {item.text}
          </p>
          {item.completedAt && (
            <p className="text-xs text-gray-500 mt-1">
              Completed {new Date(item.completedAt).toLocaleDateString()}
            </p>
          )}
          {item.createdAt && !item.completed && (
            <p className="text-xs text-gray-500 mt-1">
              Added {new Date(item.createdAt.toDate ? item.createdAt.toDate() : item.createdAt).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Actions */}
        {!item.completed && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleStruggling(item)}
              className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${
                item.struggling
                  ? 'bg-orange-600 text-white hover:bg-orange-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              title={item.struggling ? 'Remove help request' : 'Request help with this item'}
            >
              <AlertCircle className="w-3 h-3" />
              {item.struggling ? 'Help Requested' : 'Need Help'}
            </button>
          </div>
        )}

        {/* Delete */}
        {showDeleteConfirm ? (
          <div className="flex gap-1">
            <button
              onClick={handleDelete}
              className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
            >
              Confirm
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="text-gray-400 hover:text-red-600"
            title="Delete item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ActionPlan;
