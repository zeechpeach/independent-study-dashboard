import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Clock } from 'lucide-react';
import { getImportantDatesForAdvisors } from '../../services/firebase';

const AdvisorImportantDatesPanel = ({ userProfile, onManageClick }) => {
  const [importantDates, setImportantDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">Important Dates</h3>
          </div>
        </div>
        <div className="flex justify-center items-center h-32">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">Important Dates</h3>
          </div>
        </div>
        <div className="text-center text-red-600">
          <p className="text-sm">{error}</p>
          <button 
            onClick={fetchImportantDates}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Important Dates</h3>
        </div>
        <button
          onClick={onManageClick}
          className="btn btn-sm btn-primary"
        >
          <Plus className="w-4 h-4" />
          Manage
        </button>
      </div>
      
      {importantDates.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm mb-2">No upcoming important dates</p>
          <button
            onClick={onManageClick}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Create your first date
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {importantDates.map((date) => (
            <div key={date.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800 text-sm">{date.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {new Date(date.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  {date.description && (
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {date.description}
                    </p>
                  )}
                </div>
                <div className="ml-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${
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
            <div className="text-center pt-2">
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