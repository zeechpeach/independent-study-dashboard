import React from 'react';

const Card = ({ 
  children, 
  className = '',
  variant = 'default',
  padding = 'md',
  ...props 
}) => {
  const baseClasses = 'bg-white rounded-lg border border-gray-200 shadow-card transition-all';
  
  const variantClasses = {
    default: 'hover:shadow-md hover:border-gray-300',
    elevated: 'shadow-lg',
    bordered: 'border-2',
    ghost: 'border-transparent shadow-none bg-transparent'
  };
  
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${className}`;

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`flex justify-between items-start mb-4 gap-4 ${className}`} 
      {...props}
    >
      {children}
    </div>
  );
};

const CardTitle = ({ children, className = '', ...props }) => {
  return (
    <h3 
      className={`text-lg font-semibold text-gray-900 leading-tight ${className}`} 
      {...props}
    >
      {children}
    </h3>
  );
};

const CardBody = ({ children, className = '', ...props }) => {
  return (
    <div className={`${className}`} {...props}>
      {children}
    </div>
  );
};

const CardFooter = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`mt-4 pt-4 border-t border-gray-100 ${className}`} 
      {...props}
    >
      {children}
    </div>
  );
};

// Export main component and sub-components
Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;