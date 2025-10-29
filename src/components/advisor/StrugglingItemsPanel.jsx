import React, { useState, useEffect } from 'react';
import { AlertCircle, User } from 'lucide-react';
import { getStudentsByAdvisor, getUserActionItems } from '../../services/firebase';

/**
 * StrugglingItemsPanel - Displays action items students are struggling with
 */
const StrugglingItemsPanel = ({ className = '', advisorEmail, userProfile }) => {
  const [strugglingItems, setStrugglingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStrugglingItems = async () => {
      const actualAdvisorEmail = advisorEmail || userProfile?.email;
      
      if (!actualAdvisorEmail) {
        setLoading(false);
        setError('No advisor information available');
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Get all students assigned to this advisor
        const students = await getStudentsByAdvisor(actualAdvisorEmail);
        
        // Get action items for each student and filter for struggling items
        const itemsPromises = students.map(async (student) => {
          const actionItems = await getUserActionItems(student.id);
          const struggling = actionItems.filter(item => item.struggling && !item.completed);
          
          return struggling.map(item => ({
            ...item,
            studentId: student.id,
            studentName: student.name,
            studentEmail: student.email
          }));
        });

        const allItemsArrays = await Promise.all(itemsPromises);
        const allStrugglingItems = allItemsArrays.flat();
        
        // Sort by creation date (most recent first)
        allStrugglingItems.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
          const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
          return dateB - dateA;
        });
        
        setStrugglingItems(allStrugglingItems);
      } catch (err) {
        console.error('Error fetching struggling items:', err);
        setError('Failed to load struggling items');
      } finally {
        setLoading(false);
      }
    };

    fetchStrugglingItems();
  }, [advisorEmail, userProfile?.email]);

  if (loading) {
    return (
      <div className={`card ${className}`}>
        <div className="card-header">
          <h2 className="card-title">Students Needing Help</h2>
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
          <h2 className="card-title">Students Needing Help</h2>
        </div>
        <div className="p-6 text-center text-red-600">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className={`card ${className}`}>
      <div className="card-header">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-orange-600" />
          <h2 className="card-title">Students Needing Help</h2>
        </div>
        {strugglingItems.length > 0 && (
          <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
            {strugglingItems.length} item{strugglingItems.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="space-y-3">
        {strugglingItems.length > 0 ? (
          strugglingItems.slice(0, 5).map((item) => (
            <div 
              key={item.id} 
              className="p-3 rounded-lg border border-orange-200 bg-orange-50 hover:bg-orange-100 transition-colors"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 font-medium mb-1">
                    {item.text}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <User className="w-3 h-3" />
                    <span>{item.studentName}</span>
                    {item.createdAt && (
                      <>
                        <span>•</span>
                        <span>
                          {new Date(item.createdAt.toDate ? item.createdAt.toDate() : item.createdAt).toLocaleDateString()}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 bg-gray-50 rounded-lg text-center">
            <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">No students are currently struggling</p>
            <p className="text-xs text-gray-500 mt-1">Great! All students appear to be on track</p>
          </div>
        )}
        
        {strugglingItems.length > 5 && (
          <div className="text-center pt-2">
            <p className="text-sm text-gray-600">
              + {strugglingItems.length - 5} more student{strugglingItems.length - 5 !== 1 ? 's' : ''} need help
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StrugglingItemsPanel;
