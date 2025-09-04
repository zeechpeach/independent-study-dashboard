import React, { useState, useEffect } from 'react';
import { User, GraduationCap } from 'lucide-react';
import { saveUserOnboarding, getAdvisorsByPathwaysWithOverlap, setAdvisorPathways } from '../../services/firebase';

const OnboardingForm = ({ user, onComplete }) => {
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState('');
  const [formData, setFormData] = useState({
    pathway: '',
    pathways: [], // For multi-pathway selection for advisors
    advisor: '',
    projectDescription: '',
    schedulingTool: ''
  });
  const [advisors, setAdvisors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const pathways = [
    'Entrepreneurship',
    'Design & Fabrication',
    'Applied Science',
    'Arts & Humanities'
  ];

  // Fetch advisors when pathway is selected (for students)
  useEffect(() => {
    const fetchAdvisors = async () => {
      if (formData.pathway && userType === 'student') {
        try {
          // Use new ANY overlap logic for advisor selection
          const pathwayAdvisors = await getAdvisorsByPathwaysWithOverlap([formData.pathway]);
          setAdvisors(pathwayAdvisors);
        } catch (error) {
          console.error('Error fetching advisors:', error);
          setAdvisors([]);
        }
      }
    };

    fetchAdvisors();
  }, [formData.pathway, userType]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    if (step === 1 && !userType) {
      setError('Please select your role');
      return;
    }
    if (step === 2) {
      if (userType === 'student' && !formData.pathway) {
        setError('Please select your pathway');
        return;
      }
      if (userType === 'advisor' && formData.pathways.length === 0) {
        setError('Please select at least one pathway');
        return;
      }
    }
    if (step === 3) {
      if (userType === 'student' && !formData.advisor) {
        setError('Please select an advisor');
        return;
      }
      if (userType === 'student' && !formData.projectDescription.trim()) {
        setError('Please describe your project');
        return;
      }
    }
    
    setError('');
    setStep(prev => prev + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    
    // Validate required fields before submission
    try {
      if (!user || !user.uid) {
        throw new Error('User authentication required');
      }
      
      if (!userType) {
        throw new Error('User type is required');
      }
      
      if (userType === 'student') {
        if (!formData.pathway) {
          throw new Error('Pathway selection is required for students');
        }
        if (!formData.advisor) {
          throw new Error('Advisor selection is required for students');
        }
        if (!formData.projectDescription.trim()) {
          throw new Error('Project description is required for students');
        }
      } else if (userType === 'advisor') {
        if (formData.pathways.length === 0) {
          throw new Error('At least one pathway is required for advisors');
        }
      }
      
      const onboardingData = {
        userType,
        // For students, save single pathway; for advisors, save first pathway for legacy compatibility
        pathway: userType === 'student' ? formData.pathway : (formData.pathways[0] || ''),
        ...(userType === 'student' ? {
          advisor: formData.advisor,
          projectDescription: formData.projectDescription
        } : {
          schedulingTool: formData.schedulingTool || ''
        }),
        onboardingComplete: true,
        createdAt: new Date()
      };
      
      await saveUserOnboarding(user.uid, onboardingData);
      
      // For advisors, also save multi-pathway data in join table
      if (userType === 'advisor' && formData.pathways.length > 0) {
        await setAdvisorPathways(user.uid, formData.pathways);
      }
      
      onComplete();
    } catch (error) {
      let errorMessage = 'Failed to save onboarding information. Please try again.';
      
      // Provide more specific error messages for common issues
      if (error.message.includes('authentication') || error.message.includes('User authentication')) {
        errorMessage = 'Please sign in again to complete onboarding.';
      } else if (error.message.includes('required')) {
        errorMessage = error.message;
      } else if (error.message.includes('permission-denied')) {
        errorMessage = 'You do not have permission to complete onboarding. Please contact an administrator.';
      } else if (error.message.includes('unavailable')) {
        errorMessage = 'Service is temporarily unavailable. Please check your internet connection and try again.';
      }
      
      setError(errorMessage);
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
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Welcome to Independent Study!
          </h1>
          <p className="text-sm text-gray-600">
            Let's set up your account
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-6">
          {[1, 2, 3].map((stepNumber) => (
            <React.Fragment key={stepNumber}>
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                  step >= stepNumber
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {stepNumber}
              </div>
              {stepNumber < 3 && (
                <div
                  className={`w-8 h-0.5 transition-colors ${
                    step > stepNumber ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Form Content */}
        <div className="card p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-xs">{error}</p>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="text-base font-semibold mb-3 text-center">What's your role?</h2>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setUserType('student');
                    if (step === 1) {
                      setError('');
                      setStep(2);
                    }
                  }}
                  className={`w-full p-3 border-2 rounded-lg text-left transition-all ${
                    userType === 'student'
                      ? 'border-green-600 bg-green-50 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      userType === 'student' ? 'bg-green-600' : 'bg-gray-100'
                    }`}>
                      <GraduationCap className={`w-4 h-4 ${
                        userType === 'student' ? 'text-white' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="font-medium text-sm">Student</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setUserType('advisor');
                    if (step === 1) {
                      setError('');
                      setStep(2);
                    }
                  }}
                  className={`w-full p-3 border-2 rounded-lg text-left transition-all ${
                    userType === 'advisor'
                      ? 'border-green-600 bg-green-50 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      userType === 'advisor' ? 'bg-green-600' : 'bg-gray-100'
                    }`}>
                      <User className={`w-4 h-4 ${
                        userType === 'advisor' ? 'text-white' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="font-medium text-sm">Advisor</div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-base font-semibold mb-3">
                Select {userType === 'advisor' ? 'pathways' : 'pathway'}
              </h2>
              
              {userType === 'student' ? (
                <div className="form-group">
                  <select
                    value={formData.pathway}
                    onChange={(e) => handleInputChange('pathway', e.target.value)}
                    className="form-select text-sm"
                  >
                    <option value="">Choose a pathway...</option>
                    {pathways.map((pathway) => (
                      <option key={pathway} value={pathway}>
                        {pathway}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                // Multi-pathway selection for advisors
                <div className="space-y-2">
                  <p className="text-xs text-gray-600 mb-3">
                    Select all pathways you can advise (you can change this later)
                  </p>
                  {pathways.map((pathway) => (
                    <label key={pathway} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.pathways.includes(pathway)}
                        onChange={(e) => {
                          const newPathways = e.target.checked
                            ? [...formData.pathways, pathway]
                            : formData.pathways.filter(p => p !== pathway);
                          handleInputChange('pathways', newPathways);
                        }}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm">{pathway}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 3 && userType === 'student' && (
            <div className="space-y-3">
              <h2 className="text-base font-semibold">Student info</h2>
              
              <div className="form-group">
                <label className="form-label required text-xs">Choose advisor</label>
                {advisors.length === 0 && formData.pathway ? (
                  <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="text-sm text-gray-600 text-center">
                      No advisors found. Contact zchien@bwscampus.com
                    </div>
                  </div>
                ) : advisors.length === 0 ? (
                  <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="text-sm text-gray-600 text-center">
                      Loading advisors...
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {advisors.map((advisor) => (
                      <div
                        key={advisor.id}
                        onClick={() => handleInputChange('advisor', advisor.name)}
                        className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.advisor === advisor.name
                            ? 'border-green-600 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-sm">{advisor.name}</h3>
                              {advisor.overlapCount > 0 && (
                                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                                  {advisor.overlapCount} match{advisor.overlapCount > 1 ? 'es' : ''}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {advisor.pathways?.map((pathway) => (
                                <span
                                  key={pathway}
                                  className={`px-2 py-1 text-xs rounded-full ${
                                    pathway === formData.pathway
                                      ? 'bg-green-100 text-green-800 border border-green-200'
                                      : 'bg-gray-100 text-gray-700'
                                  }`}
                                >
                                  {pathway}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 ${
                            formData.advisor === advisor.name
                              ? 'border-green-600 bg-green-600'
                              : 'border-gray-300'
                          }`}>
                            {formData.advisor === advisor.name && (
                              <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label required text-xs">Project description</label>
                <textarea
                  value={formData.projectDescription}
                  onChange={(e) => handleInputChange('projectDescription', e.target.value)}
                  placeholder="Describe your project (2-3 sentences)"
                  className="form-textarea text-sm"
                  rows="3"
                />
              </div>
            </div>
          )}

          {step === 3 && userType === 'advisor' && (
            <div className="space-y-3">
              <h2 className="text-base font-semibold">Advisor info</h2>
              
              <div className="form-group">
                <label className="form-label text-xs">Calendly link (optional)</label>
                <input
                  type="url"
                  value={formData.schedulingTool}
                  onChange={(e) => handleInputChange('schedulingTool', e.target.value)}
                  placeholder="https://calendly.com/username"
                  className="form-input text-sm"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Students will use this to book meetings
                </div>
              </div>
              
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-xs text-blue-800">
                  <strong>Note:</strong> Your account needs admin approval for full access.
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-2 mt-4">
            {step > 1 && (
              <button
                onClick={() => setStep(prev => prev - 1)}
                className="btn btn-secondary btn-sm"
                disabled={loading}
              >
                Back
              </button>
            )}
            
            {step < 3 && step > 1 ? (
              <button
                onClick={handleNext}
                className="btn btn-primary btn-sm flex-1"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || (userType === 'student' && advisors.length === 0)}
                className="btn btn-primary btn-sm flex-1"
              >
                {loading ? (
                  <div className="loading-spinner" />
                ) : (
                  'Complete'
                )}
              </button>
            )}
          </div>
        </div>

        {/* Help */}
        <div className="text-center mt-4">
          <p className="text-xs text-gray-500">
            Need help? Contact{' '}
            <a 
              href="mailto:zchien@bwscampus.com" 
              className="text-blue-600 hover:text-blue-700"
            >
              zchien@bwscampus.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OnboardingForm;