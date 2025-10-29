import React from 'react';

/**
 * DashboardGrid - Responsive grid layout component
 * 
 * Provides a responsive 2-column layout for dashboard content with
 * automatic stacking on mobile devices. Replaces legacy .dashboard-layout,
 * .dashboard-main, and .dashboard-sidebar classes.
 */
const DashboardGrid = ({ children, className = '' }) => {
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 items-start ${className}`}>
      {children}
    </div>
  );
};

/**
 * DashboardGrid.Main - Main content area
 * 
 * Takes up 2/3 of the grid on large screens, full width on mobile.
 * Replaces legacy .dashboard-main class.
 */
DashboardGrid.Main = ({ children, className = '' }) => {
  return (
    <div className={`lg:col-span-2 space-y-4 sm:space-y-6 min-w-0 ${className}`}>
      {children}
    </div>
  );
};

/**
 * DashboardGrid.Sidebar - Sidebar content area
 * 
 * Takes up 1/3 of the grid on large screens, full width on mobile.
 * Replaces legacy .dashboard-sidebar class.
 * Uses self-start to align at top while maintaining consistent bottom edges.
 */
DashboardGrid.Sidebar = ({ children, className = '' }) => {
  return (
    <div className={`lg:col-span-1 space-y-4 sm:space-y-6 min-w-0 lg:min-w-80 lg:self-start ${className}`}>
      {children}
    </div>
  );
};

/**
 * GridContainer - Generic responsive grid container
 * 
 * Provides responsive grid layouts with different column counts.
 * Replaces legacy .grid-2, .grid-3, .grid-4 classes.
 */
export const GridContainer = ({ 
  children, 
  cols = 2, 
  gap = 4, 
  className = '',
  minItemWidth = '320px' 
}) => {
  // Convert cols number to Tailwind classes with better mobile handling
  const getGridCols = (cols) => {
    const colsMap = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
      6: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
    };
    return colsMap[cols] || 'grid-cols-1 sm:grid-cols-2';
  };

  // Convert gap number to Tailwind classes with responsive gaps
  const getGap = (gap) => {
    const gapMap = {
      2: 'gap-2',
      3: 'gap-3 sm:gap-4', 
      4: 'gap-3 sm:gap-4',
      6: 'gap-4 sm:gap-6',
      8: 'gap-4 sm:gap-8'
    };
    return gapMap[gap] || 'gap-3 sm:gap-4';
  };

  const gridClasses = `grid ${getGridCols(cols)} ${getGap(gap)} ${className}`;

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
};

export default DashboardGrid;