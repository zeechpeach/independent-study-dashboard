import React from 'react';

const Skeleton = ({ 
  className = '', 
  width = '100%', 
  height = '1rem',
  rounded = 'rounded' 
}) => {
  return (
    <div 
      className={`bg-gray-200 animate-pulse ${rounded} ${className}`}
      style={{ width, height }}
    />
  );
};

const SkeletonCard = () => {
  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg">
      <div className="flex items-start justify-between mb-3">
        <Skeleton width="60%" height="1.25rem" className="mb-2" />
        <Skeleton width="60px" height="20px" rounded="rounded-full" />
      </div>
      <Skeleton width="100%" height="0.875rem" className="mb-2" />
      <Skeleton width="80%" height="0.875rem" className="mb-2" />
      <Skeleton width="120px" height="0.75rem" />
    </div>
  );
};

const SkeletonQuickAction = () => {
  return (
    <div className="p-4 border border-gray-200 rounded-lg">
      <div className="flex items-center gap-3">
        <Skeleton width="40px" height="40px" rounded="rounded-full" />
        <div className="flex-1">
          <Skeleton width="120px" height="1rem" className="mb-1" />
          <Skeleton width="80px" height="0.75rem" />
        </div>
      </div>
    </div>
  );
};

export default Skeleton;
export { SkeletonCard, SkeletonQuickAction };