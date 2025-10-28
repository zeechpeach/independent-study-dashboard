import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle, Plus, Trash2, User, AlertCircle } from 'lucide-react';
import { createAdvisorTodo, updateAdvisorTodo, deleteAdvisorTodo, getAdvisorTodos } from '../../services/firebase';

/**
 * AdvisorTodoList - Component for advisors to manage action items for students
 * Allows advisors to add, complete, and delete todo items assigned to specific students
 */
const AdvisorTodoList = ({ advisorId, students = [] }) => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTodo, setNewTodo] = useState({
    description: '',
    studentId: '',
    completed: false
  });

  const fetchTodos = async () => {
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
  };

  useEffect(() => {
    if (advisorId) {
      fetchTodos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [advisorId]);

  const handleAddTodo = async (e) => {
    e.preventDefault();
    
    if (!newTodo.description.trim() || !newTodo.studentId) {
      return;
    }

    try {
      const todoData = {
        advisorId,
        studentId: newTodo.studentId,
        description: newTodo.description.trim(),
        completed: false
      };

      await createAdvisorTodo(todoData);
      
      // Reset form
      setNewTodo({ description: '', studentId: '', completed: false });
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

  const getStudentName = (studentId) => {
    const student = students.find(s => s.id === studentId);
    return student?.name || 'Unknown Student';
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student
            </label>
            <div className="relative">
              <select
                value={newTodo.studentId}
                onChange={(e) => setNewTodo({ ...newTodo, studentId: e.target.value })}
                className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
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
                setNewTodo({ description: '', studentId: '', completed: false });
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
          <TodoItem
            key={todo.id}
            todo={todo}
            studentName={getStudentName(todo.studentId)}
            onToggleComplete={handleToggleComplete}
            onDelete={handleDeleteTodo}
          />
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
              <TodoItem
                key={todo.id}
                todo={todo}
                studentName={getStudentName(todo.studentId)}
                onToggleComplete={handleToggleComplete}
                onDelete={handleDeleteTodo}
              />
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

const TodoItem = ({ todo, studentName, onToggleComplete, onDelete }) => {
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
        <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
          <User className="w-3 h-3" />
          <span>{studentName}</span>
        </div>
      </div>

      <button
        onClick={() => onDelete(todo.id)}
        className="flex-shrink-0 text-gray-400 hover:text-red-600 transition-colors"
        title="Delete"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

export default AdvisorTodoList;
