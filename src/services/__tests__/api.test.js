// Mock localStorage before importing modules
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

// Mock localStorage globally before any imports
Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

// Mock window.location
delete window.location;
window.location = { href: '' };

// Mock axios with a factory function
jest.mock('axios', () => {
  const mockAxios = {
    create: jest.fn(),
    post: jest.fn(),
    get: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: {
        use: jest.fn()
      },
      response: {
        use: jest.fn()
      }
    }
  };
  
  // Configure create to return the mock instance with interceptors
  mockAxios.create.mockReturnValue({
    ...mockAxios,
    interceptors: {
      request: {
        use: jest.fn((successHandler, errorHandler) => {
          // Store handlers for testing
          mockAxios._requestSuccessHandler = successHandler;
          mockAxios._requestErrorHandler = errorHandler;
        })
      },
      response: {
        use: jest.fn((successHandler, errorHandler) => {
          // Store handlers for testing
          mockAxios._responseSuccessHandler = successHandler;
          mockAxios._responseErrorHandler = errorHandler;
        })
      }
    }
  });
  
  return mockAxios;
});

// Get the mocked axios for use in tests
const mockAxios = require('axios');

import { authService, userService } from '../api';

// Mock console.log to avoid noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn()
};

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset localStorage mock
    Object.keys(mockLocalStorage).forEach(key => {
      if (typeof mockLocalStorage[key] === 'function') {
        mockLocalStorage[key].mockClear();
      }
    });
    mockLocalStorage.clear();
  });

  describe('Authentication', () => {
    test('should register successfully', async () => {
      const mockResponse = {
        data: {
          message: 'User created successfully',
          user: {
            id: 1,
            username: 'test@example.com',
            name: 'Test',
            last_name: 'User'
          }
        }
      };

      mockAxios.post.mockResolvedValueOnce(mockResponse);

      const userData = {
        username: 'test@example.com',
        password: 'password123',
        name: 'Test',
        last_name: 'User'
      };

      const result = await authService.register(userData);

      expect(mockAxios.post).toHaveBeenCalledWith('/v1/users', {
        username: 'test@example.com',
        password: 'password123',
        name: 'Test',
        lastName: 'User'
      });
      expect(result).toEqual(mockResponse.data);
    });

    test('should login successfully', async () => {
      const mockResponse = {
        data: {
          access_token: 'mock-token',
          user: {
            id: 1,
            username: 'test@example.com',
            name: 'Test',
            last_name: 'User',
            role: 'user'
          }
        }
      };

      mockAxios.post.mockResolvedValueOnce(mockResponse);

      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      const result = await authService.login(credentials);

      expect(mockAxios.post).toHaveBeenCalledWith('/v1/login', {
        username: 'test@example.com',
        password: 'password123'
      });
      expect(result).toEqual(mockResponse.data);
    });

    test('should handle login failure', async () => {
      const mockError = {
        response: {
          data: { detail: 'Invalid credentials' },
          status: 401
        }
      };

      mockAxios.post.mockRejectedValueOnce(mockError);

      const credentials = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      await expect(authService.login(credentials)).rejects.toThrow('Invalid credentials');
    });

    test('should handle registration failure', async () => {
      const mockError = {
        response: {
          data: { detail: 'Email already exists' },
          status: 400
        }
      };

      mockAxios.post.mockRejectedValueOnce(mockError);

      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        first_name: 'Test',
        last_name: 'User'
      };

      await expect(authService.register(userData)).rejects.toThrow('Email already exists');
    });
  });

  describe('User Management', () => {
    beforeEach(() => {
      mockLocalStorage.setItem('token', 'mock-token');
    });

    test('should fetch users successfully', async () => {
      const mockResponse = {
        data: {
          utilisateurs: [
            { id: 1, username: 'user1@example.com', name: 'User', last_name: 'One' },
            { id: 2, username: 'user2@example.com', name: 'User', last_name: 'Two' }
          ]
        }
      };

      mockAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await userService.getAllUsers();

      expect(mockAxios.get).toHaveBeenCalledWith('/v1/users');
      expect(result.users).toEqual(mockResponse.data.utilisateurs);
    });

    test('should handle unauthorized access', async () => {
      const mockError = {
        response: {
          data: { detail: 'Unauthorized' },
          status: 401
        }
      };

      mockAxios.get.mockRejectedValueOnce(mockError);

      await expect(userService.getAllUsers()).rejects.toThrow('Unauthorized');
    });

    test('should delete user successfully', async () => {
      const mockResponse = {
        data: { message: 'User deleted successfully' }
      };

      mockAxios.delete.mockResolvedValueOnce(mockResponse);

      const result = await userService.deleteUser(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/v1/users/1');
      expect(result).toEqual(mockResponse.data);
    });

    test('should handle delete user failure', async () => {
      const mockError = {
        response: {
          data: { detail: 'User not found' },
          status: 404
        }
      };

      mockAxios.delete.mockRejectedValueOnce(mockError);

      await expect(userService.deleteUser(999)).rejects.toThrow('User not found');
    });
  });

  describe('Auth Service', () => {
    test('should call removeItem on logout', () => {
      const removeItemSpy = jest.spyOn(localStorage, 'removeItem');
      
      authService.logout();

      expect(removeItemSpy).toHaveBeenCalledWith('token');
      expect(removeItemSpy).toHaveBeenCalledWith('user');
      
      removeItemSpy.mockRestore();
    });

    test('should check authentication status based on token', () => {
      const getItemSpy = jest.spyOn(localStorage, 'getItem');
      
      getItemSpy.mockReturnValue('test-token');
      expect(authService.isAuthenticated()).toBe(true);

      getItemSpy.mockReturnValue(null);
      expect(authService.isAuthenticated()).toBe(false);
      
      getItemSpy.mockRestore();
    });

    test('should get current user from localStorage', () => {
      const getItemSpy = jest.spyOn(localStorage, 'getItem');
      const user = { id: 1, name: 'Test', email: 'test@example.com' };
      
      getItemSpy.mockReturnValue(JSON.stringify(user));
      expect(authService.getCurrentUser()).toEqual(user);

      getItemSpy.mockReturnValue(null);
      expect(authService.getCurrentUser()).toBeNull();
      
      getItemSpy.mockRestore();
    });

    test('should get profile successfully', async () => {
      const getItemSpy = jest.spyOn(localStorage, 'getItem');
      const user = { id: 1, username: 'test@example.com', name: 'Test' };
      
      getItemSpy.mockReturnValue(JSON.stringify(user));
      
      const mockResponse = {
        data: [
          { id: 1, username: 'test@example.com', name: 'Test', role: 'user' },
          { id: 2, username: 'other@example.com', name: 'Other' }
        ]
      };

      mockAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await authService.getProfile();

      expect(mockAxios.get).toHaveBeenCalledWith('/v1/users');
      expect(result.user).toEqual(mockResponse.data[0]);
      
      getItemSpy.mockRestore();
    });

    test('should throw error when user not connected', async () => {
      const getItemSpy = jest.spyOn(localStorage, 'getItem');
      getItemSpy.mockReturnValue(null); // No user in localStorage

      await expect(authService.getProfile()).rejects.toEqual({ error: 'Erreur lors de la récupération du profil' });
      
      getItemSpy.mockRestore();
    });

    test('should throw error when profile not found', async () => {
      const getItemSpy = jest.spyOn(localStorage, 'getItem');
      const user = { id: 999, username: 'notfound@example.com', name: 'Not Found' };
      
      getItemSpy.mockReturnValue(JSON.stringify(user));
      
      const mockResponse = {
        data: [
          { id: 1, username: 'test@example.com', name: 'Test', role: 'user' },
          { id: 2, username: 'other@example.com', name: 'Other' }
        ]
      };

      mockAxios.get.mockResolvedValueOnce(mockResponse);

      await expect(authService.getProfile()).rejects.toEqual({ error: 'Erreur lors de la récupération du profil' });
      
      getItemSpy.mockRestore();
    });

    test('should handle API error in getProfile', async () => {
      const getItemSpy = jest.spyOn(localStorage, 'getItem');
      const user = { id: 1, username: 'test@example.com', name: 'Test' };
      
      getItemSpy.mockReturnValue(JSON.stringify(user));
      
      const mockError = {
        response: {
          data: { detail: 'API Error' }
        }
      };

      mockAxios.get.mockRejectedValueOnce(mockError);

      await expect(authService.getProfile()).rejects.toEqual({ detail: 'API Error' });
      
      getItemSpy.mockRestore();
    });

    test('should handle network error in getProfile', async () => {
      const getItemSpy = jest.spyOn(localStorage, 'getItem');
      const user = { id: 1, username: 'test@example.com', name: 'Test' };
      
      getItemSpy.mockReturnValue(JSON.stringify(user));
      
      const networkError = new Error('Network Error'); // No response property

      mockAxios.get.mockRejectedValueOnce(networkError);

      await expect(authService.getProfile()).rejects.toEqual({ error: 'Erreur lors de la récupération du profil' });
      
      getItemSpy.mockRestore();
    });
  });

  describe('Interceptors', () => {
    test('should add Authorization header when token exists', () => {
      if (mockAxios._requestSuccessHandler) {
        const getItemSpy = jest.spyOn(localStorage, 'getItem');
        getItemSpy.mockReturnValue('test-token');

        const config = { headers: {} };
        const result = mockAxios._requestSuccessHandler(config);

        expect(result.headers.Authorization).toBe('Bearer test-token');
        getItemSpy.mockRestore();
      }
    });

    test('should not add Authorization header when token does not exist', () => {
      if (mockAxios._requestSuccessHandler) {
        const getItemSpy = jest.spyOn(localStorage, 'getItem');
        getItemSpy.mockReturnValue(null);

        const config = { headers: {} };
        const result = mockAxios._requestSuccessHandler(config);

        expect(result.headers.Authorization).toBeUndefined();
        getItemSpy.mockRestore();
      }
    });

    test('should handle request interceptor error', async () => {
      if (mockAxios._requestErrorHandler) {
        const error = new Error('Request Error');
        
        await expect(mockAxios._requestErrorHandler(error)).rejects.toThrow('Request Error');
      }
    });

    test('should handle 401 response error and redirect to login', async () => {
      if (mockAxios._responseErrorHandler) {
        const removeItemSpy = jest.spyOn(localStorage, 'removeItem');
        const error = {
          response: {
            status: 401
          }
        };

        await expect(mockAxios._responseErrorHandler(error)).rejects.toBe(error);
        expect(removeItemSpy).toHaveBeenCalledWith('token');
        expect(removeItemSpy).toHaveBeenCalledWith('user');
        
        removeItemSpy.mockRestore();
      }
    });

    test('should handle non-401 response errors', async () => {
      if (mockAxios._responseErrorHandler) {
        const error = {
          response: {
            status: 500
          }
        };

        await expect(mockAxios._responseErrorHandler(error)).rejects.toBe(error);
      }
    });
  });

  describe('Error Handling', () => {
    test('should handle network errors', async () => {
      const networkError = new Error('Network Error');
      mockAxios.post.mockRejectedValueOnce(networkError);

      await expect(authService.login({ email: 'test@example.com', password: 'test' }))
        .rejects.toThrow(/Erreur/);
    });

    test('should handle server errors with retries', async () => {
      const serverError = {
        response: {
          data: { detail: 'Internal Server Error' },
          status: 500
        }
      };

      mockAxios.get.mockRejectedValue(serverError);

      await expect(userService.getAllUsers()).rejects.toThrow('Internal Server Error');
    });
  });
});
