import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, Circle, Plus, Trash2, User, AlertCircle, Edit2, Save, X, Users, Calendar } from 'lucide-react';
import { createAdvisorTodo, updateAdvisorTodo, deleteAdvisorTodo, getAdvisorTodos, getProjectGroupsByAdvisor } from '../../services/firebase';

/**
 * AdvisorTodoList - Component for advisors to manage action items for students/teams
 * Allows advisors to add, complete, edit, and delete todo items assigned to specific students or teams
 */
const AdvisorTodoList = ({ advisorId, students = [] }) => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [teams, setTeams] = useState([]);
  const [newTodo, setNewTodo] = useState({
    description: '',
    studentIds: [],
    teamId: '',
    dueDate: '',
    selectionMode: 'single',
    completed: false
  });

  const fetchTodos = useCallback(async () => {
    if (!advisorId) return;
    
    try {
      setLoading(true);
      setError(null);
      const todosData = await getAdvisorTodos(advisorId);
      setTodos(todosData);
    } catch (err) {
      console.error('Error fetching todos:', err);
      setError('Failed to load todos');
    } finally {
      setLoading(false);
    }
  }, [advisorId]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  useEffect(() => {
    const fetchTeams = async () => {
      if (!advisorId) return;
      try {
        const projectTeams = await getProjectGroupsByAdvisor(advisorId);
        setTeams(projectTeams);
      } catch (error) {
        console.error('Error fetching teams:', error);
      }
    };
    fetchTeams();
  }, [advisorId]);

  const handleAddTodo = async (e) => {
    e.preventDefault();
    
    if (!newTodo.description.trim()) {
      return;
    }

    let studentIds = [];
    let studentNames = [];
    let teamId = null;
    let teamName = null;

    if (newTodo.selectionMode === 'team' && newTodo.teamId) {
      const team = teams.find(t => t.id === newTodo.teamId);
      if (team) {
        teamId = team.id;
        teamName = team.name;
        studentIds = team.studentIds || [];
        studentNames = team.studentIds.map(sid => {
          const student = students.find(s => s.id === sid);
          return student ? student.name : 'Unknown';
        });
      }
    } else if (newTodo.selectionMode === 'multiple' && newTodo.studentIds.length > 0) {
      studentIds = newTodo.studentIds;
      studentNames = newTodo.studentIds.map(sid => {
        const student = students.find(s => s.id === sid);
        return student ? student.name : 'Unknown';
      });
    } else if (newTodo.selectionMode === 'single' && newTodo.studentIds.length > 0) {
      const studentId = newTodo.studentIds[0];
      const student = students.find(s => s.id === studentId);
      studentIds = [studentId];
      studentNames = student ? [student.name] : [];
    }

    if (studentIds.length === 0) {
      setError('Please select at least one student or team');
      return;
    }

    try {
      const todoData = {
        advisorId,
        studentId: studentIds[0], // For backward compatibility
        studentIds,
        studentNames,
        teamId,
        teamName,
        description: newTodo.description.trim(),
        dueDate: newTodo.dueDate || null,
        completed: false
      };

      await createAdvisorTodo(todoData);
      
      // Reset form
      setNewTodo({ 
        description: '', 
        studentIds: [], 
        teamId: '', 
        dueDate: '',
        selectionMode: 'single',
        completed: false 
      });
      setShowAddForm(false);
      
      // Refresh todos
      await fetchTodos();
    } catch (err) {
      console.error('Error adding todo:', err);
      setError('Failed to add todo');
    }
  };

  const handleToggleComplete = async (todo) => {
    try {
      await updateAdvisorTodo(todo.id, {
        completed: !todo.completed
      });
      
      // Refresh todos
      await fetchTodos();
    } catch (err) {
      console.error('Error updating todo:', err);
      setError('Failed to update todo');
    }
  };

  const handleDeleteTodo = async (todoId) => {
    if (!window.confirm('Are you sure you want to delete this action item?')) {
      return;
    }

    try {
      await deleteAdvisorTodo(todoId);
      
      // Refresh todos
      await fetchTodos();
    } catch (err) {
      console.error('Error deleting todo:', err);
      setError('Failed to delete todo');
    }
  };

  const handleEditTodo = (todo) => {
    setEditingTodo({
      ...todo,
      selectionMode: todo.teamId ? 'team' : (todo.studentIds?.length > 1 ? 'multiple' : 'single'),
      studentIds: todo.studentIds || (todo.studentId ? [todo.studentId] : []),
      teamId: todo.teamId || '',
      dueDate: todo.dueDate || ''
    });
  };

  const handleSaveEdit = async () => {
    if (!editingTodo || !editingTodo.description.trim()) {
      return;
    }

    let studentIds = [];
    let studentNames = [];
    let teamId = null;
    let teamName = null;

    if (editingTodo.selectionMode === 'team' && editingTodo.teamId) {
      const team = teams.find(t => t.id === editingTodo.teamId);
      if (team) {
        teamId = team.id;
        teamName = team.name;
        studentIds = team.studentIds || [];
        studentNames = team.studentIds.map(sid => {
          const student = students.find(s => s.id === sid);
          return student ? student.name : 'Unknown';
        });
      }
    } else if (editingTodo.selectionMode === 'multiple' && editingTodo.studentIds.length > 0) {
      studentIds = editingTodo.studentIds;
      studentNames = editingTodo.studentIds.map(sid => {
        const student = students.find(s => s.id === sid);
        return student ? student.name : 'Unknown';
      });
    } else if (editingTodo.selectionMode === 'single' && editingTodo.studentIds.length > 0) {
      const studentId = editingTodo.studentIds[0];
      const student = students.find(s => s.id === studentId);
      studentIds = [studentId];
      studentNames = student ? [student.name] : [];
    }

    if (studentIds.length === 0) {
      setError('Please select at least one student or team');
      return;
    }

    try {
      await updateAdvisorTodo(editingTodo.id, {
        studentId: studentIds[0], // For backward compatibility
        studentIds,
        studentNames,
        teamId,
        teamName,
        description: editingTodo.description.trim(),
        dueDate: editingTodo.dueDate || null,
        completed: editingTodo.completed
      });
      
      setEditingTodo(null);
      await fetchTodos();
    } catch (err) {
      console.error('Error updating todo:', err);
      setError('Failed to update todo');
    }
  };

  const handleCancelEdit = () => {
    setEditingTodo(null);
  };

  const handleStudentToggle = (studentId, isEditing = false) => {
    if (isEditing) {
      setEditingTodo(prev => ({
        ...prev,
        studentIds: prev.studentIds.includes(studentId)
          ? prev.studentIds.filter(id => id !== studentId)
          : [...prev.studentIds, studentId]
      }));
    } else {
      setNewTodo(prev => ({
        ...prev,
        studentIds: prev.studentIds.includes(studentId)
          ? prev.studentIds.filter(id => id !== studentId)
          : [...prev.studentIds, studentId]
      }));
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Action Items</h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="loading-spinner w-6 h-6" />
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  const incompleteTodos = todos.filter(t => !t.completed);
  const completedTodos = todos.filter(t => t.completed);

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="card-title">Action Items</h2>
            {incompleteTodos.length > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                {incompleteTodos.length}
              </span>
            )}
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 mb-3">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span className="text-sm text-red-600">{error}</span>
        </div>
      )}

      {showAddForm && (
        <form onSubmit={handleAddTodo} className="space-y-3 mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          {/* Selection Mode Tabs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign To <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setNewTodo({ ...newTodo, selectionMode: 'single', studentIds: [], teamId: '' })}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                  newTodo.selectionMode === 'single'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Single Student
              </button>
              <button
                type="button"
                onClick={() => setNewTodo({ ...newTodo, selectionMode: 'multiple', studentIds: [], teamId: '' })}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                  newTodo.selectionMode === 'multiple'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Multiple Students
              </button>
              <button
                type="button"
                onClick={() => setNewTodo({ ...newTodo, selectionMode: 'team', studentIds: [], teamId: '' })}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                  newTodo.selectionMode === 'team'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Team
              </button>
            </div>

            {/* Single Student Mode */}
            {newTodo.selectionMode === 'single' && (
              <div className="relative">
                <select
                  value={newTodo.studentIds[0] || ''}
                  onChange={(e) => setNewTodo({ ...newTodo, studentIds: e.target.value ? [e.target.value] : [] })}
                  className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a student...</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                    </option>
                  ))}
                </select>
                <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>
            )}

            {/* Multiple Students Mode */}
            {newTodo.selectionMode === 'multiple' && (
              <div className="border border-gray-300 rounded-lg p-3 max-h-32 overflow-y-auto">
                {students.length === 0 ? (
                  <p className="text-sm text-gray-500">No students available</p>
                ) : (
                  <div className="space-y-2">
                    {students.map((student) => (
                      <label key={student.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={newTodo.studentIds.includes(student.id)}
                          onChange={() => handleStudentToggle(student.id, false)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{student.name}</span>
                      </label>
                    ))}
                  </div>
                )}
                {newTodo.studentIds.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-600">
                      {newTodo.studentIds.length} student{newTodo.studentIds.length !== 1 ? 's' : ''} selected
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Team Mode */}
            {newTodo.selectionMode === 'team' && (
              <div className="relative">
                <select
                  value={newTodo.teamId}
                  onChange={(e) => setNewTodo({ ...newTodo, teamId: e.target.value })}
                  className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a team...</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name} ({team.studentIds?.length || 0} students)
                    </option>
                  ))}
                </select>
                <Users className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={newTodo.description}
              onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="2"
              placeholder="What needs to be done?"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date (Optional)
            </label>
            <div className="relative">
              <input
                type="date"
                value={newTodo.dueDate}
                onChange={(e) => setNewTodo({ ...newTodo, dueDate: e.target.value })}
                className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              Add Action Item
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setNewTodo({ 
                  description: '', 
                  studentIds: [], 
                  teamId: '', 
                  dueDate: '',
                  selectionMode: 'single',
                  completed: false 
                });
              }}
              className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {/* Incomplete todos */}
        {incompleteTodos.map((todo) => (
          editingTodo && editingTodo.id === todo.id ? (
            <TodoEditForm
              key={todo.id}
              todo={editingTodo}
              students={students}
              teams={teams}
              onSave={handleSaveEdit}
              onCancel={handleCancelEdit}
              onUpdate={setEditingTodo}
              onStudentToggle={handleStudentToggle}
            />
          ) : (
            <TodoItem
              key={todo.id}
              todo={todo}
              students={students}
              onToggleComplete={handleToggleComplete}
              onDelete={handleDeleteTodo}
              onEdit={handleEditTodo}
            />
          )
        ))}

        {/* Completed todos */}
        {completedTodos.length > 0 && (
          <>
            {incompleteTodos.length > 0 && (
              <div className="border-t border-gray-200 my-3" />
            )}
            <div className="text-xs font-medium text-gray-500 mb-2">
              Completed ({completedTodos.length})
            </div>
            {completedTodos.map((todo) => (
              editingTodo && editingTodo.id === todo.id ? (
                <TodoEditForm
                  key={todo.id}
                  todo={editingTodo}
                  students={students}
                  teams={teams}
                  onSave={handleSaveEdit}
                  onCancel={handleCancelEdit}
                  onUpdate={setEditingTodo}
                  onStudentToggle={handleStudentToggle}
                />
              ) : (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  students={students}
                  onToggleComplete={handleToggleComplete}
                  onDelete={handleDeleteTodo}
                  onEdit={handleEditTodo}
                />
              )
            ))}
          </>
        )}

        {todos.length === 0 && !showAddForm && (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No action items yet</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium mt-2"
            >
              Add your first action item
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const TodoItem = ({ todo, students, onToggleComplete, onDelete, onEdit }) => {
  const getStudentName = (studentId) => {
    const student = students.find(s => s.id === studentId);
    return student?.name || 'Unknown';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border ${
      todo.completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'
    }`}>
      <button
        onClick={() => onToggleComplete(todo)}
        className="flex-shrink-0 mt-0.5 text-gray-400 hover:text-blue-600 transition-colors"
      >
        {todo.completed ? (
          <CheckCircle className="w-5 h-5 text-green-600" />
        ) : (
          <Circle className="w-5 h-5" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-sm ${todo.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
          {todo.description}
        </p>
        <div className="flex flex-wrap items-center gap-2 mt-1">
          {todo.teamName ? (
            <span className="text-xs text-gray-600 bg-green-100 px-1.5 py-0.5 rounded flex items-center gap-1">
              <Users className="w-3 h-3" />
              {todo.teamName}
            </span>
          ) : todo.studentNames && todo.studentNames.length > 1 ? (
            <>
              <span className="text-xs text-gray-600 bg-blue-100 px-1.5 py-0.5 rounded">
                {todo.studentNames.length} students
              </span>
              {todo.studentNames.slice(0, 2).map((name, idx) => (
                <span key={idx} className="text-xs text-gray-500">
                  {name}{idx < Math.min(todo.studentNames.length, 2) - 1 ? ',' : ''}
                </span>
              ))}
              {todo.studentNames.length > 2 && (
                <span className="text-xs text-gray-500">
                  +{todo.studentNames.length - 2} more
                </span>
              )}
            </>
          ) : (
            <span className="text-xs text-gray-600 flex items-center gap-1">
              <User className="w-3 h-3" />
              {getStudentName(todo.studentId)}
            </span>
          )}
          {todo.dueDate && (
            <span className="text-xs text-gray-600 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Due: {formatDate(todo.dueDate)}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onEdit(todo)}
          className="flex-shrink-0 text-gray-400 hover:text-blue-600 transition-colors"
          title="Edit"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(todo.id)}
          className="flex-shrink-0 text-gray-400 hover:text-red-600 transition-colors"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const TodoEditForm = ({ todo, students, teams, onSave, onCancel, onUpdate, onStudentToggle }) => {
  return (
    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-900">Edit Action Item</h4>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Selection Mode Tabs */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Assign To
        </label>
        <div className="flex gap-2 mb-3">
          <button
            type="button"
            onClick={() => onUpdate({ ...todo, selectionMode: 'single', studentIds: [], teamId: '' })}
            className={`px-2 py-1 text-xs rounded font-medium transition-colors ${
              todo.selectionMode === 'single'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Single
          </button>
          <button
            type="button"
            onClick={() => onUpdate({ ...todo, selectionMode: 'multiple', studentIds: [], teamId: '' })}
            className={`px-2 py-1 text-xs rounded font-medium transition-colors ${
              todo.selectionMode === 'multiple'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Multiple
          </button>
          <button
            type="button"
            onClick={() => onUpdate({ ...todo, selectionMode: 'team', studentIds: [], teamId: '' })}
            className={`px-2 py-1 text-xs rounded font-medium transition-colors ${
              todo.selectionMode === 'team'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Team
          </button>
        </div>

        {/* Selection UI */}
        {todo.selectionMode === 'single' && (
          <select
            value={todo.studentIds[0] || ''}
            onChange={(e) => onUpdate({ ...todo, studentIds: e.target.value ? [e.target.value] : [] })}
            className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a student...</option>
            {students.map(student => (
              <option key={student.id} value={student.id}>
                {student.name}
              </option>
            ))}
          </select>
        )}

        {todo.selectionMode === 'multiple' && (
          <div className="border border-gray-300 rounded-lg p-2 max-h-24 overflow-y-auto bg-white">
            <div className="space-y-1">
              {students.map((student) => (
                <label key={student.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded text-sm">
                  <input
                    type="checkbox"
                    checked={todo.studentIds.includes(student.id)}
                    onChange={() => onStudentToggle(student.id, true)}
                    className="w-3 h-3 text-blue-600 rounded"
                  />
                  <span className="text-gray-700">{student.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {todo.selectionMode === 'team' && (
          <select
            value={todo.teamId}
            onChange={(e) => onUpdate({ ...todo, teamId: e.target.value })}
            className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a team...</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name} ({team.studentIds?.length || 0} students)
              </option>
            ))}
          </select>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={todo.description}
          onChange={(e) => onUpdate({ ...todo, description: e.target.value })}
          className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          rows="2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Due Date
        </label>
        <input
          type="date"
          value={todo.dueDate || ''}
          onChange={(e) => onUpdate({ ...todo, dueDate: e.target.value })}
          className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={(e) => onUpdate({ ...todo, completed: e.target.checked })}
            className="w-4 h-4 text-blue-600 rounded"
          />
          Mark as completed
        </label>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={onSave}
          className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center justify-center gap-1"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AdvisorTodoList;
