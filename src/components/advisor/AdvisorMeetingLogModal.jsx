import React, { useState, useEffect } from 'react';
import { Calendar, X, AlertCircle, Clock, CheckCircle, Users } from 'lucide-react';
import { getProjectGroupsByAdvisor } from '../../services/firebase';

/**
 * Modal for advisors to manually log meetings on behalf of students
 * Supports student(s) or team selection
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
  const [selectionMode, setSelectionMode] = useState('students'); // 'students', 'team'
  const [projectGroups, setProjectGroups] = useState([]);
  const [formData, setFormData] = useState({
    studentId: selectedStudentId || '',
    studentIds: selectedStudentId ? [selectedStudentId] : [],
    projectGroupId: '',
    scheduledDate: '',
    attended: true,
    notes: '',
    title: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Fetch project groups when modal opens
  useEffect(() => {
    const fetchProjectGroups = async () => {
      if (isOpen && userProfile?.id) {
        try {
          const groups = await getProjectGroupsByAdvisor(userProfile.id);
          setProjectGroups(groups);
        } catch (error) {
          console.error('Error fetching project groups:', error);
        }
      }
    };
    fetchProjectGroups();
  }, [isOpen, userProfile]);

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen) {
      // Default to today's date for new meeting logs
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        studentId: selectedStudentId || '',
        studentIds: selectedStudentId ? [selectedStudentId] : [],
        projectGroupId: '',
        scheduledDate: today,
        attended: true,
        notes: '',
        title: 'Team Meeting'
      });
      setErrors({});
      setSelectionMode(selectedStudentId ? 'students' : 'students');
    }
  }, [isOpen, selectedStudentId]);

  const validateForm = () => {
    const newErrors = {};
    
    if (selectionMode === 'students' && formData.studentIds.length === 0) {
      newErrors.studentIds = 'Please select at least one student';
    }
    
    if (selectionMode === 'team' && !formData.projectGroupId) {
      newErrors.projectGroupId = 'Please select a team';
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
      // Determine which students to log the meeting for
      let targetStudentIds = [];
      
      if (selectionMode === 'students') {
        targetStudentIds = formData.studentIds;
      } else if (selectionMode === 'team') {
        const group = projectGroups.find(g => g.id === formData.projectGroupId);
        targetStudentIds = group?.studentIds || [];
      }

      // Call the save handler with enhanced data
      if (targetStudentIds.length === 1) {
        // Single student - use original signature
        await onSave(targetStudentIds[0], formData.scheduledDate, formData.attended);
      } else {
        // Multiple students - need to log meeting for each
        for (const studentId of targetStudentIds) {
          await onSave(studentId, formData.scheduledDate, formData.attended);
        }
      }
      
      // Reset form
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        studentId: selectedStudentId || '',
        studentIds: selectedStudentId ? [selectedStudentId] : [],
        projectGroupId: '',
        scheduledDate: today,
        attended: true,
        notes: '',
        title: 'Team Meeting'
      });
      setErrors({});
      setSelectionMode('students');
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

  const handleMultiSelectChange = (studentId, isChecked) => {
    const newStudentIds = isChecked
      ? [...formData.studentIds, studentId]
      : formData.studentIds.filter(id => id !== studentId);
    
    setFormData({ ...formData, studentIds: newStudentIds });
    if (errors.studentIds) {
      setErrors({ ...errors, studentIds: null });
    }
  };

  const getSelectedStudents = () => {
    if (selectionMode === 'students') {
      return students.filter(s => formData.studentIds.includes(s.id));
    } else if (selectionMode === 'team' && formData.projectGroupId) {
      const group = projectGroups.find(g => g.id === formData.projectGroupId);
      if (group) {
        return students.filter(s => group.studentIds.includes(s.id));
      }
    }
    return [];
  };

  if (!isOpen) return null;

  const selectedStudentsList = getSelectedStudents();

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
                <p>Log a meeting for student(s) or an entire team.</p>
              </div>
            </div>
          </div>

          {/* Selection Mode Tabs */}
          {!selectedStudentId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Log Meeting For <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setSelectionMode('students')}
                  className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                    selectionMode === 'students'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Student(s)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectionMode('team')}
                  className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                    selectionMode === 'team'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Team
                </button>
              </div>
            </div>
          )}

          {/* Students Selection - Checkbox List */}
          {selectionMode === 'students' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Student(s) <span className="text-red-500">*</span>
              </label>
              <div className={`border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto ${
                errors.studentIds ? 'border-red-300' : ''
              }`}>
                {students.length === 0 ? (
                  <p className="text-sm text-gray-500">No students available</p>
                ) : (
                  <div className="space-y-2">
                    {students.map((student) => (
                      <label key={student.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={formData.studentIds.includes(student.id)}
                          onChange={(e) => handleMultiSelectChange(student.id, e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          disabled={selectedStudentId && selectedStudentId === student.id}
                        />
                        <span className="text-sm text-gray-700">{student.name}</span>
                      </label>
                    ))}
                  </div>
                )}
                {formData.studentIds.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-600">
                      {formData.studentIds.length} student{formData.studentIds.length !== 1 ? 's' : ''} selected
                    </p>
                  </div>
                )}
              </div>
              {errors.studentIds && (
                <p className="text-sm text-red-600 mt-1">{errors.studentIds}</p>
              )}
              {selectedStudentId && (
                <p className="text-xs text-gray-500 mt-1">
                  Pre-selected from student detail view
                </p>
              )}
            </div>
          )}

          {/* Team Selection */}
          {selectionMode === 'team' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Team <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.projectGroupId}
                  onChange={(e) => handleInputChange('projectGroupId', e.target.value)}
                  className={`w-full p-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.projectGroupId ? 'border-red-300' : ''
                  }`}
                >
                  <option value="">Select a team...</option>
                  {projectGroups.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name} ({team.studentIds?.length || 0} students)
                    </option>
                  ))}
                </select>
                <Users className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>
              {errors.projectGroupId && (
                <p className="text-sm text-red-600 mt-1">{errors.projectGroupId}</p>
              )}
              {projectGroups.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  No teams available. Create one in Project Teams.
                </p>
              )}
            </div>
          )}

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

          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <input
              type="checkbox"
              id="attended"
              checked={formData.attended}
              onChange={(e) => handleInputChange('attended', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="attended" className="text-sm font-medium text-gray-700 cursor-pointer">
              Student attended the meeting
            </label>
          </div>
          {!formData.attended && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5" />
                <div className="text-sm text-orange-800">
                  <p className="font-medium">Marking as Missed</p>
                  <p>
                    This meeting will be logged as missed or no-show in the student's attendance record.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Selected Students Summary */}
          {selectedStudentsList.length > 0 && formData.scheduledDate && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <div className="text-sm text-green-800">
                  <p className="font-medium mb-1">Meeting will be logged for:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedStudentsList.map(student => (
                      <li key={student.id}>{student.name}</li>
                    ))}
                  </ul>
                  <p className="mt-2">
                    Date: <strong>{new Date(formData.scheduledDate + 'T00:00:00').toLocaleDateString()}</strong>
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
