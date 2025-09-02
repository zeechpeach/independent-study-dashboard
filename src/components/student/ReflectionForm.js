import React, { useState, useEffect, useCallback } from 'react';
import { Save, Clock, CheckCircle } from 'lucide-react';

const ReflectionForm = ({ 
  type = 'pre-meeting', // 'pre-meeting' or 'post-meeting'
  existingReflection = null,
  onSave,
  onCancel,
  meetingId = null 
}) => {
  const [formData, setFormData] = useState({
    // Pre-meeting fields
    accomplishments: '',
    challenges: '',
    progressRating: 3,
    questionsToDiscuss: '',
    helpNeeded: '',
    priorities: '',
    
    // Post-meeting fields
    keyInsights: '',
    actionItems: [],
    resources: '',
    nextGoals: '',
    targetDate: '',
    successMetrics: ''
  });

  const [actionItem, setActionItem] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Use useCallback to fix the dependency warning
  const initializeFormData = useCallback(() => {
    if (existingReflection) {
      setFormData(prevData => ({ ...prevData, ...existingReflection }));
    }
  }, [existingReflection]);

  useEffect(() => {
    initializeFormData();
  }, [initializeFormData]);

  const addActionItem = () => {
    if (actionItem.trim()) {
      setFormData({
        ...formData,
        actionItems: [...formData.actionItems, actionItem.trim()]
      });
      setActionItem('');
    }
  };

  const removeActionItem = (index) => {
    setFormData({
      ...formData,
      actionItems: formData.actionItems.filter((_, i) => i !== index)
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (type === 'pre-meeting') {
      if (!formData.accomplishments.trim()) {
        newErrors.accomplishments = 'Please describe what you accomplished';
      }
      if (!formData.questionsToDiscuss.trim()) {
        newErrors.questionsToDiscuss = 'Please add at least one question to discuss';
      }
    } else {
      if (!formData.keyInsights.trim()) {
        newErrors.keyInsights = 'Please capture key insights from the meeting';
      }
      if (formData.actionItems.length === 0) {
        newErrors.actionItems = 'Please add at least one action item';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSave({
        ...formData,
        type,
        meetingId,
        completedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error saving reflection:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const isPreMeeting = type === 'pre-meeting';

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card shadow-xl border-0">
        <div className="card-header pb-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isPreMeeting 
                ? 'bg-blue-50 border border-blue-200' 
                : 'bg-green-50 border border-green-200'
            }`}>
              {isPreMeeting ? (
                <Clock className="w-6 h-6 text-blue-600" />
              ) : (
                <CheckCircle className="w-6 h-6 text-green-600" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                {isPreMeeting ? 'Pre-Meeting Reflection' : 'Post-Meeting Summary'}
              </h2>
              <p className="text-gray-600 mt-1">
                {isPreMeeting 
                  ? 'Prepare for your upcoming meeting by reflecting on your progress and questions'
                  : 'Capture insights, action items, and next steps from your meeting discussion'
                }
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 pt-6">
          {isPreMeeting ? (
            // Pre-meeting form fields
            <>
              <div className="form-group">
                <label className="form-label required">
                  What did you accomplish since our last meeting?
                </label>
                <textarea
                  className={`form-textarea ${errors.accomplishments ? 'border-red-300' : ''}`}
                  value={formData.accomplishments}
                  onChange={(e) => handleInputChange('accomplishments', e.target.value)}
                  placeholder="Describe your progress, completed tasks, learning breakthroughs..."
                  rows={4}
                />
                {errors.accomplishments && (
                  <p className="form-error">{errors.accomplishments}</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  What challenges did you face?
                </label>
                <textarea
                  className="form-textarea"
                  value={formData.challenges}
                  onChange={(e) => handleInputChange('challenges', e.target.value)}
                  placeholder="Obstacles, confusing concepts, resource limitations..."
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Rate your progress toward your goals (1-5 scale)
                </label>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-6">
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={formData.progressRating}
                      onChange={(e) => handleInputChange('progressRating', parseInt(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((formData.progressRating - 1) / 4) * 100}%, #e5e7eb ${((formData.progressRating - 1) / 4) * 100}%, #e5e7eb 100%)`
                      }}
                    />
                    <div className="flex flex-col items-center">
                      <span className="text-2xl font-bold text-blue-600 mb-1">
                        {formData.progressRating}
                      </span>
                      <span className="text-xs text-gray-500 font-medium">
                        {formData.progressRating <= 2 ? 'Behind' : 
                         formData.progressRating <= 3 ? 'On Track' : 
                         formData.progressRating <= 4 ? 'Good' : 'Excellent'}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-3">
                    <span>Behind Schedule</span>
                    <span>On Track</span>
                    <span>Exceeding Goals</span>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label required">
                  What questions do you want to discuss today?
                </label>
                <textarea
                  className={`form-textarea ${errors.questionsToDiscuss ? 'border-red-300' : ''}`}
                  value={formData.questionsToDiscuss}
                  onChange={(e) => handleInputChange('questionsToDiscuss', e.target.value)}
                  placeholder="Specific questions, decisions you need help with, areas where you're stuck..."
                  rows={3}
                />
                {errors.questionsToDiscuss && (
                  <p className="form-error">{errors.questionsToDiscuss}</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  What help do you need?
                </label>
                <textarea
                  className="form-textarea"
                  value={formData.helpNeeded}
                  onChange={(e) => handleInputChange('helpNeeded', e.target.value)}
                  placeholder="Resources, connections, feedback, guidance..."
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  What are your priorities for the next period?
                </label>
                <textarea
                  className="form-textarea"
                  value={formData.priorities}
                  onChange={(e) => handleInputChange('priorities', e.target.value)}
                  placeholder="Key tasks, learning goals, project milestones..."
                  rows={3}
                />
              </div>
            </>
          ) : (
            // Post-meeting form fields
            <>
              <div className="form-group">
                <label className="form-label required">
                  Key insights from our discussion
                </label>
                <textarea
                  className={`form-textarea ${errors.keyInsights ? 'border-red-300' : ''}`}
                  value={formData.keyInsights}
                  onChange={(e) => handleInputChange('keyInsights', e.target.value)}
                  placeholder="Important discoveries, clarifications, new perspectives..."
                  rows={4}
                />
                {errors.keyInsights && (
                  <p className="form-error">{errors.keyInsights}</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label required">
                  Action items identified
                </label>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex gap-3 mb-4">
                    <input
                      type="text"
                      className="form-input flex-1 bg-white"
                      value={actionItem}
                      onChange={(e) => setActionItem(e.target.value)}
                      placeholder="Add a specific action item (e.g., 'Research three academic sources by Friday')"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addActionItem())}
                    />
                    <button
                      type="button"
                      onClick={addActionItem}
                      className="btn btn-primary px-6"
                    >
                      Add
                    </button>
                  </div>
                  
                  {formData.actionItems.length > 0 && (
                    <div className="space-y-2">
                      {formData.actionItems.map((item, index) => (
                        <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 group hover:border-gray-300 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-gray-900">{item}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeActionItem(index)}
                            className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-200"
                            title="Remove action item"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {formData.actionItems.length === 0 && (
                    <div className="text-center py-6 text-gray-500">
                      <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p className="text-sm">No action items added yet</p>
                    </div>
                  )}
                </div>
                
                {errors.actionItems && (
                  <p className="form-error">{errors.actionItems}</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Resources/next steps discussed
                </label>
                <textarea
                  className="form-textarea"
                  value={formData.resources}
                  onChange={(e) => handleInputChange('resources', e.target.value)}
                  placeholder="Links, books, contacts, tools, next steps..."
                  rows={3}
                />
              </div>

              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">
                    Specific goals for next meeting period
                  </label>
                  <textarea
                    className="form-textarea"
                    value={formData.nextGoals}
                    onChange={(e) => handleInputChange('nextGoals', e.target.value)}
                    placeholder="Measurable objectives for next time..."
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Target completion date
                  </label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.targetDate}
                    onChange={(e) => handleInputChange('targetDate', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Success metrics
                </label>
                <textarea
                  className="form-textarea"
                  value={formData.successMetrics}
                  onChange={(e) => handleInputChange('successMetrics', e.target.value)}
                  placeholder="How will you know you've succeeded? What will success look like?"
                  rows={2}
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary px-8"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary px-8 min-w-[120px]"
            >
              {loading ? (
                <div className="loading-spinner"></div>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span className="font-semibold">Save Reflection</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReflectionForm;