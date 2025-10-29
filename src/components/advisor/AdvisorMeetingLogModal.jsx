import React, { useState, useEffect } from 'react';
import { Calendar, X, AlertCircle, Clock, User, CheckCircle, Users } from 'lucide-react';
import { getProjectGroupsByAdvisor } from '../../services/firebase';

/**
 * Modal for advisors to manually log meetings on behalf of students
 * Supports single student, multiple students, or project group selection
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
  const [selectionMode, setSelectionMode] = useState('single'); // 'single', 'multiple', 'project'
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
      setSelectionMode(selectedStudentId ? 'single' : 'single');
    }
  }, [isOpen, selectedStudentId]);

  const validateForm = () => {
    const newErrors = {};
    
    if (selectionMode === 'single' && !formData.studentId) {
      newErrors.studentId = 'Please select a student';
    }
    
    if (selectionMode === 'multiple' && formData.studentIds.length === 0) {
      newErrors.studentIds = 'Please select at least one student';
    }
    
    if (selectionMode === 'project' && !formData.projectGroupId) {
      newErrors.projectGroupId = 'Please select a project group';
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
      
      if (selectionMode === 'single') {
        targetStudentIds = [formData.studentId];
      } else if (selectionMode === 'multiple') {
        targetStudentIds = formData.studentIds;
      } else if (selectionMode === 'project') {
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
      setSelectionMode('single');
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
    if (selectionMode === 'single' && formData.studentId) {
      return students.filter(s => s.id === formData.studentId);
    } else if (selectionMode === 'multiple') {
      return students.filter(s => formData.studentIds.includes(s.id));
    } else if (selectionMode === 'project' && formData.projectGroupId) {
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
                <p>Log a meeting for one or more students. Select individual students, multiple students, or an entire project team.</p>
              </div>
            </div>
          </div>

          {/* Selection Mode Tabs */}
          {!selectedStudentId && (
            <div className="flex border-b border-gray-200">
              <button
                type="button"
                onClick={() => setSelectionMode('single')}
                className={`flex-1 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  selectionMode === 'single'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <User className="w-4 h-4 inline mr-1" />
                Single Student
              </button>
              <button
                type="button"
                onClick={() => setSelectionMode('multiple')}
                className={`flex-1 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  selectionMode === 'multiple'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Users className="w-4 h-4 inline mr-1" />
                Multiple Students
              </button>
              <button
                type="button"
                onClick={() => setSelectionMode('project')}
                className={`flex-1 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  selectionMode === 'project'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Users className="w-4 h-4 inline mr-1" />
                Project Team
              </button>
            </div>
          )}

          {/* Single Student Selection */}
          {selectionMode === 'single' && (
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
                  disabled={selectedStudentId}
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
          )}

          {/* Multiple Students Selection */}
          {selectionMode === 'multiple' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Students * ({formData.studentIds.length} selected)
              </label>
              <div className={`max-h-48 overflow-y-auto border rounded-lg p-2 ${
                errors.studentIds ? 'border-red-300' : 'border-gray-300'
              }`}>
                {students.map(student => (
                  <label
                    key={student.id}
                    className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.studentIds.includes(student.id)}
                      onChange={(e) => handleMultiSelectChange(student.id, e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      {student.name} <span className="text-gray-500">({student.email})</span>
                    </span>
                  </label>
                ))}
              </div>
              {errors.studentIds && (
                <p className="text-sm text-red-600 mt-1">{errors.studentIds}</p>
              )}
            </div>
          )}

          {/* Project Group Selection */}
          {selectionMode === 'project' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Team *
              </label>
              <div className="relative">
                <select
                  className={`w-full p-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.projectGroupId ? 'border-red-300' : 'border-gray-300'
                  }`}
                  value={formData.projectGroupId}
                  onChange={(e) => handleInputChange('projectGroupId', e.target.value)}
                >
                  <option value="">Select a project team...</option>
                  {projectGroups.map(group => (
                    <option key={group.id} value={group.id}>
                      {group.name} ({group.studentIds?.length || 0} students)
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
                  No project teams available. Create one in the dashboard settings.
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
