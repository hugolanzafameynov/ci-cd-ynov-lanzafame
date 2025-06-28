import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { authService } from '../../services/api';

// Mock the authService
jest.mock('../../services/api', () => ({
  authService: {
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    getCurrentUser: jest.fn(),
    isAuthenticated: jest.fn()
  }
}));

// Mock localStorage
const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

// Test users
const mockUser = {
  id: 1,
  username: 'test@example.com',
  name: 'Test',
  last_name: 'User',
  email: 'test@example.com',
  is_admin: false
};

const mockAdminUser = {
  id: 2,
  username: 'admin@example.com',
  name: 'Admin',
  last_name: 'User',
  email: 'admin@example.com',
  is_admin: true
};

// Test component to access AuthContext
const TestComponent = () => {
  const { user, isAuthenticated, isAdmin, login, register, logout, loading } = useAuth();
  
  const handleLogin = async () => {
    try {
      await login({ email: 'test@example.com', password: 'test' });
    } catch (error) {
      // Error handled silently in test
    }
  };

  const handleRegister = async () => {
    try {
      await register({ email: 'test@example.com', password: 'test', first_name: 'Test', last_name: 'User' });
    } catch (error) {
      // Error handled silently in test
    }
  };
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="authenticated">{isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</div>
      <div data-testid="admin">{isAdmin ? 'Admin' : 'Not Admin'}</div>
      <div data-testid="user">{user ? JSON.stringify(user) : 'No User'}</div>
      <button onClick={handleLogin}>Login</button>
      <button onClick={handleRegister}>Register</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.clear();
    authService.getCurrentUser.mockReturnValue(null);
    authService.isAuthenticated.mockReturnValue(false);
  });

  test('should provide initial state when no user is stored', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated');
    expect(screen.getByTestId('admin')).toHaveTextContent('Not Admin');
    expect(screen.getByTestId('user')).toHaveTextContent('No User');
  });

  test('should restore user from localStorage on initialization', async () => {
    authService.getCurrentUser.mockReturnValue(mockUser);
    authService.isAuthenticated.mockReturnValue(true);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
    expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockUser));
  });

  test('should identify admin user correctly', async () => {
    authService.getCurrentUser.mockReturnValue(mockAdminUser);
    authService.isAuthenticated.mockReturnValue(true);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
    expect(screen.getByTestId('admin')).toHaveTextContent('Admin');
  });

  test('should handle successful login', async () => {
    authService.login.mockResolvedValueOnce({
      access_token: 'mock-token',
      user: mockUser
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    });

    const loginButton = screen.getByText('Login');
    
    await act(async () => {
      fireEvent.click(loginButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
    });

    expect(authService.login).toHaveBeenCalledWith({ email: 'test@example.com', password: 'test' });
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('user', expect.any(String));
  });

  test('should handle login failure', async () => {
    const mockError = new Error('Invalid credentials');
    authService.login.mockRejectedValueOnce(mockError);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    });

    const loginButton = screen.getByText('Login');
    
    await act(async () => {
      fireEvent.click(loginButton);
    });

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalled();
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated');
  });

  test('should handle successful registration', async () => {
    authService.register.mockResolvedValueOnce({
      message: 'User created successfully',
      user: mockUser
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    });

    const registerButton = screen.getByText('Register');
    
    await act(async () => {
      fireEvent.click(registerButton);
    });

    await waitFor(() => {
      expect(authService.register).toHaveBeenCalledWith({ 
        email: 'test@example.com', 
        password: 'test', 
        first_name: 'Test', 
        last_name: 'User' 
      });
    });
  });

  test('should handle logout', async () => {
    authService.getCurrentUser.mockReturnValue(mockUser);
    authService.isAuthenticated.mockReturnValue(true);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');

    const logoutButton = screen.getByText('Logout');
    
    await act(async () => {
      fireEvent.click(logoutButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated');
    });

    expect(authService.logout).toHaveBeenCalled();
  });

  test('should handle error during initialization', async () => {
    authService.getCurrentUser.mockImplementation(() => {
      throw new Error('Error checking auth');
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated');
    expect(consoleSpy).toHaveBeenCalledWith('Erreur lors de la vérification de l\'authentification:', expect.any(Error));
    
    consoleSpy.mockRestore();
  });
});
