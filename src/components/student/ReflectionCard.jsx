import React from 'react';
import { Clock, CheckCircle } from 'lucide-react';
import { formatDatePacific } from '../../utils/dates';

const ReflectionCard = ({ reflection, onClick }) => {
  const isPreMeeting = reflection.type === 'pre-meeting';
  
  // Get the first 120 characters of content for preview
  const getPreviewContent = () => {
    const content = reflection.accomplishments || reflection.keyInsights || reflection.challenges || 'No content';
    return content.length > 120 ? content.substring(0, 120) + '...' : content;
  };

  const handleClick = () => {
    onClick(reflection);
  };

  const formatReflectionDate = (dateValue) => {
    if (!dateValue) return 'No date';
    
    // Handle Firestore timestamp
    if (dateValue.toDate) {
      return formatDatePacific(dateValue.toDate());
    }
    
    // Handle regular date
    return formatDatePacific(dateValue);
  };

  return (
    <div 
      className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:shadow-md hover:border-gray-300 transition-all duration-200 group"
      onClick={handleClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-110 ${
            isPreMeeting 
              ? 'bg-blue-100 text-blue-600' 
              : 'bg-green-100 text-green-600'
          }`}>
            {isPreMeeting ? (
              <Clock className="w-4 h-4" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
          </div>
          <div>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              isPreMeeting 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {isPreMeeting ? 'Pre-Meeting' : 'Post-Meeting'}
            </span>
          </div>
        </div>
        <span className="text-xs text-gray-500">
          {formatReflectionDate(reflection.createdAt)}
        </span>
      </div>
      
      <p className="text-sm text-gray-600 line-clamp-3">
        {getPreviewContent()}
      </p>
    </div>
  );
};

export default ReflectionCard;