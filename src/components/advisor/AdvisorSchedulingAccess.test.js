/**
 * Tests for Meeting Scheduling Access Control (Phase 2.1)
 * 
 * These tests verify that advisors cannot schedule meetings while students retain
 * full meeting scheduling capabilities.
 */

import { render, screen } from '@testing-library/react';
import AdvisorDashboard from '../../pages/AdvisorDashboard';

// Mock the feature flags
jest.mock('../../config/featureFlags.ts', () => ({
  isAdvisorLayoutV2Enabled: () => true,
  isAdvisorStudentListPreviewEnabled: () => false,
}));

// Mock Firebase functions
jest.mock('../../services/firebase', () => ({
  getAdvisorDashboardData: jest.fn(() => Promise.resolve({
    totalStudents: 0,
    activeStudents: 0,
    weeklyMeetings: 0,
    pendingReflections: 0,
    activeGoals: 0,
    overdueItems: 0
  })),
}));

const mockUser = {
  uid: 'test-advisor-id',
  email: 'advisor@bwscampus.com',
  displayName: 'Dr. Test Advisor'
};

const mockAdvisorProfile = {
  userType: 'advisor',
  name: 'Dr. Test Advisor',
  isAdmin: true
};

describe('Meeting Scheduling Access Control', () => {
  test('Advisor dashboard should not show Schedule Meetings button', async () => {
    render(
      <AdvisorDashboard 
        user={mockUser} 
        userProfile={mockAdvisorProfile}
        onBack={() => {}}
      />
    );
    
    // Wait for component to load
    await screen.findByText('Advisor Dashboard');
    
    // Schedule Meetings button should not be present
    expect(screen.queryByText('Schedule Meetings')).not.toBeInTheDocument();
    
    // Other buttons should still be present
    expect(screen.queryByText('Review Reflections')).toBeInTheDocument();
    expect(screen.queryByText('Progress Reports')).toBeInTheDocument();
  });

  test('Advisor dashboard should show read-only meeting statistics', async () => {
    render(
      <AdvisorDashboard 
        user={mockUser} 
        userProfile={mockAdvisorProfile}
        onBack={() => {}}
      />
    );
    
    // Should show meeting statistics but not creation capabilities
    await screen.findByText(/meetings held this week/i);
    
    // Should not have any meeting creation UI
    expect(screen.queryByText(/schedule meeting/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/create meeting/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/book meeting/i)).not.toBeInTheDocument();
  });
});

describe('Student Meeting Scheduling (Verification)', () => {
  test('Student dashboard should retain meeting scheduling capabilities', () => {
    // This is a verification test to ensure we didn't break student functionality
    // We test that the student meeting scheduling imports are still available
    
    const firebase = require('../../services/firebase');
    
    // Verify student can still create meetings
    expect(typeof firebase.createMeeting).toBe('function');
    expect(typeof firebase.updateMeeting).toBe('function');
    expect(typeof firebase.getUserMeetings).toBe('function');
  });
});