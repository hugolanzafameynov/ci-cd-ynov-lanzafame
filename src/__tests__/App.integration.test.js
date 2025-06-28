import React from 'react';
import { screen, fireEvent, waitFor, act } from '@testing-library/react';
import { render } from '@testing-library/react';
import { BrowserRouter as Router, Routes, Route, Navigate, MemoryRouter } from 'react-router-dom';
import App from '../App';
import { AuthContext } from '../contexts/AuthContext';
import Login from '../components/auth/Login';
import Register from '../components/auth/Register';
import Dashboard from '../components/dashboard/Dashboard';
import ProtectedRoute from '../components/common/ProtectedRoute';

// Mock the entire API service
jest.mock('../services/api', () => ({
  authService: {
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    getCurrentUser: jest.fn(),
    isAuthenticated: jest.fn()
  },
  userService: {
    getAllUsers: jest.fn(),
    deleteUser: jest.fn()
  }
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock react-router-dom navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('App Integration Tests', () => {
  const { authService } = require('../services/api');

  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();
    
    // Default to unauthenticated state
    authService.getCurrentUser.mockReturnValue(null);
    authService.isAuthenticated.mockReturnValue(false);
    localStorageMock.getItem.mockReturnValue(null);
  });

  test('should show login page by default when not authenticated', async () => {
    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });
    
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument();
  });

  test('should handle login flow and call authService', async () => {
    const mockUser = {
      id: 1,
      username: 'test@example.com',
      name: 'Test',
      last_name: 'User',
      role: 'user'
    };

    authService.login.mockResolvedValueOnce({
      access_token: 'mock-token',
      user: mockUser
    });

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    // Fill in login form
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/mot de passe/i);
    const loginButton = screen.getByRole('button', { name: /se connecter/i });

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(loginButton);
    });

    // Should call the authService.login
    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    }, { timeout: 3000 });
  });

  test('should show error message on failed login', async () => {
    authService.login.mockRejectedValueOnce(new Error('Invalid credentials'));

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/mot de passe/i);
    const loginButton = screen.getByRole('button', { name: /se connecter/i });

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(loginButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/erreur lors de la connexion/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test('should navigate to register page', async () => {
    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument();
    });

    // Click register link
    const registerLink = screen.getByText(/s'inscrire/i);
    
    await act(async () => {
      fireEvent.click(registerLink);
    });

    // Check if we navigated to register (looking for register form elements)
    await waitFor(() => {
      expect(screen.getByText(/inscription/i)).toBeInTheDocument();
    });
  });

  test('should show dashboard for authenticated user from localStorage', async () => {
    const mockUser = {
      id: 1,
      username: 'test@example.com',
      name: 'Test',
      last_name: 'User',
      role: 'user',
      is_admin: false
    };

    // Create a custom AuthContext value for this test
    const mockAuthContextValue = {
      user: mockUser,
      loading: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      isAuthenticated: true,
      isAdmin: false
    };

    // Create a custom wrapper that provides the mocked auth context
    // Use MemoryRouter with initial entry to ensure clean state
    const AuthenticatedWrapper = ({ children }) => {
      return (
        <MemoryRouter initialEntries={['/dashboard']}>
          <AuthContext.Provider value={mockAuthContextValue}>
            <div className="App">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </div>
          </AuthContext.Provider>
        </MemoryRouter>
      );
    };

    // Render with the custom wrapper
    await act(async () => {
      render(<AuthenticatedWrapper />);
    });

    // Wait for dashboard to appear
    await waitFor(() => {
      expect(screen.getByText(/tableau de bord/i)).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Check for the user's name in the welcome message
    await waitFor(() => {
      expect(screen.getByText(/bienvenue, test user/i)).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Check that user email is displayed
    expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
  });

  test('should handle app routing and navigation', async () => {
    await act(async () => {
      render(<App />);
    });

    // Should start with login page
    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    // Navigate to register
    const registerLink = screen.getByText(/s'inscrire/i);
    await act(async () => {
      fireEvent.click(registerLink);
    });

    // Should show register page
    await waitFor(() => {
      expect(screen.getByText(/inscription/i)).toBeInTheDocument();
    });

    // Navigate back to login
    const loginLink = screen.getByText(/se connecter/i);
    await act(async () => {
      fireEvent.click(loginLink);
    });

    // Should show login page again
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument();
    });
  });

  test('should handle form validation', async () => {
    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    const loginButton = screen.getByRole('button', { name: /se connecter/i });

    // Try to submit without filling form
    await act(async () => {
      fireEvent.click(loginButton);
    });

    // HTML5 validation should prevent submission
    // The form should still be visible
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
  });

  test('should display loading states', async () => {
    authService.login.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ token: 'test', user: {} }), 100))
    );

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/mot de passe/i);
    const loginButton = screen.getByRole('button', { name: /se connecter/i });

    // Fill form and submit
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(loginButton);
    });

    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText(/connexion.../i)).toBeInTheDocument();
    });
  });

  test('should handle protected routes access attempt', async () => {
    // When not authenticated, trying to access dashboard should redirect to login
    await act(async () => {
      render(<App />);
    });

    // Since the app redirects / to /dashboard and dashboard is protected,
    // we should see the login page
    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });
    
    expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument();
  });
});
