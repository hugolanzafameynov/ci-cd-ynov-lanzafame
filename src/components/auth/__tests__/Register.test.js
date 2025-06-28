import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../test-utils';
import Register from '../Register';

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    }
  }))
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Register Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
  });

  test('should render registration form', () => {
    renderWithProviders(<Register />);

    expect(screen.getByTestId('register-first-name')).toBeInTheDocument();
    expect(screen.getByTestId('register-last-name')).toBeInTheDocument();
    expect(screen.getByTestId('register-email')).toBeInTheDocument();
    expect(screen.getByTestId('register-password')).toBeInTheDocument();
    expect(screen.getByTestId('register-confirm-password')).toBeInTheDocument();
    expect(screen.getByTestId('register-submit-button')).toBeInTheDocument();
    expect(screen.getByText(/déjà un compte/i)).toBeInTheDocument();
  });

  test('should handle form submission with valid data', async () => {
    const mockRegister = jest.fn().mockResolvedValue({
      message: 'User created successfully',
      user: {
        id: 1,
        username: 'test@example.com',
        name: 'Test',
        last_name: 'User'
      }
    });

    const authValue = {
      user: null,
      login: jest.fn(),
      logout: jest.fn(),
      register: mockRegister,
      isAuthenticated: false,
      isAdmin: false,
      loading: false
    };

    renderWithProviders(<Register />, { authValue });

    const nameInput = screen.getByTestId('register-first-name');
    const lastNameInput = screen.getByTestId('register-last-name');
    const emailInput = screen.getByTestId('register-email');
    const passwordInput = screen.getByTestId('register-password');
    const confirmPasswordInput = screen.getByTestId('register-confirm-password');
    const submitButton = screen.getByTestId('register-submit-button');

    fireEvent.change(nameInput, { target: { value: 'Test' } });
    fireEvent.change(lastNameInput, { target: { value: 'User' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        name: 'Test',
        last_name: 'User',
        username: 'test@example.com',
        password: 'password123'
      });
    });

    // Attendre que le message de succès apparaisse
    await waitFor(() => {
      expect(screen.getByText(/votre compte a été créé avec succès/i)).toBeInTheDocument();
    });

    // Attendre le setTimeout de 2 secondes + un peu plus
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    }, { timeout: 3000 });
  });

  test('should show error message on registration failure', async () => {
    const mockRegister = jest.fn().mockRejectedValue({
      error: 'Email already exists'
    });

    const authValue = {
      user: null,
      login: jest.fn(),
      logout: jest.fn(),
      register: mockRegister,
      isAuthenticated: false,
      isAdmin: false,
      loading: false
    };

    renderWithProviders(<Register />, { authValue });

    const nameInput = screen.getByTestId('register-first-name');
    const lastNameInput = screen.getByTestId('register-last-name');
    const emailInput = screen.getByTestId('register-email');
    const passwordInput = screen.getByTestId('register-password');
    const confirmPasswordInput = screen.getByTestId('register-confirm-password');
    const submitButton = screen.getByTestId('register-submit-button');

    fireEvent.change(nameInput, { target: { value: 'Test' } });
    fireEvent.change(lastNameInput, { target: { value: 'User' } });
    fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
    });
  });

  test('should validate required fields', async () => {
    renderWithProviders(<Register />);

    const submitButton = screen.getByTestId('register-submit-button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      const nameInput = screen.getByTestId('register-first-name');
      const lastNameInput = screen.getByTestId('register-last-name');
      const emailInput = screen.getByTestId('register-email');
      const passwordInput = screen.getByTestId('register-password');
      const confirmPasswordInput = screen.getByTestId('register-confirm-password');
      
      expect(nameInput).toBeInvalid();
      expect(lastNameInput).toBeInvalid();
      expect(emailInput).toBeInvalid();
      expect(passwordInput).toBeInvalid();
      expect(confirmPasswordInput).toBeInvalid();
    });
  });

  test('should validate email format', async () => {
    renderWithProviders(<Register />);

    const emailInput = screen.getByTestId('register-email');
    const submitButton = screen.getByTestId('register-submit-button');

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(emailInput).toBeInvalid();
    });
  });

  test('should validate password length', async () => {
    renderWithProviders(<Register />);

    const passwordInput = screen.getByTestId('register-password');
    const confirmPasswordInput = screen.getByTestId('register-confirm-password');
    const submitButton = screen.getByTestId('register-submit-button');

    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: '123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/mot de passe doit contenir au moins 6 caractères/i)).toBeInTheDocument();
    });
  });

  test('should validate password confirmation', async () => {
    renderWithProviders(<Register />);

    const passwordInput = screen.getByTestId('register-password');
    const confirmPasswordInput = screen.getByTestId('register-confirm-password');
    const submitButton = screen.getByTestId('register-submit-button');

    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'differentpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/mots de passe ne correspondent pas/i)).toBeInTheDocument();
    });
  });

  test('should disable submit button during loading', async () => {
    let resolveRegister;
    const registerPromise = new Promise(resolve => {
      resolveRegister = resolve;
    });
    const mockRegister = jest.fn().mockReturnValue(registerPromise);

    const authValue = {
      user: null,
      login: jest.fn(),
      logout: jest.fn(),
      register: mockRegister,
      isAuthenticated: false,
      isAdmin: false,
      loading: false
    };

    renderWithProviders(<Register />, { authValue });

    const nameInput = screen.getByTestId('register-first-name');
    const lastNameInput = screen.getByTestId('register-last-name');
    const emailInput = screen.getByTestId('register-email');
    const passwordInput = screen.getByTestId('register-password');
    const confirmPasswordInput = screen.getByTestId('register-confirm-password');
    const submitButton = screen.getByTestId('register-submit-button');

    fireEvent.change(nameInput, { target: { value: 'Test' } });
    fireEvent.change(lastNameInput, { target: { value: 'User' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Button should be disabled during loading
    expect(submitButton).toBeDisabled();

    // Resolve the promise
    resolveRegister({
      message: 'User created successfully',
      user: { id: 1, username: 'test@example.com' }
    });

    await waitFor(() => {
      expect(screen.getByText(/votre compte a été créé avec succès/i)).toBeInTheDocument();
    });
  });

  test('should navigate to login page when clicking login link', () => {
    renderWithProviders(<Register />);

    const loginLink = screen.getByRole('link', { name: /se connecter/i });
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  test('should clear form after successful registration', async () => {
    const mockRegister = jest.fn().mockResolvedValue({
      message: 'User created successfully',
      user: { id: 1, username: 'test@example.com' }
    });

    const authValue = {
      user: null,
      login: jest.fn(),
      logout: jest.fn(),
      register: mockRegister,
      isAuthenticated: false,
      isAdmin: false,
      loading: false
    };

    renderWithProviders(<Register />, { authValue });

    const nameInput = screen.getByTestId('register-first-name');
    const lastNameInput = screen.getByTestId('register-last-name');
    const emailInput = screen.getByTestId('register-email');
    const passwordInput = screen.getByTestId('register-password');
    const confirmPasswordInput = screen.getByTestId('register-confirm-password');
    const submitButton = screen.getByTestId('register-submit-button');

    fireEvent.change(nameInput, { target: { value: 'Test' } });
    fireEvent.change(lastNameInput, { target: { value: 'User' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    }, { timeout: 3000 });
  });

  test('should show success message after registration', async () => {
    const mockRegister = jest.fn().mockResolvedValue({
      message: 'User created successfully',
      user: { id: 1, username: 'test@example.com' }
    });

    const authValue = {
      user: null,
      login: jest.fn(),
      logout: jest.fn(),
      register: mockRegister,
      isAuthenticated: false,
      isAdmin: false,
      loading: false
    };

    renderWithProviders(<Register />, { authValue });

    const nameInput = screen.getByTestId('register-first-name');
    const lastNameInput = screen.getByTestId('register-last-name');
    const emailInput = screen.getByTestId('register-email');
    const passwordInput = screen.getByTestId('register-password');
    const confirmPasswordInput = screen.getByTestId('register-confirm-password');
    const submitButton = screen.getByTestId('register-submit-button');

    fireEvent.change(nameInput, { target: { value: 'Test' } });
    fireEvent.change(lastNameInput, { target: { value: 'User' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/votre compte a été créé avec succès/i)).toBeInTheDocument();
    });
  });
});
