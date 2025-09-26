import React, { useState, useEffect } from 'react';
import { ArrowLeft, MessageSquare, User, Clock } from 'lucide-react';
import { getRecentReflectionsByAdvisor } from '../../services/firebase';

/**
 * AdvisorAllReflections - Full view of all student reflections for advisor review
 */
const AdvisorAllReflections = ({ advisorEmail, userProfile, onBack }) => {
  const [reflections, setReflections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const actualAdvisorEmail = advisorEmail || userProfile?.email;

  useEffect(() => {
    const fetchAllReflections = async () => {
      if (!actualAdvisorEmail) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        // Get more reflections for the full view
        const reflectionData = await getRecentReflectionsByAdvisor(actualAdvisorEmail, 50);
        
        const transformedReflections = reflectionData.map(reflection => ({
          id: reflection.id,
          studentName: reflection.studentName,
          type: reflection.type || 'weekly',
          title: reflection.title || 'Reflection',
          content: reflection.content || 'No content available',
          submittedAt: reflection.createdAt?.toDate?.() || new Date(reflection.createdAt),
          pathway: reflection.pathway,
          studentEmail: reflection.studentEmail
        }));
        
        setReflections(transformedReflections);
      } catch (err) {
        console.error('Error fetching all reflections:', err);
        setError('Failed to load reflections');
      } finally {
        setLoading(false);
      }
    };

    fetchAllReflections();
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
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">All Reflections</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="loading-spinner w-8 h-8" />
          <span className="ml-3 text-gray-600">Loading reflections...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button 
          onClick={onBack}
          className="text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Reflections</h1>
          <p className="text-gray-600">Review student reflections and provide feedback</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Reflections List */}
      <div className="space-y-4">
        {reflections.map((reflection) => (
          <div key={reflection.id} className="card">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-gray-900">
                      {reflection.studentName}
                    </span>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${getTypeColor(reflection.type)}`}>
                    {reflection.type.replace('-', ' ')}
                  </span>
                  {reflection.pathway && (
                    <span className="text-sm text-gray-500">• {reflection.pathway}</span>
                  )}
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>{formatTimeAgo(reflection.submittedAt)}</span>
                </div>
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                {reflection.title}
              </h3>
              
              <div className="prose prose-sm max-w-none text-gray-700">
                <p>{reflection.content}</p>
              </div>
              
              <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200">
                <button className="btn btn-primary btn-sm">
                  <MessageSquare className="w-4 h-4" />
                  Add Feedback
                </button>
                <button className="btn btn-secondary btn-sm">
                  Mark as Reviewed
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {reflections.length === 0 && !error && (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reflections yet</h3>
            <p className="text-gray-600">Student reflections will appear here when they're submitted.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvisorAllReflections;