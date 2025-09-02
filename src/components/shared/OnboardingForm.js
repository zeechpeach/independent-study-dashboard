import React, { useState, useEffect } from 'react';
import { User, GraduationCap } from 'lucide-react';
import { saveUserOnboarding, getAdvisorsByPathway } from '../../services/firebase';

const OnboardingForm = ({ user, onComplete }) => {
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState('');
  const [formData, setFormData] = useState({
    pathway: '',
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

  // Fetch advisors when pathway is selected
  useEffect(() => {
    const fetchAdvisors = async () => {
      if (formData.pathway && userType === 'student') {
        try {
          const pathwayAdvisors = await getAdvisorsByPathway(formData.pathway);
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
    if (step === 2 && !formData.pathway) {
      setError('Please select your pathway');
      return;
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
    
    try {
      const onboardingData = {
        userType,
        pathway: formData.pathway,
        ...(userType === 'student' ? {
          advisor: formData.advisor,
          projectDescription: formData.projectDescription
        } : {
          schedulingTool: formData.schedulingTool
        }),
        onboardingComplete: true,
        createdAt: new Date()
      };
      
      await saveUserOnboarding(user.uid, onboardingData);
      onComplete();
    } catch (error) {
      setError('Failed to save onboarding information. Please try again.');
      console.error('Onboarding error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-xs">
        
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
                  onClick={() => setUserType('student')}
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
                  onClick={() => setUserType('advisor')}
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
              <h2 className="text-base font-semibold mb-3">Select pathway</h2>
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
            </div>
          )}

          {step === 3 && userType === 'student' && (
            <div className="space-y-3">
              <h2 className="text-base font-semibold">Student info</h2>
              
              <div className="form-group">
                <label className="form-label required text-xs">Choose advisor</label>
                <select
                  value={formData.advisor}
                  onChange={(e) => handleInputChange('advisor', e.target.value)}
                  className="form-select text-sm"
                  disabled={advisors.length === 0}
                >
                  <option value="">
                    {advisors.length === 0 ? 'Loading...' : 'Select advisor...'}
                  </option>
                  {advisors.map((advisor) => (
                    <option key={advisor.id} value={advisor.name}>
                      {advisor.name}
                    </option>
                  ))}
                </select>
                {advisors.length === 0 && formData.pathway && (
                  <div className="text-xs text-gray-500 mt-1">
                    No advisors found. Contact zchien@bwscampus.com
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
            
            {step < 3 ? (
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