import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../Dashboard';

// Mock axios inline
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    }
  })),
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() }
  }
}));

// Mock AuthContext inline
const mockUseAuth = jest.fn();
jest.mock('../../../contexts/AuthContext', () => ({
  AuthContext: {
    Provider: ({ children }) => children,
    Consumer: ({ children }) => children(null)
  },
  useAuth: () => mockUseAuth()
}));

// Mock du service API inline
jest.mock('../../../services/api', () => ({
  userService: {
    getAllUsers: jest.fn(),
    deleteUser: jest.fn()
  }
}));

// Import du service mocké
import { userService } from '../../../services/api';

// Mock de UserList
jest.mock('../../userlist/UserList', () => {
  return function MockUserList({ users, onDeleteUser, showActions }) {
    return (
      <div data-testid="user-list">
        <div data-testid="user-count">{users.length} utilisateurs</div>
        {users.map(user => (
          <div key={user.id || user._id} data-testid={`user-${user.id || user._id}`}>
            {user.name} {user.last_name}
            {showActions && (
              <button 
                onClick={() => onDeleteUser(user.id || user._id)}
                data-testid={`delete-user-${user.id || user._id}`}
              >
                Supprimer
              </button>
            )}
          </div>
        ))}
      </div>
    );
  };
});

// Utilitaire render simple
const renderWithAuth = (authValue) => {
  mockUseAuth.mockReturnValue(authValue);
  return render(
    <BrowserRouter>
      <Dashboard />
    </BrowserRouter>
  );
};

// Données de test
const mockUser = {
  id: 1,
  username: 'test@example.com',
  name: 'Test',
  last_name: 'User',
  is_admin: false
};

const mockAdminUser = {
  id: 2,
  username: 'admin@example.com',
  name: 'Admin',
  last_name: 'User',
  is_admin: true
};

const mockUsers = [
  { id: 1, name: 'John', last_name: 'Doe', username: 'john@example.com' },
  { id: 2, name: 'Jane', last_name: 'Smith', username: 'jane@example.com' }
];

describe('Dashboard Component', () => {
  let consoleErrorSpy;
  
  beforeEach(() => {
    jest.clearAllMocks();
    userService.getAllUsers.mockReset();
    userService.deleteUser.mockReset();
    
    // Mock window.confirm
    window.confirm = jest.fn(() => true);
    
    // Suppress console.error for cleaner test output
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.error
    if (consoleErrorSpy) {
      consoleErrorSpy.mockRestore();
    }
    // Restore window.confirm
    delete window.confirm;
  });

  test('should render welcome message for regular user', () => {
    const authValue = {
      user: mockUser,
      logout: jest.fn(),
      isAdmin: false,
      isAuthenticated: true,
      loading: false
    };

    renderWithAuth(authValue);

    expect(screen.getByText(/bienvenue/i)).toBeInTheDocument();
    // Check specifically in the welcome text span
    expect(screen.getByText((content, element) => {
      return element && element.className === 'welcome-text' && 
             element.textContent && element.textContent.includes('Test') && 
             element.textContent.includes('User');
    })).toBeInTheDocument();
  });

  test('should render welcome message for admin user', () => {
    const authValue = {
      user: mockAdminUser,
      logout: jest.fn(),
      isAdmin: true,
      isAuthenticated: true,
      loading: false
    };

    renderWithAuth(authValue);

    expect(screen.getByText(/bienvenue/i)).toBeInTheDocument();
    // Check specifically in the welcome text span
    expect(screen.getByText((content, element) => {
      return element && element.className === 'welcome-text' && 
             element.textContent && element.textContent.includes('Admin') && 
             element.textContent.includes('User');
    })).toBeInTheDocument();
    // More flexible check for admin occurrences
    const adminElements = screen.getAllByText(/admin/i);
    expect(adminElements.length).toBeGreaterThanOrEqual(2); // Badge + Status
  });

  test('should show user management section for admin users', () => {
    userService.getAllUsers.mockResolvedValue({ users: mockUsers });
    
    const authValue = {
      user: mockAdminUser,
      logout: jest.fn(),
      isAdmin: true,
      isAuthenticated: true,
      loading: false
    };

    renderWithAuth(authValue);

    expect(screen.getByText(/gestion des utilisateurs/i)).toBeInTheDocument();
    // Check for the specific loading text in the user section
    expect(screen.getByText(/chargement des utilisateurs/i)).toBeInTheDocument();
  });

  test('should not show user management section for regular users', () => {
    const authValue = {
      user: mockUser,
      logout: jest.fn(),
      isAdmin: false
    };

    renderWithAuth(authValue);

    expect(screen.queryByText(/gestion des utilisateurs/i)).not.toBeInTheDocument();
    expect(screen.getByText(/accès limité/i)).toBeInTheDocument();
  });

  test('should display user information correctly', () => {
    const authValue = {
      user: mockUser,
      logout: jest.fn(),
      isAdmin: false
    };

    renderWithAuth(authValue);

    expect(screen.getByText(/tableau de bord/i)).toBeInTheDocument();
    expect(screen.getByText(/informations personnelles/i)).toBeInTheDocument();
    expect(screen.getByText(mockUser.username)).toBeInTheDocument();
  });

  test('should display user role correctly for regular user', () => {
    const authValue = {
      user: mockUser,
      logout: jest.fn(),
      isAdmin: false
    };

    renderWithAuth(authValue);

    expect(screen.getByText(/utilisateur$/i)).toBeInTheDocument();
  });

  test('should display admin role correctly for admin user', () => {
    const authValue = {
      user: mockAdminUser,
      logout: jest.fn(),
      isAdmin: true
    };

    renderWithAuth(authValue);

    expect(screen.getByText(/administrateur/i)).toBeInTheDocument();
  });

  test('should handle missing user gracefully', () => {
    const authValue = {
      user: null,
      logout: jest.fn(),
      isAdmin: false
    };

    renderWithAuth(authValue);

    expect(screen.getByText(/tableau de bord/i)).toBeInTheDocument();
    // Ne devrait pas crash, même sans utilisateur
  });

  test('should call logout when disconnect button is clicked', () => {
    const mockLogout = jest.fn();
    const authValue = {
      user: mockUser,
      logout: mockLogout,
      isAdmin: false
    };

    renderWithAuth(authValue);

    const logoutButton = screen.getByRole('button', { name: /déconnexion/i });
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  test('should render with proper CSS classes', () => {
    const authValue = {
      user: mockUser,
      logout: jest.fn(),
      isAdmin: false
    };

    const { container } = renderWithAuth(authValue);

    expect(container.firstChild).toHaveClass('dashboard');
  });

  test('should fetch users for admin on mount', async () => {
    userService.getAllUsers.mockResolvedValue({ users: mockUsers });
    
    const authValue = {
      user: mockAdminUser,
      logout: jest.fn(),
      isAdmin: true
    };

    renderWithAuth(authValue);

    await waitFor(() => {
      expect(userService.getAllUsers).toHaveBeenCalledTimes(1);
    });
  });

  test('should handle refresh button click', async () => {
    userService.getAllUsers.mockResolvedValue({ users: mockUsers });
    
    const authValue = {
      user: mockAdminUser,
      logout: jest.fn(),
      isAdmin: true
    };

    renderWithAuth(authValue);

    // Wait for component to settle and find refresh button
    await waitFor(() => {
      expect(userService.getAllUsers).toHaveBeenCalledTimes(1);
    }, { timeout: 3000 });

    // Find the refresh button by text content
    const refreshButton = await waitFor(() => {
      return screen.getByRole('button', { name: /actualiser/i });
    }, { timeout: 3000 });

    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(userService.getAllUsers).toHaveBeenCalledTimes(2); // 1 au mount + 1 au click
    }, { timeout: 3000 });
  });

  test('should handle user deletion', async () => {
    userService.getAllUsers.mockResolvedValue({ users: mockUsers });
    userService.deleteUser.mockResolvedValue({});
    
    const authValue = {
      user: mockAdminUser,
      logout: jest.fn(),
      isAdmin: true
    };

    renderWithAuth(authValue);

    // Wait for the user list to load
    await waitFor(() => {
      expect(screen.getByTestId('user-list')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Find and click the delete button
    const deleteButton = screen.getByTestId('delete-user-1');
    fireEvent.click(deleteButton);

    // Verify that deleteUser was called
    await waitFor(() => {
      expect(userService.deleteUser).toHaveBeenCalledWith(1);
    }, { timeout: 3000 });
  });

  test('should handle API error gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    userService.getAllUsers.mockRejectedValue(new Error('Network error'));
    
    const authValue = {
      user: mockAdminUser,
      logout: jest.fn(),
      isAdmin: true
    };

    renderWithAuth(authValue);

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    }, { timeout: 3000 });
    
    consoleErrorSpy.mockRestore();
  });
});
