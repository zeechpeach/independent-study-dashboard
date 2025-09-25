import React, { useState } from 'react';
import { GraduationCap } from 'lucide-react';
import { saveUserOnboarding } from '../../services/firebase';

const OnboardingForm = ({ user, onComplete }) => {
  const [formData, setFormData] = useState({
    projectDescription: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    setError('');
    
    // Validate project description
    if (!formData.projectDescription.trim()) {
      setError('Project description is required');
      return;
    }

    setLoading(true);

    try {
      await saveUserOnboarding(user.uid, {
        projectDescription: formData.projectDescription.trim()
      });
      
      onComplete();
    } catch (error) {
      setError(error.message || 'Failed to save onboarding information');
      console.error('Onboarding error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg mx-auto">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Welcome to Independent Study!
          </h1>
          <p className="text-sm text-gray-600">
            Tell us about your project to get started
          </p>
        </div>

        {/* Form Content */}
        <div className="card p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="projectDescription" className="form-label required text-sm font-medium text-gray-700 mb-2 block">
                Project Description
              </label>
              <textarea
                id="projectDescription"
                value={formData.projectDescription}
                onChange={(e) => handleInputChange('projectDescription', e.target.value)}
                placeholder="Describe your independent study project, goals, and what you hope to accomplish..."
                rows={6}
                className="form-textarea w-full text-sm resize-none border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                This helps your advisor understand your project and provide better guidance.
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6">
            <button
              onClick={handleSubmit}
              disabled={loading || !formData.projectDescription.trim()}
              className="btn btn-primary w-full"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="loading-spinner" />
                  Setting up your account...
                </div>
              ) : (
                'Complete Setup'
              )}
            </button>
          </div>

          {/* Info Note */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>Note:</strong> You've been automatically assigned to work with your advisor. 
              You can book meetings and track your progress once setup is complete.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingForm;