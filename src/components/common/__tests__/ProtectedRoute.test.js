import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';

jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: {
        use: jest.fn()
      },
      response: {
        use: jest.fn()
      }
    }
  })),
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  interceptors: {
    request: {
      use: jest.fn()
    },
    response: {
      use: jest.fn()
    }
  }
}));

const mockUseAuth = jest.fn();
jest.mock('../../../contexts/AuthContext', () => ({
  AuthContext: {
    Provider: ({ children }) => children,
    Consumer: ({ children }) => children(null)
  },
  useAuth: () => mockUseAuth()
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Navigate: ({ to, replace }) => {
    mockNavigate(to, replace);
    return <div data-testid="navigate" data-to={to}>Redirecting to {to}</div>;
  }
}));

const TestComponent = () => <div data-testid="protected-content">Protected Content</div>;

const renderWithAuth = (authValue, children = <TestComponent />) => {
  mockUseAuth.mockReturnValue(authValue);
  
  return render(
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );
};

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    mockUseAuth.mockReset();
  });

  test('should show loading when loading is true', () => {
    const authValue = {
      loading: true,
      isAuthenticated: false,
      isAdmin: false
    };

    renderWithAuth(authValue, <ProtectedRoute><TestComponent /></ProtectedRoute>);

    expect(screen.getByText('Chargement...')).toBeInTheDocument();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  test('should redirect to login when not authenticated', () => {
    const authValue = {
      loading: false,
      isAuthenticated: false,
      isAdmin: false
    };

    renderWithAuth(authValue, <ProtectedRoute><TestComponent /></ProtectedRoute>);

    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/login');
    expect(screen.getByText('Redirecting to /login')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  test('should render children when authenticated and no admin required', () => {
    const authValue = {
      loading: false,
      isAuthenticated: true,
      isAdmin: false
    };

    renderWithAuth(authValue, <ProtectedRoute><TestComponent /></ProtectedRoute>);

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
  });

  test('should render children when authenticated and is admin', () => {
    const authValue = {
      loading: false,
      isAuthenticated: true,
      isAdmin: true
    };

    renderWithAuth(authValue, <ProtectedRoute><TestComponent /></ProtectedRoute>);

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
  });

  test('should redirect to dashboard when authenticated but not admin and admin required', () => {
    const authValue = {
      loading: false,
      isAuthenticated: true,
      isAdmin: false
    };

    renderWithAuth(authValue, 
      <ProtectedRoute requireAdmin={true}>
        <TestComponent />
      </ProtectedRoute>
    );

    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/dashboard');
    expect(screen.getByText('Redirecting to /dashboard')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  test('should render children when authenticated and admin when admin required', () => {
    const authValue = {
      loading: false,
      isAuthenticated: true,
      isAdmin: true
    };

    renderWithAuth(authValue, 
      <ProtectedRoute requireAdmin={true}>
        <TestComponent />
      </ProtectedRoute>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
  });

  test('should handle missing auth context gracefully', () => {
    // Simuler le cas où useAuth lève une erreur
    mockUseAuth.mockImplementation(() => {
      throw new Error('useAuth must be used within an AuthProvider');
    });

    // Test sans AuthContext Provider - devrait lever une erreur
    expect(() => {
      render(
        <BrowserRouter>
          <ProtectedRoute>
            <TestComponent />
          </ProtectedRoute>
        </BrowserRouter>
      );
    }).toThrow('useAuth must be used within an AuthProvider');
  });
});
