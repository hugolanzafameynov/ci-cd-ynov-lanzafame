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
    getAllUsersSensitive: jest.fn(),
    deleteUser: jest.fn(),
    getProfile: jest.fn()
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
            {user.name} {user.lastName}
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
  lastName: 'User',
  is_admin: false
};

const mockAdminUser = {
  id: 2,
  username: 'admin@example.com',
  name: 'Admin',
  lastName: 'User',
  is_admin: true
};

const mockUsers = [
  { id: 1, name: 'John', lastName: 'Doe', username: 'john@example.com' },
  { id: 2, name: 'Jane', lastName: 'Smith', username: 'jane@example.com' }
];

describe('Dashboard Component', () => {
  test('should create a post via the form', async () => {
    // Mock postService.createPost
    const { postService } = require('../../../services/postApi');
    const mockCreatePost = jest.fn().mockResolvedValue({});
    postService.createPost = mockCreatePost;

    const authValue = {
      user: mockUser,
      logout: jest.fn(),
      isAdmin: false
    };

    renderWithAuth(authValue);

    // Remplir le formulaire
    const titleInput = screen.getByLabelText(/titre du post/i);
    const contentInput = screen.getByLabelText(/contenu/i);
    const submitButton = screen.getByRole('button', { name: /créer le post/i });

    fireEvent.change(titleInput, { target: { value: 'Mon titre' } });
    fireEvent.change(contentInput, { target: { value: 'Mon contenu' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreatePost).toHaveBeenCalledWith({
        title: 'Mon titre',
        content: 'Mon contenu'
      });
      expect(screen.getByText(/post créé avec succès/i)).toBeInTheDocument();
    });
  });
  let consoleErrorSpy;
  
  beforeEach(() => {
    jest.clearAllMocks();
    userService.getAllUsers.mockReset();
    userService.getAllUsersSensitive.mockReset();
    userService.deleteUser.mockReset();
    userService.getProfile.mockReset();
  

    window.confirm = jest.fn(() => true);
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    if (consoleErrorSpy) {
      consoleErrorSpy.mockRestore();
    }
    delete window.confirm;
  });

  test('should not show user management section for regular users', () => {
    userService.getAllUsers.mockResolvedValue({ users: mockUsers });
    const authValue = {
      user: mockUser,
      logout: jest.fn(),
      isAdmin: false
    };

    renderWithAuth(authValue);
    expect(screen.getByText(/Liste des utilisateurs/i)).toBeInTheDocument();
    expect(screen.queryByTestId('delete-user-1')).not.toBeInTheDocument();
  });

  test('should display user information correctly', async () => {
    userService.getProfile.mockResolvedValue(mockUser);
    const authValue = {
      user: mockUser,
      logout: jest.fn(),
      isAdmin: false
    };

    renderWithAuth(authValue);

    expect(screen.getByText(/Tableau de bord/i)).toBeInTheDocument();
    expect(screen.getByText(/Informations personnelles/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(mockUser.username)).toBeInTheDocument();
    });
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
    expect(screen.getByText(/Tableau de bord/i)).toBeInTheDocument();
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
    userService.getAllUsersSensitive.mockResolvedValue({ users: mockUsers });
    
    const authValue = {
      user: mockAdminUser,
      logout: jest.fn(),
      isAdmin: true
    };

    renderWithAuth(authValue);

    await waitFor(() => {
      expect(userService.getAllUsersSensitive).toHaveBeenCalledTimes(1);
    });
  });

  test('should handle refresh button click', async () => {
    userService.getAllUsersSensitive.mockResolvedValue({ users: mockUsers });
    
    const authValue = {
      user: mockAdminUser,
      logout: jest.fn(),
      isAdmin: true
    };

    renderWithAuth(authValue);

    // Wait for component to settle and find refresh button
    await waitFor(() => {
      expect(userService.getAllUsersSensitive).toHaveBeenCalledTimes(1);
    }, { timeout: 3000 });

    // Find the refresh button by text content
    const refreshButton = await waitFor(() => {
      return screen.getByRole('button', { name: /actualiser/i });
    }, { timeout: 3000 });

    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(userService.getAllUsersSensitive).toHaveBeenCalledTimes(2); // 1 au mount + 1 au click
    }, { timeout: 3000 });
  });

  test('should handle user deletion', async () => {
    userService.getAllUsersSensitive.mockResolvedValue({ users: mockUsers });
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
    userService.getAllUsersSensitive.mockRejectedValue(new Error('Network error'));
    
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
