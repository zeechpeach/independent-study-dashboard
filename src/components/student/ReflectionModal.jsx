import React from 'react';
import { Calendar, Clock, CheckCircle, Edit3 } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { formatDatePacific } from '../../utils/dates';

const ReflectionModal = ({ 
  reflection, 
  isOpen, 
  onClose, 
  onEdit 
}) => {
  if (!reflection) return null;

  const isPreMeeting = reflection.type === 'pre-meeting';
  
  const formatReflectionDate = (dateValue) => {
    if (!dateValue) return 'No date';
    
    // Handle Firestore timestamp
    if (dateValue.toDate) {
      return formatDatePacific(dateValue.toDate());
    }
    
    // Handle regular date
    return formatDatePacific(dateValue);
  };

  const handleEdit = () => {
    onEdit(reflection);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isPreMeeting 
              ? 'bg-blue-100 text-blue-600' 
              : 'bg-green-100 text-green-600'
          }`}>
            {isPreMeeting ? (
              <Clock className="w-5 h-5" />
            ) : (
              <CheckCircle className="w-5 h-5" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {isPreMeeting ? 'Pre-Meeting Reflection' : 'Post-Meeting Summary'}
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              {formatReflectionDate(reflection.createdAt)}
            </div>
          </div>
        </div>
      }
      size="lg"
    >
      <div className="space-y-6">
        {isPreMeeting ? (
          <>
            {reflection.accomplishments && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Accomplishments</h4>
                <p className="text-gray-600">{reflection.accomplishments}</p>
              </div>
            )}
            
            {reflection.challenges && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Current Challenges</h4>
                <p className="text-gray-600">{reflection.challenges}</p>
              </div>
            )}
            
            {reflection.questionsToDiscuss && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Questions to Discuss</h4>
                <p className="text-gray-600">{reflection.questionsToDiscuss}</p>
              </div>
            )}
            
            {reflection.helpNeeded && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Help Needed</h4>
                <p className="text-gray-600">{reflection.helpNeeded}</p>
              </div>
            )}
            
            {reflection.priorities && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Priorities</h4>
                <p className="text-gray-600">{reflection.priorities}</p>
              </div>
            )}
          </>
        ) : (
          <>
            {reflection.keyInsights && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Key Insights</h4>
                <p className="text-gray-600">{reflection.keyInsights}</p>
              </div>
            )}
            
            {reflection.actionItems && reflection.actionItems.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Action Items</h4>
                <ul className="space-y-1">
                  {reflection.actionItems.map((item, index) => (
                    <li key={index} className="text-gray-600 flex items-start gap-2">
                      <span className="text-gray-400 mt-1">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {reflection.resources && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Resources Discussed</h4>
                <p className="text-gray-600">{reflection.resources}</p>
              </div>
            )}
            
            {reflection.nextGoals && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Next Goals</h4>
                <p className="text-gray-600">{reflection.nextGoals}</p>
              </div>
            )}
          </>
        )}
        
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={handleEdit}
            className="flex items-center gap-2"
          >
            <Edit3 className="w-4 h-4" />
            Edit Reflection
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ReflectionModal;