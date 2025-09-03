/**
 * @jest-environment jsdom
 */

import { 
  createImportantDate, 
  getAdvisorImportantDates, 
  getImportantDatesForAdvisors,
  getAllImportantDates 
} from '../firebase';

// Mock Firebase functions
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  serverTimestamp: jest.fn(() => ({ isServerTimestamp: true }))
}));

const mockFirestore = {
  collection: jest.fn(),
  doc: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  serverTimestamp: jest.fn(() => ({ isServerTimestamp: true }))
};

jest.mock('../config/firebase', () => ({
  db: mockFirestore
}));

describe('Important Dates Advisor Scope', () => {
  const mockDateData = {
    title: 'Test Event',
    description: 'Test Description',
    date: '2025-03-15',
    location: 'Test Location'
  };

  const mockAdvisorId = 'advisor123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createImportantDate', () => {
    it('should create date with advisorId when provided', async () => {
      const { addDoc, collection, serverTimestamp } = require('firebase/firestore');
      addDoc.mockResolvedValue({ id: 'test-id' });
      collection.mockReturnValue('mock-collection');
      serverTimestamp.mockReturnValue('mock-timestamp');

      await createImportantDate(mockDateData, mockAdvisorId);

      expect(addDoc).toHaveBeenCalledWith('mock-collection', {
        ...mockDateData,
        advisorId: mockAdvisorId,
        createdAt: 'mock-timestamp',
        updatedAt: 'mock-timestamp'
      });
    });

    it('should create global date when advisorId is null', async () => {
      const { addDoc, collection, serverTimestamp } = require('firebase/firestore');
      addDoc.mockResolvedValue({ id: 'test-id' });
      collection.mockReturnValue('mock-collection');
      serverTimestamp.mockReturnValue('mock-timestamp');

      await createImportantDate(mockDateData, null);

      expect(addDoc).toHaveBeenCalledWith('mock-collection', {
        ...mockDateData,
        advisorId: null,
        createdAt: 'mock-timestamp',
        updatedAt: 'mock-timestamp'
      });
    });

    it('should default to null advisorId when not provided', async () => {
      const { addDoc, collection, serverTimestamp } = require('firebase/firestore');
      addDoc.mockResolvedValue({ id: 'test-id' });
      collection.mockReturnValue('mock-collection');
      serverTimestamp.mockReturnValue('mock-timestamp');

      await createImportantDate(mockDateData);

      expect(addDoc).toHaveBeenCalledWith('mock-collection', {
        ...mockDateData,
        advisorId: null,
        createdAt: 'mock-timestamp',
        updatedAt: 'mock-timestamp'
      });
    });
  });

  describe('getAdvisorImportantDates', () => {
    it('should query dates for specific advisor', async () => {
      const { getDocs, query, collection, where, orderBy } = require('firebase/firestore');
      
      const mockQuerySnapshot = {
        docs: [{
          id: 'date1',
          data: () => ({ ...mockDateData, advisorId: mockAdvisorId })
        }]
      };
      
      getDocs.mockResolvedValue(mockQuerySnapshot);
      query.mockReturnValue('mock-query');
      collection.mockReturnValue('mock-collection');
      where.mockReturnValue('mock-where');
      orderBy.mockReturnValue('mock-orderBy');

      const result = await getAdvisorImportantDates(mockAdvisorId);

      expect(where).toHaveBeenCalledWith('advisorId', '==', mockAdvisorId);
      expect(orderBy).toHaveBeenCalledWith('date', 'asc');
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'date1',
        ...mockDateData,
        advisorId: mockAdvisorId
      });
    });
  });

  describe('getImportantDatesForAdvisors', () => {
    const mockGlobalDate = { id: 'global1', title: 'Global Event', advisorId: null, date: '2025-03-10' };
    const mockAdvisorDate1 = { id: 'advisor1', title: 'Advisor 1 Event', advisorId: 'advisor1', date: '2025-03-15' };
    const mockAdvisorDate2 = { id: 'advisor2', title: 'Advisor 2 Event', advisorId: 'advisor2', date: '2025-03-20' };

    beforeEach(() => {
      const { getDocs, query, collection, where, orderBy } = require('firebase/firestore');
      
      // Mock different queries
      getDocs.mockImplementation((queryObj) => {
        // Global dates query
        if (queryObj === 'global-query') {
          return Promise.resolve({
            docs: [{ id: 'global1', data: () => mockGlobalDate }]
          });
        }
        // Advisor dates query
        if (queryObj === 'advisor-query') {
          return Promise.resolve({
            docs: [
              { id: 'advisor1', data: () => mockAdvisorDate1 },
              { id: 'advisor2', data: () => mockAdvisorDate2 }
            ]
          });
        }
        return Promise.resolve({ docs: [] });
      });

      query.mockImplementation((collection, ...conditions) => {
        if (conditions.some(c => c === 'where-global')) return 'global-query';
        if (conditions.some(c => c === 'where-advisors')) return 'advisor-query';
        return 'mock-query';
      });

      where.mockImplementation((field, operator, value) => {
        if (field === 'advisorId' && value === null) return 'where-global';
        if (field === 'advisorId' && operator === 'in') return 'where-advisors';
        return 'mock-where';
      });

      orderBy.mockReturnValue('mock-orderBy');
      collection.mockReturnValue('mock-collection');
    });

    it('should return only global dates when no advisors provided', async () => {
      const result = await getImportantDatesForAdvisors([]);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ id: 'global1', ...mockGlobalDate });
    });

    it('should return advisor dates plus global dates', async () => {
      const result = await getImportantDatesForAdvisors(['advisor1', 'advisor2']);

      expect(result).toHaveLength(3);
      expect(result.map(d => d.id)).toContain('global1');
      expect(result.map(d => d.id)).toContain('advisor1');
      expect(result.map(d => d.id)).toContain('advisor2');
    });

    it('should sort results by date', async () => {
      const result = await getImportantDatesForAdvisors(['advisor1', 'advisor2']);

      // Should be sorted by date: global1 (03-10), advisor1 (03-15), advisor2 (03-20)
      expect(result[0].date).toBe('2025-03-10');
      expect(result[1].date).toBe('2025-03-15');
      expect(result[2].date).toBe('2025-03-20');
    });

    it('should handle batching for >10 advisors', async () => {
      const manyAdvisors = Array.from({ length: 15 }, (_, i) => `advisor${i}`);
      
      await getImportantDatesForAdvisors(manyAdvisors);

      // Should make multiple batched queries (verify by checking call count)
      const { getDocs } = require('firebase/firestore');
      expect(getDocs).toHaveBeenCalledTimes(3); // 1 global + 2 batches
    });
  });

  describe('Backward Compatibility', () => {
    it('should handle legacy documents without advisorId field', async () => {
      const { getDocs } = require('firebase/firestore');
      
      const mockLegacyDate = {
        id: 'legacy1',
        data: () => ({ title: 'Legacy Event', date: '2025-03-01' }) // No advisorId field
      };

      getDocs.mockResolvedValue({
        docs: [mockLegacyDate]
      });

      const result = await getAllImportantDates();

      expect(result[0]).toEqual({
        id: 'legacy1',
        title: 'Legacy Event',
        date: '2025-03-01'
      });
      // No advisorId field should be preserved as undefined (treated as global)
    });
  });

  describe('Error Handling', () => {
    it('should handle createImportantDate errors', async () => {
      const { addDoc } = require('firebase/firestore');
      addDoc.mockRejectedValue(new Error('Firestore error'));

      await expect(createImportantDate(mockDateData, mockAdvisorId))
        .rejects.toThrow('Firestore error');
    });

    it('should handle getAdvisorImportantDates errors', async () => {
      const { getDocs } = require('firebase/firestore');
      getDocs.mockRejectedValue(new Error('Query failed'));

      await expect(getAdvisorImportantDates(mockAdvisorId))
        .rejects.toThrow('Query failed');
    });

    it('should handle getImportantDatesForAdvisors errors', async () => {
      const { getDocs } = require('firebase/firestore');
      getDocs.mockRejectedValue(new Error('Query failed'));

      await expect(getImportantDatesForAdvisors(['advisor1']))
        .rejects.toThrow('Query failed');
    });
  });
});