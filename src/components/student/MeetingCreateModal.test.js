import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MeetingCreateModal from './MeetingCreateModal';

// Mock user profile
const mockUserProfile = {
  id: 'test-user-id',
  name: 'Test Student',
  email: 'test@bwscampus.com'
};

describe('MeetingCreateModal', () => {
  const mockOnSave = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders modal when open', () => {
    render(
      <MeetingCreateModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        userProfile={mockUserProfile}
      />
    );

    expect(screen.getByText('Schedule New Meeting')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g., Weekly Check-in, Project Review')).toBeInTheDocument();
  });

  test('does not render when closed', () => {
    render(
      <MeetingCreateModal
        isOpen={false}
        onClose={mockOnClose}
        onSave={mockOnSave}
        userProfile={mockUserProfile}
      />
    );

    expect(screen.queryByText('Schedule New Meeting')).not.toBeInTheDocument();
  });

  test('validates required fields', async () => {
    render(
      <MeetingCreateModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        userProfile={mockUserProfile}
      />
    );

    // Try to submit without filling required fields
    const submitButton = screen.getByRole('button', { name: /schedule meeting/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Meeting title is required')).toBeInTheDocument();
      expect(screen.getByText('Meeting date is required')).toBeInTheDocument();
      expect(screen.getByText('Meeting time is required')).toBeInTheDocument();
    });

    expect(mockOnSave).not.toHaveBeenCalled();
  });

  test('submits form with valid data', async () => {
    render(
      <MeetingCreateModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        userProfile={mockUserProfile}
      />
    );

    // Fill out the form
    fireEvent.change(screen.getByPlaceholderText('e.g., Weekly Check-in, Project Review'), {
      target: { value: 'Test Meeting' }
    });

    // Set a future date using the first date input
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    
    const dateInputs = screen.getAllByDisplayValue('');
    const dateInput = dateInputs.find(input => input.type === 'date');
    const timeInput = dateInputs.find(input => input.type === 'time');
    
    fireEvent.change(dateInput, {
      target: { value: dateString }
    });

    fireEvent.change(timeInput, {
      target: { value: '14:00' }
    });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /schedule meeting/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Meeting',
          status: 'scheduled',
          source: 'manual'
        })
      );
    });
  });

  test('closes modal when cancel is clicked', () => {
    render(
      <MeetingCreateModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        userProfile={mockUserProfile}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  test('prevents scheduling meetings in the past', async () => {
    render(
      <MeetingCreateModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        userProfile={mockUserProfile}
      />
    );

    // Fill out the form with past date
    fireEvent.change(screen.getByPlaceholderText('e.g., Weekly Check-in, Project Review'), {
      target: { value: 'Test Meeting' }
    });

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateString = yesterday.toISOString().split('T')[0];
    
    const dateInputs = screen.getAllByDisplayValue('');
    const dateInput = dateInputs.find(input => input.type === 'date');
    const timeInput = dateInputs.find(input => input.type === 'time');
    
    fireEvent.change(dateInput, {
      target: { value: dateString }
    });

    fireEvent.change(timeInput, {
      target: { value: '14:00' }
    });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /schedule meeting/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Meeting must be scheduled for a future date and time')).toBeInTheDocument();
    });

    expect(mockOnSave).not.toHaveBeenCalled();
  });
});