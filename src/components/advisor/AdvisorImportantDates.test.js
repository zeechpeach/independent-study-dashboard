/**
 * Test for AdvisorImportantDates component
 * 
 * Tests the fallback logic for user.id vs user.uid
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdvisorImportantDates from './AdvisorImportantDates';

// Mock Firebase functions
jest.mock('../../services/firebase', () => ({
  getAdvisorImportantDates: jest.fn(),
  createImportantDate: jest.fn(),
  updateImportantDate: jest.fn(),
  deleteImportantDate: jest.fn()
}));

// Mock ImportantDatesManager component
jest.mock('../dates/ImportantDatesManager', () => {
  return function MockImportantDatesManager({ currentUserId }) {
    return <div data-testid="important-dates-manager">Manager loaded with userId: {currentUserId}</div>;
  };
});

const { getAdvisorImportantDates } = require('../../services/firebase');

describe('AdvisorImportantDates', () => {
  const mockOnBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should work with user.id property', async () => {
    const userWithId = {
      id: 'advisor_123',
      name: 'Test Advisor'
    };
    
    getAdvisorImportantDates.mockResolvedValue([]);

    render(
      <AdvisorImportantDates
        user={userWithId}
        onBack={mockOnBack}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('important-dates-manager')).toBeInTheDocument();
    });

    expect(getAdvisorImportantDates).toHaveBeenCalledWith('advisor_123');
  });

  test('should work with user.uid property when user.id is missing', async () => {
    const userWithUid = {
      uid: 'advisor_456',
      name: 'Test Advisor'
    };
    
    getAdvisorImportantDates.mockResolvedValue([]);

    render(
      <AdvisorImportantDates
        user={userWithUid}
        onBack={mockOnBack}
      />
    );

    // This test should currently fail before our fix
    // The component should get stuck in loading state
    await waitFor(() => {
      expect(screen.getByTestId('important-dates-manager')).toBeInTheDocument();
    }, { timeout: 1000 });

    expect(getAdvisorImportantDates).toHaveBeenCalledWith('advisor_456');
  });

  test('should handle user with both id and uid (prefer id)', async () => {
    const userWithBoth = {
      id: 'advisor_123',
      uid: 'advisor_456',
      name: 'Test Advisor'
    };
    
    getAdvisorImportantDates.mockResolvedValue([]);

    render(
      <AdvisorImportantDates
        user={userWithBoth}
        onBack={mockOnBack}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('important-dates-manager')).toBeInTheDocument();
    });

    // Should prefer user.id when both are available
    expect(getAdvisorImportantDates).toHaveBeenCalledWith('advisor_123');
  });

  test('should show error when neither id nor uid is available', async () => {
    const userWithoutIds = {
      name: 'Test Advisor'
    };

    render(
      <AdvisorImportantDates
        user={userWithoutIds}
        onBack={mockOnBack}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('No advisor ID available')).toBeInTheDocument();
    });

    expect(getAdvisorImportantDates).not.toHaveBeenCalled();
  });
});