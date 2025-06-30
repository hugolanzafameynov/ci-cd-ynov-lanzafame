import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';

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
