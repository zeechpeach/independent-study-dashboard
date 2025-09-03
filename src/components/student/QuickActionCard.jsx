import React from 'react';

const QuickActionCard = ({ 
  icon: Icon, 
  title, 
  subtitle, 
  onClick, 
  isPrimary = false 
}) => {
  return (
    <div 
      className={`group p-6 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 active:scale-95 ${
        isPrimary 
          ? 'bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-300' 
          : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
      }`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-active:scale-95 ${
          isPrimary 
            ? 'bg-blue-600 text-white shadow-lg' 
            : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
        }`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-base transition-colors duration-200 mb-1 ${
            isPrimary ? 'text-blue-900' : 'text-gray-900 group-hover:text-blue-600'
          }`}>
            {title}
          </h3>
          {subtitle && (
            <p className={`text-sm transition-colors duration-200 ${
              isPrimary ? 'text-blue-700' : 'text-gray-600'
            }`}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickActionCard;

export default QuickActionCard;