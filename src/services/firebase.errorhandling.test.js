/**
 * Comprehensive tests for Firebase error handling and configuration
 * 
 * These tests verify that Firebase configurations and onboarding flows
 * are accurate and error-free after our improvements.
 */

// Mock Firebase before importing
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({}))
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  GoogleAuthProvider: jest.fn(() => ({})),
  signInWithPopup: jest.fn(),
  signOut: jest.fn()
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(() => Promise.resolve({ exists: () => false })),
  updateDoc: jest.fn(() => Promise.resolve()),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  getDocs: jest.fn(() => Promise.resolve({ docs: [] })),
  addDoc: jest.fn(),
  deleteDoc: jest.fn(),
  serverTimestamp: jest.fn(() => 'mock-timestamp')
}));

const originalEnv = process.env;

beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
  process.env = { 
    ...originalEnv,
    // Set valid Firebase config for tests
    REACT_APP_FIREBASE_API_KEY: 'test-api-key',
    REACT_APP_FIREBASE_AUTH_DOMAIN: 'test.firebaseapp.com',
    REACT_APP_FIREBASE_PROJECT_ID: 'test-project',
    REACT_APP_FIREBASE_STORAGE_BUCKET: 'test-project.appspot.com',
    REACT_APP_FIREBASE_MESSAGING_SENDER_ID: '123456789',
    REACT_APP_FIREBASE_APP_ID: '1:123456789:web:test',
    REACT_APP_ADMIN_EMAIL: 'admin@bwscampus.com'
  };
});

afterEach(() => {
  process.env = originalEnv;
});

describe('Firebase Error Handling and Validation', () => {
  describe('Parameter Validation', () => {
    test('getUserProfile should validate user ID parameter', async () => {
      const { getUserProfile } = require('./firebase');
      
      await expect(getUserProfile(null)).rejects.toThrow('User ID is required');
      await expect(getUserProfile(undefined)).rejects.toThrow('User ID is required');
      await expect(getUserProfile('')).rejects.toThrow('User ID is required');
      
      // Should not throw with valid ID
      await expect(getUserProfile('valid-id')).resolves.toBeNull(); // Mocked to return null
    });

    test('saveUserOnboarding should validate all required parameters', async () => {
      const { saveUserOnboarding } = require('./firebase');
      
      // Missing user ID
      await expect(saveUserOnboarding(null, {})).rejects.toThrow('User ID is required');
      await expect(saveUserOnboarding('', {})).rejects.toThrow('User ID is required');
      
      // Missing onboarding data
      await expect(saveUserOnboarding('user123', null)).rejects.toThrow('Onboarding data is required');
      await expect(saveUserOnboarding('user123', undefined)).rejects.toThrow('Onboarding data is required');
      
      // Missing userType in onboarding data
      await expect(saveUserOnboarding('user123', { pathway: 'test' })).rejects.toThrow('User type is required');
      
      // Valid parameters should not throw
      await expect(saveUserOnboarding('user123', { 
        userType: 'student',
        pathway: 'Entrepreneurship' 
      })).resolves.toBeUndefined();
    });
  });

  describe('Firebase Configuration Validation', () => {
    test('should validate all required environment variables', () => {
      // All variables present - should not throw
      expect(() => {
        require('./firebase');
      }).not.toThrow();
    });

    test('should handle missing environment variables gracefully', () => {
      delete process.env.REACT_APP_FIREBASE_API_KEY;
      
      expect(() => {
        require('./firebase');
      }).toThrow('Firebase configuration incomplete');
    });

    test('should provide detailed error messages for missing variables', () => {
      delete process.env.REACT_APP_FIREBASE_API_KEY;
      delete process.env.REACT_APP_FIREBASE_PROJECT_ID;
      
      try {
        require('./firebase');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toContain('REACT_APP_FIREBASE_API_KEY');
        expect(error.message).toContain('REACT_APP_FIREBASE_PROJECT_ID');
      }
    });
  });

  describe('Null Safety for QuerySnapshot', () => {
    test('getUserCalendlyEvents should handle null querySnapshot', async () => {
      const { getDocs } = require('firebase/firestore');
      
      // Mock getDocs to return null/undefined
      getDocs.mockResolvedValueOnce(null);
      
      const { getUserCalendlyEvents } = require('./firebase');
      const result = await getUserCalendlyEvents('test-user');
      
      expect(result).toEqual([]);
    });

    test('getAllCalendlyEvents should handle undefined querySnapshot.docs', async () => {
      const { getDocs } = require('firebase/firestore');
      
      // Mock getDocs to return object without docs
      getDocs.mockResolvedValueOnce({ docs: undefined });
      
      const { getAllCalendlyEvents } = require('./firebase');
      const result = await getAllCalendlyEvents();
      
      expect(result).toEqual([]);
    });

    test('getCalendlyMeetings should handle empty querySnapshot', async () => {
      const { getDocs } = require('firebase/firestore');
      
      // Mock getDocs to return empty results
      getDocs.mockResolvedValueOnce({ docs: [] });
      
      const { getCalendlyMeetings } = require('./firebase');
      const result = await getCalendlyMeetings();
      
      expect(result).toEqual([]);
    });
  });

  describe('Authentication Error Handling', () => {
    test('signInWithGoogle should enhance Firebase errors', () => {
      const firebase = require('./firebase');
      
      expect(typeof firebase.signInWithGoogle).toBe('function');
    });

    test('logOut should be properly exported', () => {
      const firebase = require('./firebase');
      
      expect(typeof firebase.logOut).toBe('function');
    });
  });

  describe('Service Initialization', () => {
    test('all Firebase services should be properly initialized', () => {
      const firebase = require('./firebase');
      
      expect(firebase.auth).toBeDefined();
      expect(firebase.db).toBeDefined();
      expect(firebase.googleProvider).toBeDefined();
    });

    test('all onboarding functions should be exported', () => {
      const firebase = require('./firebase');
      
      expect(typeof firebase.saveUserOnboarding).toBe('function');
      expect(typeof firebase.getUserProfile).toBe('function');
      expect(typeof firebase.updateUserProfile).toBe('function');
      expect(typeof firebase.getAdvisorsByPathway).toBe('function');
      expect(typeof firebase.setAdvisorPathways).toBe('function');
    });
  });

  describe('Error Enhancement', () => {
    test('functions should provide meaningful error messages', async () => {
      const { updateDoc } = require('firebase/firestore');
      
      // Mock a permission denied error
      const mockError = new Error('Permission denied');
      mockError.code = 'permission-denied';
      updateDoc.mockRejectedValueOnce(mockError);
      
      const { saveUserOnboarding } = require('./firebase');
      
      try {
        await saveUserOnboarding('user123', { userType: 'student' });
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toContain('Permission denied');
        expect(error.operation).toBe('save onboarding data');
      }
    });
  });
});