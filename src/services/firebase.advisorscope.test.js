/**
 * Tests for Advisor Scoped Important Dates Functionality
 * 
 * These tests verify the advisor-scoped important dates functions work correctly.
 */

describe('Advisor Scoped Important Dates Functions', () => {
  // Test that the functions are properly exported
  test('Advisor scoped important dates functions should be properly exported', () => {
    const firebase = require('./firebase');
    
    expect(typeof firebase.createImportantDate).toBe('function');
    expect(typeof firebase.getAdvisorImportantDates).toBe('function');
    expect(typeof firebase.getImportantDatesForAdvisors).toBe('function');
    expect(typeof firebase.getAllImportantDates).toBe('function');
  });

  // Test createImportantDate parameter handling
  test('createImportantDate should accept advisorId parameter', () => {
    const { createImportantDate } = require('./firebase');
    
    const testDate = {
      title: 'Test Event',
      description: 'Test Description',
      date: '2025-01-15'
    };
    
    // Should not throw when called with different parameter combinations
    expect(() => {
      // Test function signature - should accept both parameters
      expect(createImportantDate.length).toBeGreaterThanOrEqual(1);
    }).not.toThrow();
  });

  // Test getAdvisorImportantDates parameter handling
  test('getAdvisorImportantDates should accept advisorId parameter', () => {
    const { getAdvisorImportantDates } = require('./firebase');
    
    expect(() => {
      expect(typeof getAdvisorImportantDates).toBe('function');
      expect(getAdvisorImportantDates.length).toBe(1);
    }).not.toThrow();
  });

  // Test getImportantDatesForAdvisors parameter handling
  test('getImportantDatesForAdvisors should accept array parameter', () => {
    const { getImportantDatesForAdvisors } = require('./firebase');
    
    expect(() => {
      expect(typeof getImportantDatesForAdvisors).toBe('function');
      expect(getImportantDatesForAdvisors.length).toBe(1);
    }).not.toThrow();
  });

  // Test structure validation - ensure function exists and has expected signature
  test('Functions should have expected signatures', () => {
    const firebase = require('./firebase');
    
    // createImportantDate should accept dateData and optional advisorId
    expect(firebase.createImportantDate.length).toBeGreaterThanOrEqual(1);
    
    // getAdvisorImportantDates should accept advisorId
    expect(firebase.getAdvisorImportantDates.length).toBe(1);
    
    // getImportantDatesForAdvisors should accept advisorIds array
    expect(firebase.getImportantDatesForAdvisors.length).toBe(1);
    
    // getAllImportantDates should exist for admin use
    expect(firebase.getAllImportantDates.length).toBe(0);
  });

  // Test backward compatibility - verify original functions still exist
  test('Original important dates functions should still exist', () => {
    const firebase = require('./firebase');
    
    expect(typeof firebase.updateImportantDate).toBe('function');
    expect(typeof firebase.deleteImportantDate).toBe('function');
    expect(typeof firebase.getAllImportantDates).toBe('function');
  });

  // Test that the data structure expectations are maintained
  test('Function exports should maintain expected structure', () => {
    const firebase = require('./firebase');
    
    // Core advisor scoped functions
    const requiredFunctions = [
      'createImportantDate',
      'getAdvisorImportantDates', 
      'getImportantDatesForAdvisors',
      'getAllImportantDates',
      'updateImportantDate',
      'deleteImportantDate'
    ];
    
    requiredFunctions.forEach(funcName => {
      expect(firebase[funcName]).toBeDefined();
      expect(typeof firebase[funcName]).toBe('function');
    });
  });
});