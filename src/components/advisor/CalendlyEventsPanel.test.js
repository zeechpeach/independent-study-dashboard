import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import CalendlyEventsPanel from './CalendlyEventsPanel';

// Mock Firebase functions
jest.mock('../../services/firebase', () => ({
  getAllCalendlyEvents: jest.fn(),
  getCalendlyMeetings: jest.fn(),
}));

describe('CalendlyEventsPanel', () => {
  const mockUserProfile = {
    id: 'test-advisor-id',
    name: 'Test Advisor',
    userType: 'advisor',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders component with title', () => {
    const { getAllCalendlyEvents, getCalendlyMeetings } = require('../../services/firebase');
    getAllCalendlyEvents.mockResolvedValue([]);
    getCalendlyMeetings.mockResolvedValue([]);

    render(
      <CalendlyEventsPanel 
        userProfile={mockUserProfile}
        showAllEvents={false}
        maxEvents={5}
      />
    );

    expect(screen.getByText('Calendly Activity')).toBeInTheDocument();
  });

  test('displays loading state initially', () => {
    const { getAllCalendlyEvents, getCalendlyMeetings } = require('../../services/firebase');
    getAllCalendlyEvents.mockImplementation(() => new Promise(() => {})); // Never resolves
    getCalendlyMeetings.mockImplementation(() => new Promise(() => {}));

    render(
      <CalendlyEventsPanel 
        userProfile={mockUserProfile}
        showAllEvents={false}
        maxEvents={5}
      />
    );

    expect(screen.getByText('Loading events...')).toBeInTheDocument();
  });

  test('displays empty state when no meetings exist', async () => {
    const { getAllCalendlyEvents, getCalendlyMeetings } = require('../../services/firebase');
    getAllCalendlyEvents.mockResolvedValue([]);
    getCalendlyMeetings.mockResolvedValue([]);

    render(
      <CalendlyEventsPanel 
        userProfile={mockUserProfile}
        showAllEvents={false}
        maxEvents={5}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('No Calendly activity yet')).toBeInTheDocument();
    });

    expect(screen.getByText('Events will appear here when students book or cancel meetings through Calendly')).toBeInTheDocument();
  });

  test('displays meetings when data is available', async () => {
    const { getAllCalendlyEvents, getCalendlyMeetings } = require('../../services/firebase');
    
    const mockMeetings = [
      {
        id: 'meeting-1',
        eventName: 'Test Meeting',
        studentName: 'John Doe',
        studentEmail: 'john@bwscampus.com',
        status: 'scheduled',
        scheduledDate: new Date('2024-01-15T10:00:00Z'),
      }
    ];

    getAllCalendlyEvents.mockResolvedValue([]);
    getCalendlyMeetings.mockResolvedValue(mockMeetings);

    render(
      <CalendlyEventsPanel 
        userProfile={mockUserProfile}
        showAllEvents={false}
        maxEvents={5}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Synchronized Meetings')).toBeInTheDocument();
    });

    expect(screen.getByText('Test Meeting')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  test('displays webhook events when showAllEvents is true', async () => {
    const { getAllCalendlyEvents, getCalendlyMeetings } = require('../../services/firebase');
    
    const mockEvents = [
      {
        id: 'event-1',
        eventType: 'invitee.created',
        payload: {
          email: 'student@bwscampus.com',
        },
        processedAt: new Date('2024-01-15T09:30:00Z'),
      }
    ];

    getAllCalendlyEvents.mockResolvedValue(mockEvents);
    getCalendlyMeetings.mockResolvedValue([]);

    render(
      <CalendlyEventsPanel 
        userProfile={mockUserProfile}
        showAllEvents={true}
        maxEvents={5}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Webhook Events')).toBeInTheDocument();
    });

    expect(screen.getByText('invitee.created')).toBeInTheDocument();
    expect(screen.getByText('student@bwscampus.com')).toBeInTheDocument();
  });

  test('handles error state gracefully', async () => {
    const { getAllCalendlyEvents, getCalendlyMeetings } = require('../../services/firebase');
    
    getAllCalendlyEvents.mockRejectedValue(new Error('Failed to fetch'));
    getCalendlyMeetings.mockRejectedValue(new Error('Failed to fetch'));

    render(
      <CalendlyEventsPanel 
        userProfile={mockUserProfile}
        showAllEvents={false}
        maxEvents={5}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to load Calendly events')).toBeInTheDocument();
    });
  });

  test('respects maxEvents limit', async () => {
    const { getAllCalendlyEvents, getCalendlyMeetings } = require('../../services/firebase');
    
    const mockMeetings = Array.from({ length: 10 }, (_, i) => ({
      id: `meeting-${i}`,
      eventName: `Meeting ${i}`,
      studentName: `Student ${i}`,
      status: 'scheduled',
      scheduledDate: new Date(`2024-01-${15 + i}T10:00:00Z`),
    }));

    getAllCalendlyEvents.mockResolvedValue([]);
    getCalendlyMeetings.mockResolvedValue(mockMeetings);

    render(
      <CalendlyEventsPanel 
        userProfile={mockUserProfile}
        showAllEvents={false}
        maxEvents={3}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Synchronized Meetings')).toBeInTheDocument();
    });

    // Should only show first 3 meetings
    expect(screen.getByText('Meeting 0')).toBeInTheDocument();
    expect(screen.getByText('Meeting 1')).toBeInTheDocument();
    expect(screen.getByText('Meeting 2')).toBeInTheDocument();
    expect(screen.queryByText('Meeting 3')).not.toBeInTheDocument();
  });

  test('displays different status types correctly', async () => {
    const { getAllCalendlyEvents, getCalendlyMeetings } = require('../../services/firebase');
    
    const mockMeetings = [
      {
        id: 'meeting-1',
        eventName: 'Scheduled Meeting',
        studentName: 'John Doe',
        status: 'scheduled',
        scheduledDate: new Date('2024-01-15T10:00:00Z'),
      },
      {
        id: 'meeting-2',
        eventName: 'Cancelled Meeting',
        studentName: 'Jane Smith',
        status: 'cancelled',
        scheduledDate: new Date('2024-01-16T10:00:00Z'),
      }
    ];

    getAllCalendlyEvents.mockResolvedValue([]);
    getCalendlyMeetings.mockResolvedValue(mockMeetings);

    render(
      <CalendlyEventsPanel 
        userProfile={mockUserProfile}
        showAllEvents={false}
        maxEvents={5}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Scheduled Meeting')).toBeInTheDocument();
      expect(screen.getByText('Cancelled Meeting')).toBeInTheDocument();
    });
  });
});