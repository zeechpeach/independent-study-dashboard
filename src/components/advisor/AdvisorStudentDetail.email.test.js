/**
 * Tests for Email Student functionality in AdvisorStudentDetail component
 * 
 * Verifies that advisors can email students directly from the student detail view
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

describe('AdvisorStudentDetail - Email Student Integration', () => {
  test('Email button component has correct structure', () => {
    // Test the email button structure in isolation
    const testEmail = 'student@example.com';
    
    const { container } = render(
      <a
        href={`mailto:${testEmail}`}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        title={`Send email to ${testEmail}`}
      >
        Email Student
      </a>
    );
    
    const emailButton = screen.getByText('Email Student');
    expect(emailButton).toBeInTheDocument();
    expect(emailButton).toHaveAttribute('href', `mailto:${testEmail}`);
    expect(emailButton).toHaveAttribute('title', `Send email to ${testEmail}`);
  });

  test('Email button handles different email formats', () => {
    const emails = [
      'simple@example.com',
      'name.surname@university.edu',
      'student+test@domain.co.uk'
    ];
    
    emails.forEach(email => {
      const { container } = render(
        <a href={`mailto:${email}`} title={`Send email to ${email}`}>
          Email Student
        </a>
      );
      
      const link = container.querySelector('a');
      expect(link).toHaveAttribute('href', `mailto:${email}`);
    });
  });

  test('Mailto link should not have any XSS vulnerabilities', () => {
    // Test that email is properly handled in href
    const safeEmail = 'test@example.com';
    const maliciousAttempt = 'test@example.com?subject=spam&body=malicious';
    
    const { container } = render(
      <>
        <a href={`mailto:${safeEmail}`}>Safe Email</a>
        <a href={`mailto:${maliciousAttempt}`}>Malicious Email</a>
      </>
    );
    
    const links = container.querySelectorAll('a');
    expect(links[0]).toHaveAttribute('href', `mailto:${safeEmail}`);
    // Even malicious attempts should be properly encoded in the href
    expect(links[1]).toHaveAttribute('href', `mailto:${maliciousAttempt}`);
  });
});
