/**
 * Tests for Onboarding Multi-Pathway Functionality (Phase 2.1)
 * 
 * These tests verify the onboarding form handles multi-pathway selection correctly.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OnboardingForm from '../components/shared/OnboardingForm';

// Mock Firebase functions
jest.mock('../../services/firebase', () => ({
  saveUserOnboarding: jest.fn(),
  getAdvisorsByPathwaysWithOverlap: jest.fn(),
  setAdvisorPathways: jest.fn(),
}));

const mockUser = {
  uid: 'test-user-id',
  email: 'test@bwscampus.com',
  displayName: 'Test User'
};

const mockOnComplete = jest.fn();

describe('OnboardingForm Multi-Pathway Support', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render advisor multi-pathway selection', async () => {
    render(<OnboardingForm user={mockUser} onComplete={mockOnComplete} />);
    
    // Select advisor role
    const advisorButton = screen.getByText('Advisor');
    fireEvent.click(advisorButton);
    
    // Should show multi-pathway selection
    await waitFor(() => {
      expect(screen.getByText('Select pathways')).toBeInTheDocument();
      expect(screen.getByText('Select all pathways you can advise (you can change this later)')).toBeInTheDocument();
    });
    
    // Should show checkboxes for each pathway
    expect(screen.getByLabelText(/Entrepreneurship/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Design & Fabrication/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Applied Science/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Arts & Humanities/)).toBeInTheDocument();
  });

  test('should render student single pathway selection', async () => {
    render(<OnboardingForm user={mockUser} onComplete={mockOnComplete} />);
    
    // Select student role
    const studentButton = screen.getByText('Student');
    fireEvent.click(studentButton);
    
    // Should show single pathway selection
    await waitFor(() => {
      expect(screen.getByText('Select pathway')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });

  test('should validate advisor pathway selection', async () => {
    render(<OnboardingForm user={mockUser} onComplete={mockOnComplete} />);
    
    // Select advisor role
    const advisorButton = screen.getByText('Advisor');
    fireEvent.click(advisorButton);
    
    // Try to proceed without selecting pathways
    await waitFor(() => {
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);
    });
    
    // Should show error
    await waitFor(() => {
      expect(screen.getByText('Please select at least one pathway')).toBeInTheDocument();
    });
  });

  test('should allow advisor to select multiple pathways', async () => {
    render(<OnboardingForm user={mockUser} onComplete={mockOnComplete} />);
    
    // Select advisor role
    const advisorButton = screen.getByText('Advisor');
    fireEvent.click(advisorButton);
    
    // Select multiple pathways
    await waitFor(() => {
      const entrepreneurshipCheckbox = screen.getByLabelText(/Entrepreneurship/);
      const designCheckbox = screen.getByLabelText(/Design & Fabrication/);
      
      fireEvent.click(entrepreneurshipCheckbox);
      fireEvent.click(designCheckbox);
      
      expect(entrepreneurshipCheckbox).toBeChecked();
      expect(designCheckbox).toBeChecked();
    });
  });

  test('should show advisor overlay ranking with pathway badges', async () => {
    const mockAdvisors = [
      {
        id: 'advisor1',
        name: 'Dr. Smith',
        pathways: ['Entrepreneurship', 'Design & Fabrication'],
        overlapCount: 1
      },
      {
        id: 'advisor2', 
        name: 'Dr. Jones',
        pathways: ['Entrepreneurship'],
        overlapCount: 1
      }
    ];

    const { getAdvisorsByPathwaysWithOverlap } = require('../../services/firebase');
    getAdvisorsByPathwaysWithOverlap.mockResolvedValue(mockAdvisors);

    render(<OnboardingForm user={mockUser} onComplete={mockOnComplete} />);
    
    // Select student role and pathway
    const studentButton = screen.getByText('Student');
    fireEvent.click(studentButton);
    
    await waitFor(() => {
      const pathwaySelect = screen.getByRole('combobox');
      fireEvent.change(pathwaySelect, { target: { value: 'Entrepreneurship' } });
    });

    // Proceed to advisor selection
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    // Should show advisors with pathway badges and match counts
    await waitFor(() => {
      expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
      expect(screen.getByText('Dr. Jones')).toBeInTheDocument();
      expect(screen.getByText('1 match')).toBeInTheDocument();
    });
  });
});