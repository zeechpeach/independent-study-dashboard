/**
 * Tests for Firebase configuration validation
 * 
 * These tests verify that Firebase configuration validation works correctly
 * and provides clear error messages for missing environment variables.
 */

// Mock environment variables before importing firebase
const originalEnv = process.env;

beforeEach(() => {
  jest.resetModules();
  process.env = { ...originalEnv };
});

afterEach(() => {
  process.env = originalEnv;
});

describe('Firebase Configuration Validation', () => {
  test('should validate all required environment variables are present', () => {
    // Set all required variables
    process.env.REACT_APP_FIREBASE_API_KEY = 'test-api-key';
    process.env.REACT_APP_FIREBASE_AUTH_DOMAIN = 'test.firebaseapp.com';
    process.env.REACT_APP_FIREBASE_PROJECT_ID = 'test-project';
    process.env.REACT_APP_FIREBASE_STORAGE_BUCKET = 'test-project.appspot.com';
    process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID = '123456789';
    process.env.REACT_APP_FIREBASE_APP_ID = '1:123456789:web:test';
    
    // Should not throw when all variables are present
    expect(() => {
      require('./firebase');
    }).not.toThrow();
  });

  test('should throw error when API key is missing', () => {
    // Remove API key
    delete process.env.REACT_APP_FIREBASE_API_KEY;
    
    expect(() => {
      require('./firebase');
    }).toThrow('Firebase configuration incomplete');
  });

  test('should throw error when auth domain is missing', () => {
    // Set all variables except auth domain
    process.env.REACT_APP_FIREBASE_API_KEY = 'test-api-key';
    delete process.env.REACT_APP_FIREBASE_AUTH_DOMAIN;
    process.env.REACT_APP_FIREBASE_PROJECT_ID = 'test-project';
    process.env.REACT_APP_FIREBASE_STORAGE_BUCKET = 'test-project.appspot.com';
    process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID = '123456789';
    process.env.REACT_APP_FIREBASE_APP_ID = '1:123456789:web:test';
    
    expect(() => {
      require('./firebase');
    }).toThrow('Missing: REACT_APP_FIREBASE_AUTH_DOMAIN');
  });

  test('should throw error when multiple variables are missing', () => {
    // Only set some variables
    process.env.REACT_APP_FIREBASE_API_KEY = 'test-api-key';
    delete process.env.REACT_APP_FIREBASE_AUTH_DOMAIN;
    delete process.env.REACT_APP_FIREBASE_PROJECT_ID;
    
    expect(() => {
      require('./firebase');
    }).toThrow('REACT_APP_FIREBASE_AUTH_DOMAIN');
  });

  test('should provide clear error message listing all missing variables', () => {
    // Clear all Firebase environment variables
    delete process.env.REACT_APP_FIREBASE_API_KEY;
    delete process.env.REACT_APP_FIREBASE_AUTH_DOMAIN;
    delete process.env.REACT_APP_FIREBASE_PROJECT_ID;
    delete process.env.REACT_APP_FIREBASE_STORAGE_BUCKET;
    delete process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID;
    delete process.env.REACT_APP_FIREBASE_APP_ID;
    
    try {
      require('./firebase');
      fail('Should have thrown an error');
    } catch (error) {
      expect(error.message).toContain('Firebase configuration incomplete');
      expect(error.message).toContain('REACT_APP_FIREBASE_API_KEY');
      expect(error.message).toContain('REACT_APP_FIREBASE_AUTH_DOMAIN');
      expect(error.message).toContain('REACT_APP_FIREBASE_PROJECT_ID');
    }
  });
});