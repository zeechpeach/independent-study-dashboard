import React, { useState, useEffect } from 'react';
import { MessageSquare, Clock, User, ChevronRight } from 'lucide-react';
import { getRecentReflectionsByAdvisor } from '../../services/firebase';

/**
 * RecentReflectionsPanel - Displays recent student reflections for advisor review
 * 
 * Phase 3B: Now uses dynamic data from Firebase to show real student reflections
 * submitted by students assigned to this advisor.
 */
const RecentReflectionsPanel = ({ className = '', advisorEmail, userProfile, onReflectionClick, onViewAllClick }) => {
  const [recentReflections, setRecentReflections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get advisor email from userProfile if not provided directly
  const actualAdvisorEmail = advisorEmail || userProfile?.email;

  useEffect(() => {
    const fetchRecentReflections = async () => {
      if (!actualAdvisorEmail) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const reflections = await getRecentReflectionsByAdvisor(actualAdvisorEmail, 10);
        
        // Transform the data to match the expected format
        const transformedReflections = reflections.map(reflection => ({
          id: reflection.id,
          studentName: reflection.studentName,
          type: reflection.type || 'weekly',
          title: reflection.title || 'Reflection',
          excerpt: reflection.content ? reflection.content.substring(0, 100) + '...' : 'No content preview available',
          submittedAt: reflection.createdAt?.toDate?.() || new Date(reflection.createdAt),
          status: 'unread', // We could track read status in future
          pathway: reflection.pathway,
          studentEmail: reflection.studentEmail
        }));
        
        setRecentReflections(transformedReflections);
      } catch (err) {
        console.error('Error fetching recent reflections:', err);
        setError('Failed to load reflections');
      } finally {
        setLoading(false);
      }
    };

    fetchRecentReflections();
  }, [actualAdvisorEmail]);

  const getTypeColor = (type) => {
    switch (type) {
      case 'pre-meeting':
        return 'bg-blue-100 text-blue-800';
      case 'post-meeting':
        return 'bg-green-100 text-green-800';
      case 'weekly':
        return 'bg-purple-100 text-purple-800';
      case 'milestone':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const reflectionDate = date instanceof Date ? date : new Date(date);
    const diffInHours = Math.floor((now - reflectionDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks === 1) return '1 week ago';
    return `${diffInWeeks} weeks ago`;
  };

  if (loading) {
    return (
      <div className={`card ${className}`}>
        <div className="card-header">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <h2 className="card-title">Recent Reflections</h2>
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="loading-spinner w-6 h-6" />
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`card ${className}`}>
        <div className="card-header">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <h2 className="card-title">Recent Reflections</h2>
          </div>
        </div>
        <div className="text-center py-8">
          <MessageSquare className="w-8 h-8 mx-auto mb-2 text-red-400" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  const unreadCount = recentReflections.filter(r => r.status === 'unread').length;

  return (
    <div className={`card ${className}`}>
      <div className="card-header">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          <h2 className="card-title">Recent Reflections</h2>
          {unreadCount > 0 && (
            <span className="ml-auto bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
      </div>
      
      <div className="space-y-3">
        {recentReflections.map((reflection) => (
          <div 
            key={reflection.id}
            className={`p-3 rounded-lg border transition-colors hover:bg-gray-50 cursor-pointer ${
              reflection.status === 'unread' 
                ? 'border-blue-200 bg-blue-50' 
                : 'border-gray-200 bg-white'
            }`}
            onClick={() => onReflectionClick && onReflectionClick(reflection)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <User className="w-3 h-3 text-gray-500" />
                    <span className="text-sm font-medium text-gray-900">
                      {reflection.studentName}
                    </span>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getTypeColor(reflection.type)}`}>
                    {reflection.type.replace('-', ' ')}
                  </span>
                  {reflection.status === 'unread' && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  )}
                </div>
                
                <h4 className="text-sm font-medium text-gray-800 mb-1">
                  {reflection.title}
                </h4>
                
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                  {reflection.excerpt}
                </p>
                
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatTimeAgo(reflection.submittedAt)}</span>
                  </div>
                  {reflection.pathway && (
                    <span className="text-gray-400">• {reflection.pathway}</span>
                  )}
                </div>
              </div>
              
              <ChevronRight className="w-4 h-4 text-gray-400 ml-2 flex-shrink-0" />
            </div>
          </div>
        ))}
        
        {recentReflections.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No recent reflections</p>
            <p className="text-xs mt-1">Students will appear here when they submit reflections</p>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <button 
          onClick={() => onViewAllClick && onViewAllClick()}
          className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          View All Reflections
        </button>
      </div>
    </div>
  );
};

export default RecentReflectionsPanel;