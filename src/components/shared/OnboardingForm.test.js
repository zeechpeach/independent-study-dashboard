/**
 * Tests for Simplified Onboarding Form
 * 
 * These tests verify the simplified onboarding form for student project descriptions.
 */

import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OnboardingForm from './OnboardingForm';

// Mock Firebase functions
jest.mock('../../services/firebase', () => ({
  saveUserOnboarding: jest.fn(),
}));

const mockUser = {
  uid: 'test-user-id',
  email: 'student@bwscampus.com',
  displayName: 'Test Student'
};

const mockOnComplete = jest.fn();

describe('OnboardingForm Simplified', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render simplified onboarding form with project description field', () => {
    render(<OnboardingForm user={mockUser} onComplete={mockOnComplete} />);
    
    // Should show the header
    expect(screen.getByText('Welcome to Independent Study!')).toBeInTheDocument();
    expect(screen.getByText('Tell us about your project to get started')).toBeInTheDocument();
    
    // Should show project description field
    expect(screen.getByLabelText(/Project Description/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Describe your independent study project/)).toBeInTheDocument();
    
    // Should show submit button (initially disabled)
    expect(screen.getByText('Complete Setup')).toBeInTheDocument();
    expect(screen.getByText('Complete Setup')).toBeDisabled();
  });

  test('should enable submit button when project description is entered', async () => {
    render(<OnboardingForm user={mockUser} onComplete={mockOnComplete} />);
    
    const projectDescriptionField = screen.getByLabelText(/Project Description/);
    const submitButton = screen.getByText('Complete Setup');
    
    // Initially disabled
    expect(submitButton).toBeDisabled();
    
    // Enter project description
    fireEvent.change(projectDescriptionField, {
      target: { value: 'My independent study project focuses on machine learning applications.' }
    });
    
    // Should be enabled now
    expect(submitButton).not.toBeDisabled();
  });

  test('should keep submit button disabled when project description is empty or whitespace', async () => {
    render(<OnboardingForm user={mockUser} onComplete={mockOnComplete} />);
    
    const projectDescriptionField = screen.getByLabelText(/Project Description/);
    const submitButton = screen.getByText('Complete Setup');
    
    // Initially disabled
    expect(submitButton).toBeDisabled();
    
    // Still disabled with whitespace
    fireEvent.change(projectDescriptionField, { target: { value: '   ' } });
    expect(submitButton).toBeDisabled();
    
    // Enabled with actual content
    fireEvent.change(projectDescriptionField, { target: { value: 'My project description' } });
    expect(submitButton).not.toBeDisabled();
    
    // Disabled again when cleared
    fireEvent.change(projectDescriptionField, { target: { value: '' } });
    expect(submitButton).toBeDisabled();
  });

  test('should call saveUserOnboarding with project description when form is submitted', async () => {
    const { saveUserOnboarding } = require('../../services/firebase');
    saveUserOnboarding.mockResolvedValue();

    render(<OnboardingForm user={mockUser} onComplete={mockOnComplete} />);
    
    const projectDescriptionField = screen.getByLabelText(/Project Description/);
    const submitButton = screen.getByText('Complete Setup');
    
    // Enter project description
    const projectDescription = 'My independent study project focuses on machine learning applications.';
    fireEvent.change(projectDescriptionField, { target: { value: projectDescription } });
    
    // Submit form
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(saveUserOnboarding).toHaveBeenCalledWith(mockUser.uid, {
        projectDescription: projectDescription
      });
      expect(mockOnComplete).toHaveBeenCalled();
    });
  });

  test('should show loading state while submitting', async () => {
    const { saveUserOnboarding } = require('../../services/firebase');
    saveUserOnboarding.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<OnboardingForm user={mockUser} onComplete={mockOnComplete} />);
    
    const projectDescriptionField = screen.getByLabelText(/Project Description/);
    const submitButton = screen.getByText('Complete Setup');
    
    // Enter project description
    fireEvent.change(projectDescriptionField, {
      target: { value: 'My independent study project focuses on machine learning applications.' }
    });
    
    // Submit form
    fireEvent.click(submitButton);
    
    // Should show loading state
    expect(screen.getByText('Setting up your account...')).toBeInTheDocument();
  });

  test('should show info note about automatic advisor assignment', () => {
    render(<OnboardingForm user={mockUser} onComplete={mockOnComplete} />);
    
    expect(screen.getByText(/You've been automatically assigned to work with your advisor/)).toBeInTheDocument();
  });
});