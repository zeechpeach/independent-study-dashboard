import { 
  getUserCalendlyEvents, 
  getAllCalendlyEvents, 
  getCalendlyMeetings, 
  updateMeetingCalendlySync 
} from './firebase';

// Mock Firebase functions for testing
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  getDocs: jest.fn(),
  doc: jest.fn(),
  updateDoc: jest.fn(),
  serverTimestamp: jest.fn(() => 'mock-timestamp'),
}));

describe('Calendly Integration Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserCalendlyEvents', () => {
    test('should export getUserCalendlyEvents function', () => {
      expect(typeof getUserCalendlyEvents).toBe('function');
      expect(getUserCalendlyEvents.length).toBe(1); // Expects userId parameter
    });

    test('function should be defined and callable', () => {
      expect(() => {
        const mockUserId = 'test-user-id';
        getUserCalendlyEvents(mockUserId);
      }).not.toThrow();
    });
  });

  describe('getAllCalendlyEvents', () => {
    test('should export getAllCalendlyEvents function', () => {
      expect(typeof getAllCalendlyEvents).toBe('function');
      expect(getAllCalendlyEvents.length).toBe(0); // No parameters
    });

    test('function should be defined and callable', () => {
      expect(() => {
        getAllCalendlyEvents();
      }).not.toThrow();
    });
  });

  describe('getCalendlyMeetings', () => {
    test('should export getCalendlyMeetings function', () => {
      expect(typeof getCalendlyMeetings).toBe('function');
      // Function uses default parameter (userId = null), so length is 0
      expect(getCalendlyMeetings.length).toBe(0); // Optional userId parameter with default
    });

    test('function should be defined and callable with and without parameters', () => {
      expect(() => {
        getCalendlyMeetings();
        getCalendlyMeetings('test-user-id');
      }).not.toThrow();
    });
  });

  describe('updateMeetingCalendlySync', () => {
    test('should export updateMeetingCalendlySync function', () => {
      expect(typeof updateMeetingCalendlySync).toBe('function');
      expect(updateMeetingCalendlySync.length).toBe(2); // meetingId and syncData parameters
    });

    test('function should be defined and callable', () => {
      expect(() => {
        const mockMeetingId = 'test-meeting-id';
        const mockSyncData = { calendlyEventUuid: 'test-uuid' };
        updateMeetingCalendlySync(mockMeetingId, mockSyncData);
      }).not.toThrow();
    });
  });

  describe('Function Integration', () => {
    test('all Calendly functions should be exported from firebase service', () => {
      const firebase = require('./firebase');
      
      const calendlyFunctions = [
        'getUserCalendlyEvents',
        'getAllCalendlyEvents', 
        'getCalendlyMeetings',
        'updateMeetingCalendlySync'
      ];
      
      calendlyFunctions.forEach(funcName => {
        expect(firebase[funcName]).toBeDefined();
        expect(typeof firebase[funcName]).toBe('function');
      });
    });

    test('functions should have expected parameter counts', () => {
      const firebase = require('./firebase');
      
      // Check parameter counts match expected signatures
      expect(firebase.getUserCalendlyEvents.length).toBe(1);
      expect(firebase.getAllCalendlyEvents.length).toBe(0);
      expect(firebase.getCalendlyMeetings.length).toBe(0); // Uses default parameter
      expect(firebase.updateMeetingCalendlySync.length).toBe(2);
    });
  });

  describe('Data Structure Expectations', () => {
    test('functions should maintain consistent naming conventions', () => {
      const firebase = require('./firebase');
      
      // All function names should be camelCase and descriptive
      expect(firebase.getUserCalendlyEvents.name).toBe('getUserCalendlyEvents');
      expect(firebase.getAllCalendlyEvents.name).toBe('getAllCalendlyEvents');
      expect(firebase.getCalendlyMeetings.name).toBe('getCalendlyMeetings');
      expect(firebase.updateMeetingCalendlySync.name).toBe('updateMeetingCalendlySync');
    });

    test('functions should not throw synchronous errors', () => {
      const firebase = require('./firebase');
      
      // Test that functions can be called without throwing immediate errors
      expect(() => firebase.getUserCalendlyEvents('test-id')).not.toThrow();
      expect(() => firebase.getAllCalendlyEvents()).not.toThrow();
      expect(() => firebase.getCalendlyMeetings()).not.toThrow();
      expect(() => firebase.getCalendlyMeetings('test-id')).not.toThrow();
      expect(() => firebase.updateMeetingCalendlySync('test-id', {})).not.toThrow();
    });
  });
});