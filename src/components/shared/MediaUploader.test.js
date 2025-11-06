/**
 * Tests for MediaUploader component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MediaUploader from './MediaUploader';

// Mock the firebase service
jest.mock('../../services/firebase', () => ({
  validateFile: jest.fn((file) => {
    if (!file) return { valid: false, error: 'No file provided' };
    if (file.size > 10 * 1024 * 1024) {
      return { valid: false, error: 'File size must be less than 10MB' };
    }
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif',
      'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'File type not supported' };
    }
    return { valid: true };
  })
}));

describe('MediaUploader Component', () => {
  const mockOnMediaChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render upload button', () => {
    render(<MediaUploader media={[]} onMediaChange={mockOnMediaChange} />);
    expect(screen.getByText('Upload Files')).toBeInTheDocument();
  });

  it('should display supported file types', () => {
    render(<MediaUploader media={[]} onMediaChange={mockOnMediaChange} />);
    expect(screen.getByText(/JPG, PNG, GIF, PDF/i)).toBeInTheDocument();
  });

  it('should display uploaded media items', () => {
    const media = [
      {
        name: 'test.jpg',
        type: 'image',
        size: 1024 * 1024,
        url: 'https://example.com/test.jpg',
        isNew: false
      }
    ];
    
    render(<MediaUploader media={media} onMediaChange={mockOnMediaChange} />);
    expect(screen.getByText('test.jpg')).toBeInTheDocument();
  });

  it('should display image preview for image files', () => {
    const media = [
      {
        name: 'test.jpg',
        type: 'image',
        size: 1024 * 1024,
        url: 'https://example.com/test.jpg',
        isNew: false
      }
    ];
    
    render(<MediaUploader media={media} onMediaChange={mockOnMediaChange} />);
    const img = screen.getByAltText('test.jpg');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/test.jpg');
  });

  it('should format file size correctly', () => {
    const media = [
      {
        name: 'small.txt',
        type: 'document',
        size: 512,
        url: 'https://example.com/small.txt',
        isNew: false
      },
      {
        name: 'medium.pdf',
        type: 'document',
        size: 1024 * 500, // 500 KB
        url: 'https://example.com/medium.pdf',
        isNew: false
      },
      {
        name: 'large.jpg',
        type: 'image',
        size: 1024 * 1024 * 5, // 5 MB
        url: 'https://example.com/large.jpg',
        isNew: false
      }
    ];
    
    render(<MediaUploader media={media} onMediaChange={mockOnMediaChange} />);
    expect(screen.getByText('512 B')).toBeInTheDocument();
    expect(screen.getByText('500.0 KB')).toBeInTheDocument();
    expect(screen.getByText('5.0 MB')).toBeInTheDocument();
  });

  it('should show pending upload status for new files', () => {
    const media = [
      {
        name: 'pending.jpg',
        type: 'image',
        size: 1024 * 1024,
        previewUrl: 'blob:http://localhost/123',
        isNew: true
      }
    ];
    
    render(<MediaUploader media={media} onMediaChange={mockOnMediaChange} />);
    expect(screen.getByText(/Pending upload/i)).toBeInTheDocument();
  });

  it('should disable upload when disabled prop is true', () => {
    render(<MediaUploader media={[]} onMediaChange={mockOnMediaChange} disabled={true} />);
    
    const input = document.querySelector('input[type="file"]');
    expect(input).toBeDisabled();
  });

  it('should show download link for existing files', () => {
    const media = [
      {
        name: 'document.pdf',
        type: 'document',
        size: 1024 * 1024,
        url: 'https://example.com/document.pdf',
        isNew: false
      }
    ];
    
    render(<MediaUploader media={media} onMediaChange={mockOnMediaChange} />);
    
    const link = screen.getByTitle('View/Download');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://example.com/document.pdf');
    expect(link).toHaveAttribute('target', '_blank');
  });
});
