import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
// Import the real AuthContext to use in tests
import { AuthContext } from './contexts/AuthContext';

// ===== MOCKS COMMUNS =====

// Mock axios complet (utilisé par tous les tests)
export const createAxiosMock = () => ({
  create: jest.fn(() => createAxiosMock()),
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
  interceptors: {
    request: {
      use: jest.fn()
    },
    response: {
      use: jest.fn()
    }
  }
});

// Mock axios legacy pour compatibilité
export const mockAxios = createAxiosMock();

// Mock AuthContext (utilisé par tous les composants qui nécessitent l'auth)
export const createAuthContextMock = () => {
  const mockUseAuth = jest.fn();
  return {
    mockUseAuth,
    mockModule: {
      AuthContext: {
        Provider: ({ children }) => children,
        Consumer: ({ children }) => children(null)
      },
      useAuth: () => mockUseAuth()
    }
  };
};

// Mock react-router-dom Navigate
export const createNavigateMock = () => {
  const mockNavigate = jest.fn();
  return {
    mockNavigate,
    mockComponent: ({ to, replace }) => {
      mockNavigate(to, replace);
      return <div data-testid="navigate" data-to={to}>Redirecting to {to}</div>;
    }
  };
};

// Mock users pour les tests
export const mockUser = {
  id: 1,
  username: 'test@example.com',
  name: 'Test',
  last_name: 'User',
  is_admin: false
};

export const mockAdminUser = {
  id: 2,
  username: 'admin@example.com',
  name: 'Admin',
  last_name: 'User',
  is_admin: true
};

export const mockUsers = [
  { id: 1, name: 'John', last_name: 'Doe', username: 'john@example.com' },
  { id: 2, name: 'Jane', last_name: 'Smith', username: 'jane@example.com' }
];

// ===== FONCTIONS UTILITAIRES =====

// Note: Jest ne permet pas d'utiliser des factories de mock dans jest.mock()
// Chaque test doit définir ses mocks inline ou utiliser des helpers après l'initialisation

// Fonction pour render avec AuthContext
export const createRenderWithAuth = (mockUseAuth) => {
  return (authValue, children = null) => {
    mockUseAuth.mockReturnValue(authValue);
    return render(
      <BrowserRouter>
        {children}
      </BrowserRouter>
    );
  };
};

// Setup beforeEach commun
export const setupTestEnvironment = (mocks) => {
  const { mockUseAuth, mockNavigate, ...otherMocks } = mocks;
  
  return () => {
    jest.clearAllMocks();
    if (mockNavigate) mockNavigate.mockClear();
    if (mockUseAuth) mockUseAuth.mockReset();
    
    // Reset autres mocks
    Object.values(otherMocks).forEach(mock => {
      if (mock && typeof mock.mockReset === 'function') {
        mock.mockReset();
      }
    });

    // Mock window.confirm pour les tests de suppression
    delete window.confirm;
    window.confirm = jest.fn(() => true);
  };
};

// Mock API responses communes
export const mockApiResponse = {
  success: (data) => Promise.resolve({ data }),
  users: (users = mockUsers) => Promise.resolve({ users }),
  error: (message = 'API Error', status = 500) => 
    Promise.reject({ 
      response: { 
        data: { message, detail: message }, 
        status 
      } 
    })
};

// ===== PROVIDERS POUR TESTS =====

// Mock AuthProvider pour les tests
const MockAuthProvider = ({ children, value }) => {
  // Si pas de valeur fournie, utiliser une valeur par défaut
  const defaultValue = {
    user: null,
    login: jest.fn().mockResolvedValue({ user: { id: 1, email: 'test@example.com' }, token: 'fake-token' }),
    logout: jest.fn(),
    register: jest.fn().mockResolvedValue({ user: { id: 1, email: 'test@example.com' }, message: 'User registered successfully' }),
    isAuthenticated: false,
    isAdmin: false,
    loading: false
  };
  
  return React.createElement(
    AuthContext.Provider,
    { value: value || defaultValue },
    children
  );
};

// Custom render function with providers
export const renderWithProviders = (ui, options = {}) => {
  const { 
    initialEntries = ['/'], 
    authValue = null,
    withRouter = true,
    ...renderOptions 
  } = options;

  const Wrapper = ({ children }) => {
    if (withRouter) {
      return (
        <BrowserRouter>
          <MockAuthProvider value={authValue}>
            {children}
          </MockAuthProvider>
        </BrowserRouter>
      );
    } else {
      return (
        <MockAuthProvider value={authValue}>
          {children}
        </MockAuthProvider>
      );
    }
  };

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Custom render function for App component (which already has Router)
export const renderAppWithProviders = (ui, options = {}) => {
  const { authValue = null, ...renderOptions } = options;

  // Si on a besoin de simuler un utilisateur authentifié, on override le AuthContext
  if (authValue) {
    const MockAppWrapper = ({ children }) => (
      <MockAuthProvider value={authValue}>
        {children}
      </MockAuthProvider>
    );
    
    return render(ui, { wrapper: MockAppWrapper, ...renderOptions });
  }
  
  // Sinon on rend le composant tel quel (il aura son propre AuthProvider)
  return render(ui, renderOptions);
};

// Custom render for components that need router only
export const renderWithRouter = (ui, options = {}) => {
  const { initialEntries = ['/'], ...renderOptions } = options;

  const Wrapper = ({ children }) => (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Wait for async operations
export const waitForAsyncOperation = () => new Promise(resolve => setTimeout(resolve, 0));

// Custom matcher for testing CSS classes
export const expectToHaveClass = (element, className) => {
  expect(element).toHaveClass(className);
};

// Mock window location
export const mockLocation = (url = 'http://localhost:3000/') => {
  delete window.location;
  window.location = new URL(url);
};

// ===== VALEURS D'AUTH COMMUNES =====

export const createAuthValues = {
  regularUser: {
    user: mockUser,
    logout: jest.fn(),
    isAdmin: false,
    isAuthenticated: true,
    loading: false
  },
  adminUser: {
    user: mockAdminUser,
    logout: jest.fn(),
    isAdmin: true,
    isAuthenticated: true,
    loading: false
  },
  loading: {
    user: null,
    logout: jest.fn(),
    isAdmin: false,
    isAuthenticated: false,
    loading: true
  },
  unauthenticated: {
    user: null,
    logout: jest.fn(),
    isAdmin: false,
    isAuthenticated: false,
    loading: false
  }
};
