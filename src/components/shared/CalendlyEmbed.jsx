import React, { useEffect } from 'react';
import Modal from '../ui/Modal';

const CalendlyEmbed = ({ 
  isOpen, 
  onClose, 
  schedulingLink, 
  userName = 'Student' 
}) => {
  useEffect(() => {
    if (isOpen && window.Calendly) {
      // Initialize Calendly widget if library is available
      window.Calendly.initInlineWidget({
        url: schedulingLink,
        parentElement: document.getElementById('calendly-inline-widget'),
        prefill: {
          name: userName,
        },
        utm: {},
      });
    }
  }, [isOpen, schedulingLink, userName]);

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule a Meeting"
      size="xl"
    >
      <div className="h-96">
        {/* Fallback iframe if Calendly widget library isn't available */}
        <iframe
          src={schedulingLink}
          width="100%"
          height="100%"
          frameBorder="0"
          title="Schedule a meeting"
          className="rounded-lg"
        />
      </div>
      
      {/* Alternative: Simple link if iframe doesn't work */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600 mb-2">
          Having trouble with the scheduler above?
        </p>
        <a
          href={schedulingLink}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
        >
          Open in New Tab
        </a>
      </div>
    </Modal>
  );
};

export default CalendlyEmbed;