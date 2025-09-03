import React, { useState } from 'react';
import { Calendar, Plus, Edit3, Trash2, Save, X } from 'lucide-react';

const ImportantDatesManager = ({ 
  importantDates, 
  onBack, 
  onCreateDate, 
  onUpdateDate, 
  onDeleteDate,
  mode = 'admin', // 'admin' or 'advisor'
  currentUserId = null 
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingDate, setEditingDate] = useState(null);
  const [filter, setFilter] = useState('all'); // all, upcoming, past

  const openForm = (date = null) => {
    setEditingDate(date);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingDate(null);
  };

  const getFilteredDates = () => {
    const now = new Date();
    
    let filtered = importantDates;
    
    // Filter by advisor scope if in advisor mode
    if (mode === 'advisor' && currentUserId) {
      filtered = importantDates.filter(date => 
        date.advisorId === currentUserId || date.advisorId === null
      );
    }
    
    // Filter by time
    switch (filter) {
      case 'upcoming':
        return filtered.filter(date => new Date(date.date) >= now);
      case 'past':
        return filtered.filter(date => new Date(date.date) < now);
      default:
        return filtered;
    }
  };

  const getDaysUntil = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `${Math.abs(diffDays)} days ago`;
    } else if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Tomorrow';
    } else {
      return `In ${diffDays} days`;
    }
  };

  const filteredDates = getFilteredDates();

  if (showForm) {
    return (
      <ImportantDateForm
        date={editingDate}
        onSave={editingDate ? onUpdateDate : onCreateDate}
        onCancel={closeForm}
        mode={mode}
        currentUserId={currentUserId}
      />
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack}
              className="text-gray-500 hover:text-gray-700"
            >
              ←
            </button>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {mode === 'admin' ? 'All Important Dates' : 'My Important Dates'}
            </h2>
          </div>
          <button
            onClick={() => openForm()}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Date
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded ${
              filter === 'all' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All ({importantDates.length})
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-3 py-1 rounded ${
              filter === 'upcoming' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('past')}
            className={`px-3 py-1 rounded ${
              filter === 'past' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Past
          </button>
        </div>
      </div>

      <div className="p-6">
        {filteredDates.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No important dates found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDates.map((date) => (
              <div key={date.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-800">{date.title}</h3>
                      <span className="text-sm text-gray-500">
                        {new Date(date.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                      {mode === 'admin' && (
                        <span className={`text-xs px-2 py-1 rounded ${
                          date.advisorId 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {date.advisorId ? 'Advisor-specific' : 'Global'}
                        </span>
                      )}
                    </div>
                    
                    <div className="text-sm text-blue-600 font-medium mb-2">
                      {getDaysUntil(date.date)}
                    </div>
                    
                    {date.description && (
                      <p className="text-sm text-gray-700 mb-2">{date.description}</p>
                    )}
                    
                    {date.location && (
                      <p className="text-xs text-gray-500">
                        <strong>Location:</strong> {date.location}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {(mode === 'admin' || date.advisorId === currentUserId || date.advisorId === null) && (
                      <>
                        <button
                          onClick={() => openForm(date)}
                          className="text-gray-500 hover:text-gray-700 p-1"
                          title="Edit date"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteDate(date.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Delete date"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ImportantDateForm = ({ date, onSave, onCancel, mode, currentUserId }) => {
  const [formData, setFormData] = useState({
    title: date?.title || '',
    description: date?.description || '',
    date: date?.date || '',
    location: date?.location || '',
    advisorId: date?.advisorId || (mode === 'advisor' ? currentUserId : null)
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (date) {
        await onSave(date.id, formData);
      } else {
        await onSave(formData);
      }
      onCancel();
    } catch (error) {
      console.error('Error saving date:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          {date ? 'Edit Important Date' : 'Create Important Date'}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Event title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date *
          </label>
          <input
            type="date"
            required
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
            placeholder="Event description (optional)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            placeholder="Physical or virtual location (optional)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {mode === 'admin' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Scope
            </label>
            <select
              value={formData.advisorId || 'global'}
              onChange={(e) => handleInputChange('advisorId', e.target.value === 'global' ? null : e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="global">Global (visible to all students)</option>
              <option value={currentUserId}>Advisor-specific</option>
            </select>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
          >
            <X className="w-4 h-4" />
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
                <Save className="w-4 h-4" />
                {date ? 'Update Date' : 'Create Date'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ImportantDatesManager;