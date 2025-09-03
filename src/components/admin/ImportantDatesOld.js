import React, { useState, useEffect } from 'react';
import ImportantDatesManager from '../dates/ImportantDatesManager';
import { 
  createImportantDate, 
  updateImportantDate, 
  deleteImportantDate, 
  getAllImportantDates 
} from '../../services/firebase';

const ImportantDates = ({ user, onBack }) => {
  const [importantDates, setImportantDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchImportantDates();
  }, []);

  const fetchImportantDates = async () => {
    try {
      setLoading(true);
      setError(null);
      const dates = await getAllImportantDates();
      setImportantDates(dates);
    } catch (err) {
      console.error('Error fetching important dates:', err);
      setError('Failed to load important dates');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDate = async (dateData) => {
    try {
      // Admin can create global or advisor-specific dates
      const advisorId = dateData.advisorId === 'global' ? null : dateData.advisorId;
      await createImportantDate(dateData, advisorId);
      await fetchImportantDates();
    } catch (error) {
      console.error('Error creating important date:', error);
      throw error;
    }
  };

  const handleUpdateDate = async (dateId, updates) => {
    try {
      await updateImportantDate(dateId, updates);
      await fetchImportantDates();
    } catch (error) {
      console.error('Error updating important date:', error);
      throw error;
    }
  };

  const handleDeleteDate = async (dateId) => {
    if (window.confirm('Are you sure you want to delete this important date?')) {
      try {
        await deleteImportantDate(dateId);
        await fetchImportantDates();
      } catch (error) {
        console.error('Error deleting important date:', error);
        alert('Failed to delete important date. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">{error}</p>
        <button 
          onClick={fetchImportantDates}
          className="mt-2 btn btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <ImportantDatesManager
      importantDates={importantDates}
      onBack={onBack}
      onCreateDate={handleCreateDate}
      onUpdateDate={handleUpdateDate}
      onDeleteDate={handleDeleteDate}
      mode="admin"
      currentUserId={user?.id}
    />
  );
};

export default ImportantDates;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysUntil = (dateString) => {
    const targetDate = new Date(dateString);
    const today = new Date();
    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `${diffDays} days away`;
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'deadline': return 'status-danger';
      case 'competition': return 'status-warning';
      case 'event': return 'status-info';
      case 'meeting': return 'status-success';
      default: return 'status-info';
    }
  };

  if (showForm) {
    return (
      <DateForm
        date={editingDate}
        onSave={async (dateData) => {
          if (editingDate) {
            await onUpdateDate(editingDate.id, dateData);
          } else {
            await onCreateDate(dateData);
          }
          closeForm();
        }}
        onCancel={closeForm}
      />
    );
  }

  const filteredDates = getFilteredDates();
  const upcomingCount = importantDates.filter(date => new Date(date.date) >= new Date()).length;
  const pastCount = importantDates.filter(date => new Date(date.date) < new Date()).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-800 text-sm mb-2"
          >
            ← Back to Admin Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Important Dates</h1>
          <p className="text-gray-600">Manage system-wide deadlines, events, and competitions</p>
        </div>
        <button
          onClick={() => openForm()}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4" />
          Add Date
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { key: 'all', label: 'All Dates', count: importantDates.length },
            { key: 'upcoming', label: 'Upcoming', count: upcomingCount },
            { key: 'past', label: 'Past', count: pastCount }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                filter === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </nav>
      </div>

      {/* Dates List */}
      <div className="space-y-4">
        {filteredDates.length === 0 ? (
          <div className="card text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'all' ? 'No important dates yet' : `No ${filter} dates`}
            </h3>
            <p className="text-gray-600 mb-4">
              Add deadlines, competitions, and events for students to see
            </p>
            {filter === 'all' && (
              <button
                onClick={() => openForm()}
                className="btn btn-primary"
              >
                <Plus className="w-4 h-4" />
                Add Your First Date
              </button>
            )}
          </div>
        ) : (
          filteredDates
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .map((date) => (
              <div key={date.id} className="card">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {date.title}
                        </h3>
                        <span className={`status ${getTypeColor(date.type)} text-xs`}>
                          {date.type || 'event'}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">{formatDate(date.date)}</p>
                      
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
                  </div>
                  
                  <div className="flex gap-2">
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
                  </div>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
};

const DateForm = ({ date, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    type: 'event',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  React.useEffect(() => {
    if (date) {
      setFormData({
        title: date.title || '',
        description: date.description || '',
        date: date.date ? date.date.split('T')[0] : '',
        type: date.type || 'event',
        location: date.location || ''
      });
    }
  }, [date]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
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
        date: new Date(formData.date).toISOString()
      });
    } catch (error) {
      console.error('Error saving date:', error);
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
            {date ? 'Edit Important Date' : 'Add Important Date'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Create a deadline, event, or competition for all students to see
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-group">
            <label className="form-label required">Title</label>
            <input
              type="text"
              className={`form-input ${errors.title ? 'border-red-300' : ''}`}
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., Science Fair Registration Deadline"
            />
            {errors.title && <p className="form-error">{errors.title}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Additional details about this date..."
              rows={3}
            />
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label required">Date</label>
              <input
                type="date"
                className={`form-input ${errors.date ? 'border-red-300' : ''}`}
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
              />
              {errors.date && <p className="form-error">{errors.date}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Type</label>
              <select
                className="form-select"
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
              >
                <option value="event">Event</option>
                <option value="deadline">Deadline</option>
                <option value="competition">Competition</option>
                <option value="meeting">Meeting</option>
                <option value="presentation">Presentation</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Location</label>
            <input
              type="text"
              className="form-input"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="Physical or virtual location (optional)"
            />
          </div>

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
    </div>
  );
};

export default ImportantDates;