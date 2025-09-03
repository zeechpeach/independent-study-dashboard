import React from 'react';
import { MessageSquare, Clock, User, ChevronRight } from 'lucide-react';

/**
 * RecentReflectionsPanel - Displays recent student reflections for advisor review
 * 
 * Static placeholder content for Phase 3A structural migration.
 * Future phases will implement actual data integration.
 */
const RecentReflectionsPanel = ({ className = '' }) => {
  // Static placeholder data
  const recentReflections = [
    {
      id: '1',
      studentName: 'Alex Johnson',
      type: 'pre-meeting',
      title: 'Weekly Progress Check',
      excerpt: 'Made significant progress on the data visualization component. Ready to discuss next steps...',
      submittedAt: '2024-01-15T10:30:00Z',
      status: 'unread'
    },
    {
      id: '2',
      studentName: 'Morgan Chen', 
      type: 'post-meeting',
      title: 'Meeting Follow-up',
      excerpt: 'Action items from our discussion: 1) Research React performance optimization, 2) Update project timeline...',
      submittedAt: '2024-01-14T16:45:00Z',
      status: 'read'
    },
    {
      id: '3',
      studentName: 'Jordan Smith',
      type: 'weekly',
      title: 'Week 3 Reflection',
      excerpt: 'This week I focused on learning TypeScript fundamentals. Challenges included understanding interface definitions...',
      submittedAt: '2024-01-14T09:15:00Z',
      status: 'read'
    },
    {
      id: '4',
      studentName: 'Casey Wilson',
      type: 'milestone',
      title: 'MVP Completion Reflection',
      excerpt: 'Successfully completed the MVP! Key learnings include project architecture decisions and user feedback integration...',
      submittedAt: '2024-01-13T14:20:00Z',
      status: 'read'
    }
  ];

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

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className={`card ${className}`}>
      <div className="card-header">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          <h2 className="card-title">Recent Reflections</h2>
          <span className="ml-auto bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
            {recentReflections.filter(r => r.status === 'unread').length} new
          </span>
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
                
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>{formatTimeAgo(reflection.submittedAt)}</span>
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
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <button className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium">
          View All Reflections
        </button>
      </div>
    </div>
  );
};

export default RecentReflectionsPanel;