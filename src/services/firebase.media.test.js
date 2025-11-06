/**
 * Tests for media upload functionality in notes
 * 
 * These tests verify file validation, upload, and deletion functionality
 * for the media attachments feature.
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
  getDoc: jest.fn(() => Promise.resolve({ 
    exists: () => true,
    data: () => ({ media: [] })
  })),
  updateDoc: jest.fn(() => Promise.resolve()),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  getDocs: jest.fn(() => Promise.resolve({ docs: [] })),
  addDoc: jest.fn(() => Promise.resolve({ id: 'test-note-id' })),
  deleteDoc: jest.fn(),
  serverTimestamp: jest.fn(() => 'mock-timestamp')
}));

jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(() => ({})),
  ref: jest.fn(() => ({ fullPath: 'test/path' })),
  uploadBytes: jest.fn(() => Promise.resolve({ 
    ref: { fullPath: 'test/path' } 
  })),
  getDownloadURL: jest.fn(() => Promise.resolve('https://example.com/file.jpg')),
  deleteObject: jest.fn(() => Promise.resolve())
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
    REACT_APP_ADMIN_EMAIL: 'zchien@bwscampus.com'
  };
});

afterEach(() => {
  process.env = originalEnv;
});

describe('Media Upload Validation', () => {
  it('should validate file size', () => {
    const { validateFile } = require('./firebase');
    
    const validFile = {
      name: 'test.jpg',
      type: 'image/jpeg',
      size: 5 * 1024 * 1024 // 5MB
    };
    
    const result = validateFile(validFile);
    expect(result.valid).toBe(true);
  });

  it('should reject files that are too large', () => {
    const { validateFile } = require('./firebase');
    
    const largeFile = {
      name: 'large.jpg',
      type: 'image/jpeg',
      size: 15 * 1024 * 1024 // 15MB
    };
    
    const result = validateFile(largeFile);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('10MB');
  });

  it('should accept supported image types', () => {
    const { validateFile } = require('./firebase');
    
    const imageTypes = ['image/jpeg', 'image/png', 'image/gif'];
    
    imageTypes.forEach(type => {
      const file = {
        name: `test.${type.split('/')[1]}`,
        type,
        size: 1024 * 1024
      };
      
      const result = validateFile(file);
      expect(result.valid).toBe(true);
    });
  });

  it('should accept supported document types', () => {
    const { validateFile } = require('./firebase');
    
    const docTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    docTypes.forEach(type => {
      const file = {
        name: 'test.doc',
        type,
        size: 1024 * 1024
      };
      
      const result = validateFile(file);
      expect(result.valid).toBe(true);
    });
  });

  it('should reject unsupported file types', () => {
    const { validateFile } = require('./firebase');
    
    const unsupportedFile = {
      name: 'test.exe',
      type: 'application/x-msdownload',
      size: 1024 * 1024
    };
    
    const result = validateFile(unsupportedFile);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('not supported');
  });

  it('should reject null or undefined files', () => {
    const { validateFile } = require('./firebase');
    
    const result = validateFile(null);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('No file provided');
  });
});

describe('Media Upload Functionality', () => {
  it('should upload a file and return metadata', async () => {
    const { uploadNoteMedia } = require('./firebase');
    const { uploadBytes, getDownloadURL } = require('firebase/storage');
    
    const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
    Object.defineProperty(mockFile, 'size', { value: 1024 * 1024 });
    
    const result = await uploadNoteMedia(mockFile, 'note-123', 'user-456');
    
    expect(uploadBytes).toHaveBeenCalled();
    expect(getDownloadURL).toHaveBeenCalled();
    expect(result).toHaveProperty('url');
    expect(result).toHaveProperty('name', 'test.jpg');
    expect(result).toHaveProperty('type', 'image');
    expect(result).toHaveProperty('path');
  });

  it('should reject invalid files during upload', async () => {
    const { uploadNoteMedia } = require('./firebase');
    
    const invalidFile = new File(['content'], 'test.exe', { type: 'application/x-msdownload' });
    Object.defineProperty(invalidFile, 'size', { value: 1024 * 1024 });
    
    await expect(uploadNoteMedia(invalidFile, 'note-123', 'user-456'))
      .rejects.toThrow();
  });

  it('should categorize files correctly', async () => {
    const { uploadNoteMedia } = require('./firebase');
    
    const imageFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
    Object.defineProperty(imageFile, 'size', { value: 1024 * 1024 });
    
    const result = await uploadNoteMedia(imageFile, 'note-123', 'user-456');
    expect(result.type).toBe('image');
    
    const docFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    Object.defineProperty(docFile, 'size', { value: 1024 * 1024 });
    
    const result2 = await uploadNoteMedia(docFile, 'note-123', 'user-456');
    expect(result2.type).toBe('document');
  });
});

describe('Media Deletion', () => {
  it('should delete a file from storage', async () => {
    const { deleteNoteMedia } = require('./firebase');
    const { deleteObject } = require('firebase/storage');
    
    await deleteNoteMedia('notes/user-123/note-456/file.jpg');
    
    expect(deleteObject).toHaveBeenCalled();
  });

  it('should handle missing file path', async () => {
    const { deleteNoteMedia } = require('./firebase');
    
    await expect(deleteNoteMedia(null)).rejects.toThrow('File path is required');
  });

  it('should not throw error if file does not exist', async () => {
    const { deleteNoteMedia } = require('./firebase');
    const { deleteObject } = require('firebase/storage');
    
    // Mock file not found error
    deleteObject.mockRejectedValueOnce({ code: 'storage/object-not-found' });
    
    // Should not throw
    await expect(deleteNoteMedia('notes/user-123/note-456/file.jpg')).resolves.not.toThrow();
  });
});

describe('Note Media Integration', () => {
  it('should create notes with media array', async () => {
    const { createNote } = require('./firebase');
    const { addDoc } = require('firebase/firestore');
    
    await createNote('user-123', {
      title: 'Test Note',
      content: 'Content',
      media: [
        { name: 'file.jpg', url: 'https://example.com/file.jpg', type: 'image' }
      ]
    });
    
    expect(addDoc).toHaveBeenCalled();
    const callArgs = addDoc.mock.calls[0][1];
    expect(callArgs).toHaveProperty('media');
    expect(Array.isArray(callArgs.media)).toBe(true);
  });

  it('should delete note media when note is deleted', async () => {
    const { deleteNote } = require('./firebase');
    const { getDoc, deleteDoc } = require('firebase/firestore');
    const { deleteObject } = require('firebase/storage');
    
    // Mock note with media
    getDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        media: [
          { path: 'notes/user-123/note-456/file1.jpg' },
          { path: 'notes/user-123/note-456/file2.pdf' }
        ]
      })
    });
    
    await deleteNote('note-456');
    
    expect(deleteDoc).toHaveBeenCalled();
    expect(deleteObject).toHaveBeenCalledTimes(2);
  });

  it('should update notes with new media', async () => {
    const { updateNote } = require('./firebase');
    const { updateDoc } = require('firebase/firestore');
    
    await updateNote('note-123', {
      title: 'Updated Note',
      media: [
        { name: 'file.jpg', url: 'https://example.com/file.jpg', type: 'image' }
      ]
    });
    
    expect(updateDoc).toHaveBeenCalled();
    const callArgs = updateDoc.mock.calls[0][1];
    expect(callArgs).toHaveProperty('media');
  });
});
