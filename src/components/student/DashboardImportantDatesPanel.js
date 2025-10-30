import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { getImportantDatesForAdvisors, getStudentImportantDates, getAdvisorByName } from '../../services/firebase';

const DashboardImportantDatesPanel = ({ userProfile }) => {
  const [importantDates, setImportantDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchImportantDates = useCallback(async () => {
    if (!userProfile) return;
    
    try {
      setLoading(true);
      setError(null);
      
      let advisorDates = [];
      let studentDates = [];
      
      // Get advisor IDs and fetch advisor dates
      if (userProfile.advisor) {
        const advisor = await getAdvisorByName(userProfile.advisor);
        if (advisor) {
          const advisorIds = [advisor.id];
          advisorDates = await getImportantDatesForAdvisors(advisorIds);
        }
      }
      
      // Future: handle multiple advisors if userProfile.advisors exists
      if (userProfile.advisors && Array.isArray(userProfile.advisors)) {
        const multiAdvisorDates = await getImportantDatesForAdvisors(userProfile.advisors);
        advisorDates = [...advisorDates, ...multiAdvisorDates];
      }
      
      // Get student's own personal important dates
      if (userProfile.uid || userProfile.id) {
        studentDates = await getStudentImportantDates(userProfile.uid || userProfile.id);
      }
      
      // Combine advisor and student dates, removing duplicates
      const combinedDates = [...advisorDates, ...studentDates];
      const uniqueDatesMap = new Map();
      combinedDates.forEach(date => {
        uniqueDatesMap.set(date.id, date);
      });
      
      // Filter for upcoming dates (today or future) and limit to 6
      const today = new Date().toISOString().split('T')[0];
      const upcomingDates = Array.from(uniqueDatesMap.values())
        .filter(date => date.date >= today)
        .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
        .slice(0, 6);
      
      setImportantDates(upcomingDates);
    } catch (err) {
      console.error('Error fetching important dates for student:', err);
      setError('Failed to load important dates');
    } finally {
      setLoading(false);
    }
  }, [userProfile]);

  useEffect(() => {
    fetchImportantDates();
  }, [fetchImportantDates]);

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
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Important Dates</h3>
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
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Important Dates</h3>
        </div>
        <div className="text-center text-red-600">
          <p>{error}</p>
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
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">Important Dates</h3>
      </div>
      
      {importantDates.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No upcoming important dates</p>
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
          
          {importantDates.length === 6 && (
            <div className="text-center pt-2">
              <span className="text-xs text-gray-500">
                Showing next 6 upcoming dates
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardImportantDatesPanel;