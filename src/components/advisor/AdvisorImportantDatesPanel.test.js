/**
 * Integration test for Advisor Important Dates functionality
 * 
 * Tests the integration between AdvisorDashboard and AdvisorImportantDatesPanel
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import AdvisorImportantDatesPanel from './AdvisorImportantDatesPanel';

// Mock Firebase functions
jest.mock('../../services/firebase', () => ({
  getAdvisorImportantDates: jest.fn()
}));

const { getAdvisorImportantDates } = require('../../services/firebase');

describe('Advisor Important Dates Integration', () => {
  const mockUserProfile = {
    id: 'advisor_123',
    name: 'Test Advisor',
    userType: 'advisor',
    isAdmin: true
  };

  const mockOnManageClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('AdvisorImportantDatesPanel renders correctly with empty state', async () => {
    getAdvisorImportantDates.mockResolvedValue([]);

    render(
      <AdvisorImportantDatesPanel
        userProfile={mockUserProfile}
        onManageClick={mockOnManageClick}
      />
    );

    // Should show loading initially
    expect(screen.getByText('Important Dates')).toBeTruthy();
    
    // Wait for empty state
    await screen.findByText('No upcoming important dates');
    expect(screen.getByText('Create your first date')).toBeTruthy();
  });

  test('Manage button calls onManageClick callback', async () => {
    getAdvisorImportantDates.mockResolvedValue([]);

    render(
      <AdvisorImportantDatesPanel
        userProfile={mockUserProfile}
        onManageClick={mockOnManageClick}
      />
    );

    // Wait for component to load
    await screen.findByText('No upcoming important dates');

    // Click manage button
    const manageButton = screen.getByText('Manage');
    manageButton.click();

    expect(mockOnManageClick).toHaveBeenCalledTimes(1);
  });

  test('Component calls getAdvisorImportantDates with correct advisor ID', async () => {
    getAdvisorImportantDates.mockResolvedValue([]);

    render(
      <AdvisorImportantDatesPanel
        userProfile={mockUserProfile}
        onManageClick={mockOnManageClick}
      />
    );

    // Wait for API call
    await screen.findByText('No upcoming important dates');

    expect(getAdvisorImportantDates).toHaveBeenCalledWith('advisor_123');
  });
});