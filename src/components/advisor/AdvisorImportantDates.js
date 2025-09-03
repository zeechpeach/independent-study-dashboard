import React, { useState, useEffect } from 'react';
import ImportantDatesManager from '../dates/ImportantDatesManager';
import { 
  createImportantDate, 
  updateImportantDate, 
  deleteImportantDate, 
  getAdvisorImportantDates 
} from '../../services/firebase';

const AdvisorImportantDates = ({ user, onBack }) => {
  const [importantDates, setImportantDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchImportantDates();
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchImportantDates = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      const dates = await getAdvisorImportantDates(user.id);
      setImportantDates(dates);
    } catch (err) {
      console.error('Error fetching advisor important dates:', err);
      setError('Failed to load important dates');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDate = async (dateData) => {
    try {
      // For advisors, always set their ID as the advisorId
      await createImportantDate(dateData, user.id);
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
      mode="advisor"
      currentUserId={user?.id}
    />
  );
};

export default AdvisorImportantDates;