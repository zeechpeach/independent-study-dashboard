import { renderHook, act } from '@testing-library/react';
import { useRoleRedirect } from '../hooks/useRoleRedirect';

describe('useRoleRedirect', () => {
  let mockSetShowAdminDashboard;

  beforeEach(() => {
    mockSetShowAdminDashboard = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should redirect advisor to advisor dashboard', () => {
    const userProfile = {
      userType: 'advisor',
      onboardingComplete: true
    };

    renderHook(() => useRoleRedirect(userProfile, mockSetShowAdminDashboard));

    expect(mockSetShowAdminDashboard).toHaveBeenCalledWith(true);
  });

  test('should redirect student to student dashboard', () => {
    const userProfile = {
      userType: 'student',
      onboardingComplete: true
    };

    renderHook(() => useRoleRedirect(userProfile, mockSetShowAdminDashboard));

    expect(mockSetShowAdminDashboard).toHaveBeenCalledWith(false);
  });

  test('should not redirect if onboarding is not complete', () => {
    const userProfile = {
      userType: 'advisor',
      onboardingComplete: false
    };

    renderHook(() => useRoleRedirect(userProfile, mockSetShowAdminDashboard));

    expect(mockSetShowAdminDashboard).not.toHaveBeenCalled();
  });

  test('should not redirect if userProfile is null', () => {
    renderHook(() => useRoleRedirect(null, mockSetShowAdminDashboard));

    expect(mockSetShowAdminDashboard).not.toHaveBeenCalled();
  });

  test('should only redirect once per session', () => {
    const userProfile = {
      userType: 'advisor',
      onboardingComplete: true
    };

    const { rerender } = renderHook(() => useRoleRedirect(userProfile, mockSetShowAdminDashboard));

    expect(mockSetShowAdminDashboard).toHaveBeenCalledTimes(1);

    // Re-render with same props should not trigger another redirect
    rerender();

    expect(mockSetShowAdminDashboard).toHaveBeenCalledTimes(1);
  });
});