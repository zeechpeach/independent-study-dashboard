import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Target, Calendar, Clock, Settings } from 'lucide-react';

const StudentPortal = () => {
  const { user, userProfile, isAdmin } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.displayName?.split(' ')[0] || 'Student'}! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Ready to continue your learning journey?
          </p>
        </div>
        
        {isAdmin && (
          <a href="/admin" className="btn btn-secondary">
            <Settings className="w-4 h-4" />
            Admin View
          </a>
        )}
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              <h2 className="card-title">Current Goals</h2>
            </div>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">No goals set yet</p>
              <button className="btn btn-primary btn-sm mt-2">
                Set Your First Goal
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-600" />
              <h2 className="card-title">Upcoming Meetings</h2>
            </div>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">No meetings scheduled</p>
              <button className="btn btn-primary btn-sm mt-2">
                Book a Meeting
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-600" />
              <h2 className="card-title">Recent Reflections</h2>
            </div>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">No reflections yet</p>
              <button className="btn btn-primary btn-sm mt-2">
                Write Your First Reflection
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <h2 className="card-title">Important Dates</h2>
            </div>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">No important dates</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="flex gap-3 flex-wrap">
          <button className="btn btn-primary">
            <BookOpen className="w-4 h-4" />
            New Reflection
          </button>
          <button className="btn btn-secondary">
            <Target className="w-4 h-4" />
            Set Goal
          </button>
          <button className="btn btn-secondary">
            <Calendar className="w-4 h-4" />
            Schedule Meeting
          </button>
        </div>
      </div>

      <div className="text-sm text-gray-500 text-center">
        📧 Having issues? Contact your coordinator at {process.env.REACT_APP_ADMIN_EMAIL}
      </div>
    </div>
  );
};

export default StudentPortal;