import React from 'react';
import DashboardGrid, { GridContainer } from './DashboardGrid';

/**
 * AdvisorDashboardGrid - Advisor-specific dashboard grid layout
 * 
 * Provides a specialized grid layout optimized for advisor workflows.
 * Extends the base DashboardGrid with advisor-specific spacing and organization.
 */
const AdvisorDashboardGrid = ({ children, className = '' }) => {
  return (
    <DashboardGrid className={`advisor-layout ${className}`}>
      {children}
    </DashboardGrid>
  );
};

/**
 * AdvisorDashboardGrid.Main - Main content area for advisor layout
 * 
 * Optimized for advisor workflow with wider content area for student oversight.
 */
AdvisorDashboardGrid.Main = ({ children, className = '' }) => {
  return (
    <DashboardGrid.Main className={`advisor-main ${className}`}>
      {children}
    </DashboardGrid.Main>
  );
};

/**
 * AdvisorDashboardGrid.Sidebar - Sidebar area for advisor tools
 * 
 * Contains advisor-specific quick actions and overview panels.
 */
AdvisorDashboardGrid.Sidebar = ({ children, className = '' }) => {
  return (
    <DashboardGrid.Sidebar className={`advisor-sidebar ${className}`}>
      {children}
    </DashboardGrid.Sidebar>
  );
};

/**
 * AdvisorGridContainer - Grid container optimized for advisor content
 * 
 * Provides responsive grid layouts with advisor-optimized defaults.
 */
export const AdvisorGridContainer = ({ 
  children, 
  cols = 2, 
  gap = 6, 
  className = '',
  minItemWidth = '300px' 
}) => {
  return (
    <GridContainer 
      cols={cols}
      gap={gap}
      className={`advisor-grid ${className}`}
      minItemWidth={minItemWidth}
    >
      {children}
    </GridContainer>
  );
};

export default AdvisorDashboardGrid;