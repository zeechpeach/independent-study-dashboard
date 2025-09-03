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
      className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${
        isPrimary 
          ? 'bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-300' 
          : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          isPrimary 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-100 text-gray-600'
        }`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className={`font-medium ${
            isPrimary ? 'text-blue-900' : 'text-gray-900'
          }`}>
            {title}
          </h3>
          {subtitle && (
            <p className={`text-sm ${
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