import React from 'react';

const SegmentedControl = ({ 
  options, 
  value, 
  onChange, 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm', 
    lg: 'px-6 py-3 text-base'
  };

  return (
    <div className="inline-flex bg-gray-100 rounded-lg p-1">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`${sizeClasses[size]} font-medium rounded-md transition-all duration-200 whitespace-nowrap ${
            value === option.value
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {option.label}
          {option.count !== undefined && option.count > 0 && (
            <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
              value === option.value
                ? 'bg-gray-200 text-gray-700'
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