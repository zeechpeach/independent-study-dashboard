import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Users, Calendar, TrendingUp, AlertCircle, Settings } from 'lucide-react';

const AdminPortal = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Manage independent study programs and track student progress
          </p>
        </div>
        
        <a href="/student" className="btn btn-secondary">
          <Users className="w-4 h-4" />
          Student View
        </a>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-3">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Week's Meetings</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
            <Calendar className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Goals</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <h2 className="card-title">Students Needing Attention</h2>
            </div>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">All students are up to date</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h2 className="card-title">Recent Activity</h2>
            </div>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">No recent activity</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="flex gap-3 flex-wrap">
          <button className="btn btn-primary">
            <Users className="w-4 h-4" />
            View All Students
          </button>
          <button className="btn btn-secondary">
            <Calendar className="w-4 h-4" />
            Manage Important Dates
          </button>
          <button className="btn btn-secondary">
            <TrendingUp className="w-4 h-4" />
            Progress Reports
          </button>
          <button className="btn btn-secondary">
            <Settings className="w-4 h-4" />
            System Settings
          </button>
        </div>
      </div>

      <div className="text-sm text-gray-500 text-center">
        Independent Study Dashboard v1.0 - Built for BCIL
      </div>
    </div>
  );
};

export default AdminPortal;