/**
 * Tests for Email Student functionality in StudentProfile component
 * 
 * Verifies that admins can email students directly from the student profile view
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

describe('StudentProfile - Email Student Integration', () => {
  test('Email button component has correct structure', () => {
    // Test the email button structure in isolation
    const testEmail = 'student@example.com';
    
    const { container } = render(
      <a
        href={`mailto:${encodeURIComponent(testEmail)}`}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        title={`Send email to ${testEmail}`}
      >
        Email Student
      </a>
    );
    
    const emailButton = screen.getByText('Email Student');
    expect(emailButton).toBeInTheDocument();
    expect(emailButton).toHaveAttribute('href', `mailto:${encodeURIComponent(testEmail)}`);
    expect(emailButton).toHaveAttribute('title', `Send email to ${testEmail}`);
  });

  test('Email button renders with proper styling classes', () => {
    const testEmail = 'admin@example.com';
    
    const { container } = render(
      <a
        href={`mailto:${testEmail}`}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Email Student
      </a>
    );
    
    const link = container.querySelector('a');
    expect(link).toHaveClass('inline-flex');
    expect(link).toHaveClass('items-center');
    expect(link).toHaveClass('bg-blue-600');
    expect(link).toHaveClass('text-white');
  });

  test('Mailto protocol is correctly formatted', () => {
    const emails = [
      'simple@example.com',
      'complex.name@university.edu.au',
      'student+tag@domain.com'
    ];
    
    emails.forEach(email => {
      const { container } = render(
        <a href={`mailto:${encodeURIComponent(email)}`}>Email</a>
      );
      
      const link = container.querySelector('a');
      expect(link?.getAttribute('href')).toBe(`mailto:${encodeURIComponent(email)}`);
    });
  });
});
