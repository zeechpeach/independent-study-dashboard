import React, { useRef } from 'react';

const SegmentedControl = ({ 
  options, 
  value, 
  onChange, 
  size = 'md' 
}) => {
  const containerRef = useRef(null);
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm', 
    lg: 'px-6 py-3 text-base'
  };

  // Handle keyboard navigation
  const handleKeyDown = (event, optionValue) => {
    const currentIndex = options.findIndex(opt => opt.value === value);
    let newIndex = currentIndex;

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        newIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
        break;
      case 'ArrowRight':
        event.preventDefault();
        newIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        newIndex = options.length - 1;
        break;
      default:
        return;
    }

    onChange(options[newIndex].value);
  };

  return (
    <div 
      ref={containerRef}
      role="radiogroup" 
      className="inline-flex bg-gray-100 rounded-lg p-1"
    >
      {options.map((option, index) => (
        <button
          key={option.value}
          role="radio"
          aria-checked={value === option.value}
          tabIndex={value === option.value ? 0 : -1}
          onClick={() => onChange(option.value)}
          onKeyDown={(e) => handleKeyDown(e, option.value)}
          className={`${sizeClasses[size]} font-medium rounded-md transition-all duration-200 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
            value === option.value
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <span>{option.label}</span>
          {option.count !== undefined && option.count > 0 && (
            <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full font-medium ${
              value === option.value
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}>
              {option.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default SegmentedControl;