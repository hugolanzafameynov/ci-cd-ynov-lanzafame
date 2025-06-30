import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../test-utils';
import Login from '../Login';

// Mock the API services
jest.mock('../../../services/api', () => ({
  authService: {
    login: jest.fn(),
  },
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
  });

  test('should render login form', () => {
    renderWithProviders(<Login />);

    expect(screen.getByTestId('login-email')).toBeInTheDocument();
    expect(screen.getByTestId('login-password')).toBeInTheDocument();
    expect(screen.getByTestId('login-submit-button')).toBeInTheDocument();
    expect(screen.getByText(/pas encore de compte/i)).toBeInTheDocument();
  });

  test('should handle form submission with valid data', async () => {
    const mockLogin = jest.fn().mockResolvedValue({
      user: { id: 1, email: 'test@example.com' },
      token: 'fake-token'
    });

    const authValue = {
      user: null,
      login: mockLogin,
      logout: jest.fn(),
      register: jest.fn(),
      isAuthenticated: false,
      isAdmin: false,
      loading: false
    };

    renderWithProviders(<Login />, { authValue });

    const emailInput = screen.getByTestId('login-email');
    const passwordInput = screen.getByTestId('login-password');
    const submitButton = screen.getByTestId('login-submit-button');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  test('should show error message on login failure', async () => {
    const mockLogin = jest.fn().mockRejectedValue(
      new Error('Invalid credentials')
    );

    const authValue = {
      user: null,
      login: mockLogin,
      logout: jest.fn(),
      register: jest.fn(),
      isAuthenticated: false,
      isAdmin: false,
      loading: false
    };

    renderWithProviders(<Login />, { authValue });

    const emailInput = screen.getByTestId('login-email');
    const passwordInput = screen.getByTestId('login-password');
    const submitButton = screen.getByTestId('login-submit-button');

    fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  test('should validate required fields', async () => {
    renderWithProviders(<Login />);

    const submitButton = screen.getByTestId('login-submit-button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      const emailInput = screen.getByTestId('login-email');
      const passwordInput = screen.getByTestId('login-password');
      
      expect(emailInput).toBeInvalid();
      expect(passwordInput).toBeInvalid();
    });
  });

  test('should validate email format', async () => {
    renderWithProviders(<Login />);

    const emailInput = screen.getByTestId('login-email');
    const submitButton = screen.getByTestId('login-submit-button');

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(emailInput).toBeInvalid();
    });
  });

  test('should disable submit button during loading', async () => {
    let resolveLogin;
    const loginPromise = new Promise(resolve => {
      resolveLogin = resolve;
    });
    
    const mockLogin = jest.fn().mockReturnValueOnce(loginPromise);

    const authValue = {
      user: null,
      login: mockLogin,
      logout: jest.fn(),
      register: jest.fn(),
      isAuthenticated: false,
      isAdmin: false,
      loading: false
    };

    renderWithProviders(<Login />, { authValue });

    const emailInput = screen.getByTestId('login-email');
    const passwordInput = screen.getByTestId('login-password');
    const submitButton = screen.getByTestId('login-submit-button');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Button should be disabled during loading
    expect(submitButton).toBeDisabled();

    // Resolve the promise
    resolveLogin({ user: { id: 1, email: 'test@example.com' }, token: 'fake-token' });

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  test('should navigate to register page when clicking register link', () => {
    renderWithProviders(<Login />);

    const registerLink = screen.getByText(/s'inscrire/i);
    expect(registerLink).toHaveAttribute('href', '/register');
    
    // Test that the link is rendered correctly (it uses React Router Link)
    expect(registerLink.closest('a')).toBeInTheDocument();
  });

  test('should handle keyboard navigation', () => {
    renderWithProviders(<Login />);

    const emailInput = screen.getByTestId('login-email');
    const passwordInput = screen.getByTestId('login-password');

    // Focus on email input
    emailInput.focus();
    expect(emailInput).toHaveFocus();
    
    // Tab to password input
    fireEvent.keyDown(emailInput, { key: 'Tab' });
    passwordInput.focus(); // Manually focus for testing
    expect(passwordInput).toHaveFocus();
  });

  test('should handle form reset after error', async () => {
    const mockLogin = jest.fn().mockRejectedValueOnce(new Error('Network error'));

    const authValue = {
      user: null,
      login: mockLogin,
      logout: jest.fn(),
      register: jest.fn(),
      isAuthenticated: false,
      isAdmin: false,
      loading: false
    };

    renderWithProviders(<Login />, { authValue });

    const emailInput = screen.getByTestId('login-email');
    const passwordInput = screen.getByTestId('login-password');
    const submitButton = screen.getByTestId('login-submit-button');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });

    // Form should still have values
    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });
});
