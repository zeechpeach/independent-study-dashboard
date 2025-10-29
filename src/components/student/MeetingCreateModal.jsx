import React, { useState, useEffect } from 'react';
import { Calendar, X, AlertCircle, Clock } from 'lucide-react';

/**
 * Modal for creating or editing a meeting manually
 */
const MeetingCreateModal = ({ isOpen, onClose, onSave, userProfile, editingMeeting = null }) => {
  const [formData, setFormData] = useState({
    scheduledDate: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Initialize form data when editing or when modal opens
  useEffect(() => {
    if (isOpen) {
      if (editingMeeting) {
        // Format the date from the existing meeting
        const meetingDate = new Date(editingMeeting.scheduledDate);
        const formattedDate = meetingDate.toISOString().split('T')[0];
        
        setFormData({
          scheduledDate: formattedDate
        });
      } else {
        // Default to today's date for new meeting logs
        const today = new Date().toISOString().split('T')[0];
        setFormData({
          scheduledDate: today
        });
      }
      setErrors({});
    }
  }, [isOpen, editingMeeting]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.scheduledDate) {
      newErrors.scheduledDate = 'Meeting date is required';
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
      // Store the date at midnight local time to work with day-only precision
      const scheduledDateTime = new Date(`${formData.scheduledDate}T00:00:00`);
      
      const meetingData = {
        title: 'Meeting Log',
        description: '',
        scheduledDate: scheduledDateTime.toISOString(),
        duration: 30, // Default 30 minutes
        meetingLink: '',
        status: 'pending-review',  // Student-logged meetings need advisor review
        source: 'manual',
        attendanceMarked: false,  // Don't auto-mark attendance - advisor needs to confirm
        studentSelfReported: true,  // Student logged this
        advisorFeedback: '',
        studentId: userProfile?.id || '', // Will be set by the service
        studentName: userProfile?.name || '',
        studentEmail: userProfile?.email || ''
      };
      
      if (editingMeeting) {
        // For editing, pass the meeting ID and the updated data
        await onSave(editingMeeting.id, meetingData);
      } else {
        // For creating, just pass the meeting data
        await onSave(meetingData);
      }
      
      // Reset form
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        scheduledDate: today
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error(`Error ${editingMeeting ? 'updating' : 'creating'} meeting:`, error);
      setErrors({ submit: `Failed to ${editingMeeting ? 'update' : 'create'} meeting. Please try again.` });
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              {editingMeeting ? 'Edit Meeting Log' : 'Log a Meeting'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-600">{errors.submit}</span>
            </div>
          )}

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              Quickly log a meeting that occurred with your advisor. The date defaults to today.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meeting Date *
            </label>
            <input
              type="date"
              className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.scheduledDate ? 'border-red-300' : 'border-gray-300'
              }`}
              value={formData.scheduledDate}
              onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
            />
            {errors.scheduledDate && (
              <p className="text-sm text-red-600 mt-1">{errors.scheduledDate}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">When did the meeting take place?</p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  {editingMeeting ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4" />
                  {editingMeeting ? 'Update Meeting' : 'Log Meeting'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MeetingCreateModal;