import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Clock, Save, X } from 'lucide-react';
import { getImportantDatesForAdvisors, createImportantDate } from '../../services/firebase';

const AdvisorImportantDatesPanel = ({ userProfile, onManageClick }) => {
  const [importantDates, setImportantDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDate, setNewDate] = useState({
    title: '',
    date: '',
    description: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchImportantDates();
  }, [userProfile?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchImportantDates = async () => {
    if (!userProfile?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Get important dates for this advisor + global dates
      // Use the same logic as student panel to ensure consistency
      const advisorIds = [userProfile.id];
      const dates = await getImportantDatesForAdvisors(advisorIds);
      
      // Show only upcoming dates (today or future) and limit to 3 for dashboard
      const today = new Date().toISOString().split('T')[0];
      const upcomingDates = dates
        .filter(date => date.date >= today)
        .slice(0, 3);
      
      setImportantDates(upcomingDates);
    } catch (err) {
      console.error('Error fetching advisor important dates:', err);
      setError('Failed to load important dates');
    } finally {
      setLoading(false);
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

  const handleAddDate = async (e) => {
    e.preventDefault();
    if (!newDate.title.trim() || !newDate.date) {
      return;
    }

    setSaving(true);
    try {
      await createImportantDate({
        title: newDate.title.trim(),
        date: newDate.date,
        description: newDate.description.trim()
      }, userProfile.id);
      
      // Reset form and refresh dates
      setNewDate({ title: '', date: '', description: '' });
      setShowAddForm(false);
      await fetchImportantDates();
    } catch (err) {
      console.error('Error adding important date:', err);
      setError('Failed to add date');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-gray-800">Important Dates</h3>
          </div>
        </div>
        <div className="flex justify-center items-center h-20">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-gray-800">Important Dates</h3>
          </div>
        </div>
        <div className="text-center text-red-600">
          <p className="text-xs">{error}</p>
          <button 
            onClick={fetchImportantDates}
            className="mt-1 text-xs text-blue-600 hover:text-blue-800"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-semibold text-gray-800">Important Dates</h3>
        </div>
        <div className="flex gap-1.5">
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="text-xs px-1.5 py-0.5 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
              title="Add New Date"
            >
              <Plus className="w-3 h-3" />
              Add
            </button>
          )}
          <button
            onClick={onManageClick}
            className="text-xs px-1.5 py-0.5 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Manage
          </button>
        </div>
      </div>

      {/* Add Date Form */}
      {showAddForm && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-900">Add New Date</h4>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewDate({ title: '', date: '', description: '' });
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleAddDate} className="space-y-2">
            <div>
              <input
                type="text"
                value={newDate.title}
                onChange={(e) => setNewDate({ ...newDate, title: e.target.value })}
                placeholder="Event title..."
                className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <input
                type="date"
                value={newDate.date}
                onChange={(e) => setNewDate({ ...newDate, date: e.target.value })}
                className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <textarea
                value={newDate.description}
                onChange={(e) => setNewDate({ ...newDate, description: e.target.value })}
                placeholder="Description (optional)..."
                rows="2"
                className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium flex items-center justify-center gap-1"
              >
                <Save className="w-3 h-3" />
                {saving ? 'Saving...' : 'Save Date'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setNewDate({ title: '', date: '', description: '' });
                }}
                className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      
      {importantDates.length === 0 && !showAddForm ? (
        <div className="text-center py-4 text-gray-500">
          <Calendar className="w-6 h-6 mx-auto mb-1 text-gray-300" />
          <p className="text-xs mb-1">No upcoming important dates</p>
          <button
            onClick={onManageClick}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Create your first date
          </button>
        </div>
      ) : (
        <div className="space-y-2 max-h-[240px] overflow-y-auto">
          {importantDates.map((date) => (
            <div key={date.id} className="border rounded p-2 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-800 text-xs truncate">{date.title}</h4>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock className="w-2.5 h-2.5 text-gray-400 flex-shrink-0" />
                    <span className="text-xs text-gray-500">
                      {new Date(date.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  {date.description && (
                    <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">
                      {date.description}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <span className={`text-xs px-1.5 py-0.5 rounded-full whitespace-nowrap ${
                    getDaysUntil(date.date) === 'Today' 
                      ? 'bg-red-100 text-red-700'
                      : getDaysUntil(date.date) === 'Tomorrow'
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {getDaysUntil(date.date)}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {importantDates.length === 3 && (
            <div className="text-center pt-1">
              <button
                onClick={onManageClick}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                View all dates →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvisorImportantDatesPanel;