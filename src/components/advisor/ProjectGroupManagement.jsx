import React, { useState, useEffect, useCallback } from 'react';
import { Users, Plus, Edit, Trash2, X, Save, AlertCircle } from 'lucide-react';
import { 
  getProjectGroupsByAdvisor, 
  createProjectGroup, 
  updateProjectGroup, 
  deleteProjectGroup,
  getStudentsByAdvisor 
} from '../../services/firebase';

/**
 * ProjectGroupManagement - Component for managing project teams
 */
const ProjectGroupManagement = ({ advisorId, advisorEmail, onBack }) => {
  const [projectGroups, setProjectGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [groups, studentsList] = await Promise.all([
        getProjectGroupsByAdvisor(advisorId),
        getStudentsByAdvisor(advisorEmail)
      ]);
      setProjectGroups(groups);
      setStudents(studentsList);
    } catch (err) {
      console.error('Error fetching project groups:', err);
      setError('Failed to load project groups');
    } finally {
      setLoading(false);
    }
  }, [advisorId, advisorEmail]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateGroup = () => {
    setEditingGroup(null);
    setShowCreateModal(true);
  };

  const handleEditGroup = (group) => {
    setEditingGroup(group);
    setShowCreateModal(true);
  };

  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm('Are you sure you want to delete this project team? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteProjectGroup(groupId);
      await fetchData();
    } catch (error) {
      console.error('Error deleting project group:', error);
      alert('Failed to delete project team. Please try again.');
    }
  };

  const handleSaveGroup = async (groupData) => {
    try {
      if (editingGroup) {
        await updateProjectGroup(editingGroup.id, groupData);
      } else {
        await createProjectGroup({ ...groupData, advisorId });
      }
      await fetchData();
      setShowCreateModal(false);
      setEditingGroup(null);
    } catch (error) {
      console.error('Error saving project group:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading project teams...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-800 text-sm mb-2"
          >
            ← Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Project Teams</h1>
              <p className="text-gray-600">Manage student project groups and teams</p>
            </div>
            <button
              onClick={handleCreateGroup}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Team
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-600">{error}</span>
          </div>
        )}

        {/* Project Groups List */}
        <div className="space-y-4">
          {projectGroups.length === 0 ? (
            <div className="card text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No project teams yet</h3>
              <p className="text-gray-600 mb-4">
                Create project teams to log meetings and assign action items to multiple students at once.
              </p>
              <button
                onClick={handleCreateGroup}
                className="btn btn-primary inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Your First Team
              </button>
            </div>
          ) : (
            projectGroups.map(group => (
              <ProjectGroupCard
                key={group.id}
                group={group}
                students={students}
                onEdit={() => handleEditGroup(group)}
                onDelete={() => handleDeleteGroup(group.id)}
              />
            ))
          )}
        </div>

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <ProjectGroupModal
            group={editingGroup}
            students={students}
            onSave={handleSaveGroup}
            onClose={() => {
              setShowCreateModal(false);
              setEditingGroup(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

/**
 * ProjectGroupCard - Display a single project group
 */
const ProjectGroupCard = ({ group, students, onEdit, onDelete }) => {
  const groupStudents = students.filter(s => group.studentIds?.includes(s.id));

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
          {group.description && (
            <p className="text-sm text-gray-600 mt-1">{group.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
            title="Edit team"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-600 hover:bg-red-50 rounded"
            title="Delete team"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            Team Members ({groupStudents.length})
          </span>
        </div>
        {groupStudents.length > 0 ? (
          <div className="space-y-2">
            {groupStudents.map(student => (
              <div key={student.id} className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">{student.name}</span>
                <span className="text-gray-500">({student.email})</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No students assigned to this team</p>
        )}
      </div>
    </div>
  );
};

/**
 * ProjectGroupModal - Create/Edit project group modal
 */
const ProjectGroupModal = ({ group, students, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: group?.name || '',
    description: group?.description || '',
    studentIds: group?.studentIds || []
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Team name is required';
    }
    
    if (formData.studentIds.length === 0) {
      newErrors.studentIds = 'Please select at least one student';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      await onSave(formData);
    } catch (error) {
      setErrors({ submit: 'Failed to save team. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleStudentToggle = (studentId) => {
    const newStudentIds = formData.studentIds.includes(studentId)
      ? formData.studentIds.filter(id => id !== studentId)
      : [...formData.studentIds, studentId];
    
    setFormData({ ...formData, studentIds: newStudentIds });
    if (errors.studentIds) {
      setErrors({ ...errors, studentIds: null });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              {group ? 'Edit Project Team' : 'Create Project Team'}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Team Name *
            </label>
            <input
              type="text"
              className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., AI Research Team, Web Dev Group"
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the project or team focus"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Team Members * ({formData.studentIds.length} selected)
            </label>
            <div className={`max-h-64 overflow-y-auto border rounded-lg p-2 ${
              errors.studentIds ? 'border-red-300' : 'border-gray-300'
            }`}>
              {students.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No students available
                </p>
              ) : (
                students.map(student => (
                  <label
                    key={student.id}
                    className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.studentIds.includes(student.id)}
                      onChange={() => handleStudentToggle(student.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      {student.name} <span className="text-gray-500">({student.email})</span>
                    </span>
                  </label>
                ))
              )}
            </div>
            {errors.studentIds && (
              <p className="text-sm text-red-600 mt-1">{errors.studentIds}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {group ? 'Update Team' : 'Create Team'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectGroupManagement;
