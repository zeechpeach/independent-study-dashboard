import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MeetingsCard from './MeetingsCard';

describe('MeetingsCard', () => {
  const mockProps = {
    upcomingMeetings: [],
    pastMeetings: [],
    loading: false,
    error: null,
    onBookMeeting: jest.fn(),
    onPrepareForMeeting: jest.fn(),
    onJoinMeeting: jest.fn(),
    formatDate: (date) => new Date(date).toLocaleDateString()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders meetings card with empty state', () => {
    render(<MeetingsCard {...mockProps} />);
    
    expect(screen.getByText('Meetings')).toBeInTheDocument();
    expect(screen.getByText('No meetings scheduled')).toBeInTheDocument();
    expect(screen.getByText('Book a Meeting')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    render(<MeetingsCard {...mockProps} loading={true} />);
    
    expect(screen.getByText('Loading meetings...')).toBeInTheDocument();
  });

  it('renders error state', () => {
    render(<MeetingsCard {...mockProps} error="Failed to load meetings" />);
    
    expect(screen.getByText('Failed to load meetings')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('renders upcoming meetings', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1); // Tomorrow
    
    const upcomingMeetings = [
      {
        id: '1',
        title: 'Test Meeting',
        scheduledDate: futureDate.toISOString(),
        status: 'scheduled'
      }
    ];

    render(<MeetingsCard {...mockProps} upcomingMeetings={upcomingMeetings} />);
    
    expect(screen.getByText('Test Meeting')).toBeInTheDocument();
    expect(screen.getByText('Prepare')).toBeInTheDocument();
  });

  it('calls onBookMeeting when book button is clicked', () => {
    render(<MeetingsCard {...mockProps} />);
    
    fireEvent.click(screen.getByText('Book'));
    expect(mockProps.onBookMeeting).toHaveBeenCalled();
  });

  it('calls onPrepareForMeeting when prepare button is clicked', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1); // Tomorrow
    
    const upcomingMeetings = [
      {
        id: '1',
        title: 'Test Meeting',
        scheduledDate: futureDate.toISOString(),
        status: 'scheduled'
      }
    ];

    render(<MeetingsCard {...mockProps} upcomingMeetings={upcomingMeetings} />);
    
    fireEvent.click(screen.getByText('Prepare'));
    expect(mockProps.onPrepareForMeeting).toHaveBeenCalledWith(upcomingMeetings[0]);
  });

  it('shows past meetings when toggle is clicked', () => {
    const pastMeetings = [
      {
        id: '2',
        title: 'Past Meeting',
        scheduledDate: '2023-01-01T10:00:00Z',
        status: 'completed'
      }
    ];

    render(<MeetingsCard {...mockProps} pastMeetings={pastMeetings} />);
    
    fireEvent.click(screen.getByText('Show Past Meetings (1)'));
    expect(screen.getByText('Past Meeting')).toBeInTheDocument();
  });
});