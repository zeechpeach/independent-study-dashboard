import React, { useState, useEffect } from 'react';
import { Calendar, X, AlertCircle, Clock, User, CheckCircle } from 'lucide-react';

/**
 * Modal for advisors to manually log meetings on behalf of students
 * Handles override of student logs for the same date
 */
const AdvisorMeetingLogModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  students = [],
  selectedStudentId = null,
  userProfile 
}) => {
  const [formData, setFormData] = useState({
    studentId: selectedStudentId || '',
    scheduledDate: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen) {
      // Default to today's date for new meeting logs
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        studentId: selectedStudentId || '',
        scheduledDate: today
      });
      setErrors({});
    }
  }, [isOpen, selectedStudentId]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.studentId) {
      newErrors.studentId = 'Please select a student';
    }
    
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
      await onSave(formData.studentId, formData.scheduledDate);
      
      // Reset form
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        studentId: selectedStudentId || '',
        scheduledDate: today
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Error creating advisor meeting log:', error);
      setErrors({ submit: 'Failed to create meeting log. Please try again.' });
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

  const selectedStudent = students.find(s => s.id === formData.studentId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Log Meeting for Student
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
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Advisor Meeting Log</p>
                <p>Log a meeting that occurred with a student. If the student already logged a meeting for the same date, your entry will override theirs. Both entries will be stored for auditing purposes.</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student *
            </label>
            <div className="relative">
              <select
                className={`w-full p-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.studentId ? 'border-red-300' : 'border-gray-300'
                }`}
                value={formData.studentId}
                onChange={(e) => handleInputChange('studentId', e.target.value)}
                disabled={selectedStudentId} // Disable if student is pre-selected
              >
                <option value="">Select a student...</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.name} ({student.email})
                  </option>
                ))}
              </select>
              <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            </div>
            {errors.studentId && (
              <p className="text-sm text-red-600 mt-1">{errors.studentId}</p>
            )}
            {selectedStudentId && (
              <p className="text-xs text-gray-500 mt-1">
                Pre-selected from student detail view
              </p>
            )}
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
            <p className="text-xs text-gray-500 mt-1">
              When did the meeting take place?
            </p>
          </div>

          {selectedStudent && formData.scheduledDate && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Note</p>
                  <p>
                    This will log a meeting for <strong>{selectedStudent.name}</strong> on{' '}
                    <strong>{new Date(formData.scheduledDate + 'T00:00:00').toLocaleDateString()}</strong>.
                    If they already logged a meeting for this date, your entry will be used instead.
                  </p>
                </div>
              </div>
            </div>
          )}

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
                  Logging...
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4" />
                  Log Meeting
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdvisorMeetingLogModal;
