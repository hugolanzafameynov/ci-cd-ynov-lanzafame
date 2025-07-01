import { screen, fireEvent, waitFor, act } from '@testing-library/react';
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
        lastName: 'User',
        birthdate: '2000-01-01',
        city: 'Paris',
        postalCode: '75000'
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
    const birthdateInput = screen.getByTestId('register-birthdate');
    const cityInput = screen.getByTestId('register-city');
    const postalCodeInput = screen.getByTestId('register-postal-code');
    const submitButton = screen.getByTestId('register-submit-button');

    fireEvent.change(nameInput, { target: { value: 'Test' } });
    fireEvent.change(lastNameInput, { target: { value: 'User' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.change(birthdateInput, { target: { value: '2000-01-01' } });
    fireEvent.change(cityInput, { target: { value: 'Paris' } });
    fireEvent.change(postalCodeInput, { target: { value: '75000' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        username: 'test@example.com',
        password: 'password123',
        name: 'Test',
        last_name: 'User',
        birthdate: '2000-01-01',
        city: 'Paris',
        postal_code: '75000'
      });
    });

    await waitFor(() => {
      expect(screen.getByText(/votre compte a été créé avec succès/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    }, { timeout: 3000 });
  });

  test('should show error message on registration failure', async () => {
    const mockRegister = jest.fn().mockRejectedValue(
      new Error('Email already exists')
    );
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
    const birthdateInput = screen.getByTestId('register-birthdate');
    const cityInput = screen.getByTestId('register-city');
    const postalCodeInput = screen.getByTestId('register-postal-code');
    const submitButton = screen.getByTestId('register-submit-button');
    fireEvent.change(nameInput, { target: { value: 'Test' } });
    fireEvent.change(lastNameInput, { target: { value: 'User' } });
    fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.change(birthdateInput, { target: { value: '2000-01-01' } });
    fireEvent.change(cityInput, { target: { value: 'Paris' } });
    fireEvent.change(postalCodeInput, { target: { value: '75000' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument();
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
      const birthdateInput = screen.getByTestId('register-birthdate');
      const cityInput = screen.getByTestId('register-city');
      const postalCodeInput = screen.getByTestId('register-postal-code');
      expect(nameInput).toBeInvalid();
      expect(lastNameInput).toBeInvalid();
      expect(emailInput).toBeInvalid();
      expect(passwordInput).toBeInvalid();
      expect(confirmPasswordInput).toBeInvalid();
      expect(birthdateInput).toBeInvalid();
      expect(cityInput).toBeInvalid();
      expect(postalCodeInput).toBeInvalid();
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

    const nameInput = screen.getByTestId('register-first-name');
    const lastNameInput = screen.getByTestId('register-last-name');
    const emailInput = screen.getByTestId('register-email');
    const birthdateInput = screen.getByTestId('register-birthdate');
    const cityInput = screen.getByTestId('register-city');
    const postalCodeInput = screen.getByTestId('register-postal-code');
    const passwordInput = screen.getByTestId('register-password');
    const confirmPasswordInput = screen.getByTestId('register-confirm-password');
    const submitButton = screen.getByTestId('register-submit-button');

    fireEvent.change(nameInput, { target: { value: 'Test' } });
    fireEvent.change(lastNameInput, { target: { value: 'User' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(birthdateInput, { target: { value: '2000-01-01' } });
    fireEvent.change(cityInput, { target: { value: 'Paris' } });
    fireEvent.change(postalCodeInput, { target: { value: '75000' } });
    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: '123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Le mot de passe doit contenir au moins 6 caractères')).toBeInTheDocument();
    });
  });

  test('should validate password confirmation', async () => {
    renderWithProviders(<Register />);

    const nameInput = screen.getByTestId('register-first-name');
    const lastNameInput = screen.getByTestId('register-last-name');
    const emailInput = screen.getByTestId('register-email');
    const birthdateInput = screen.getByTestId('register-birthdate');
    const cityInput = screen.getByTestId('register-city');
    const postalCodeInput = screen.getByTestId('register-postal-code');
    const passwordInput = screen.getByTestId('register-password');
    const confirmPasswordInput = screen.getByTestId('register-confirm-password');
    const submitButton = screen.getByTestId('register-submit-button');

    fireEvent.change(nameInput, { target: { value: 'Test' } });
    fireEvent.change(lastNameInput, { target: { value: 'User' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(birthdateInput, { target: { value: '2000-01-01' } });
    fireEvent.change(cityInput, { target: { value: 'Paris' } });
    fireEvent.change(postalCodeInput, { target: { value: '75000' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'differentpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Les mots de passe ne correspondent pas')).toBeInTheDocument();
    });
  });

  test('should disable submit button during loading', async () => {
    jest.useFakeTimers();
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
    const birthdateInput = screen.getByTestId('register-birthdate');
    const cityInput = screen.getByTestId('register-city');
    const postalCodeInput = screen.getByTestId('register-postal-code');
    const submitButton = screen.getByTestId('register-submit-button');

    fireEvent.change(nameInput, { target: { value: 'Test' } });
    fireEvent.change(lastNameInput, { target: { value: 'User' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.change(birthdateInput, { target: { value: '2000-01-01' } });
    fireEvent.change(cityInput, { target: { value: 'Paris' } });
    fireEvent.change(postalCodeInput, { target: { value: '75000' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });

    jest.runAllTimers();
    jest.useRealTimers();
  });

  test('should redirect to login after successful registration', async () => {
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
    const birthdateInput = screen.getByTestId('register-birthdate');
    const cityInput = screen.getByTestId('register-city');
    const postalCodeInput = screen.getByTestId('register-postal-code');
    const submitButton = screen.getByTestId('register-submit-button');
    fireEvent.change(nameInput, { target: { value: 'Test' } });
    fireEvent.change(lastNameInput, { target: { value: 'User' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.change(birthdateInput, { target: { value: '2000-01-01' } });
    fireEvent.change(cityInput, { target: { value: 'Paris' } });
    fireEvent.change(postalCodeInput, { target: { value: '75000' } });
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
    const birthdateInput = screen.getByTestId('register-birthdate');
    const cityInput = screen.getByTestId('register-city');
    const postalCodeInput = screen.getByTestId('register-postal-code');
    const submitButton = screen.getByTestId('register-submit-button');
    fireEvent.change(nameInput, { target: { value: 'Test' } });
    fireEvent.change(lastNameInput, { target: { value: 'User' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.change(birthdateInput, { target: { value: '2000-01-01' } });
    fireEvent.change(cityInput, { target: { value: 'Paris' } });
    fireEvent.change(postalCodeInput, { target: { value: '75000' } });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText(/votre compte a été créé avec succès/i)).toBeInTheDocument();
    });
  });

  test('should show error if user is under 18', async () => {
    renderWithProviders(<Register />);
    const nameInput = screen.getByTestId('register-first-name');
    const lastNameInput = screen.getByTestId('register-last-name');
    const emailInput = screen.getByTestId('register-email');
    const passwordInput = screen.getByTestId('register-password');
    const confirmPasswordInput = screen.getByTestId('register-confirm-password');
    const birthdateInput = screen.getByTestId('register-birthdate');
    const cityInput = screen.getByTestId('register-city');
    const postalCodeInput = screen.getByTestId('register-postal-code');
    const submitButton = screen.getByTestId('register-submit-button');
    fireEvent.change(nameInput, { target: { value: 'Test' } });
    fireEvent.change(lastNameInput, { target: { value: 'User' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    // Date de naissance < 18 ans
    const minorDate = `${new Date().getFullYear() - 10}-01-01`;
    fireEvent.change(birthdateInput, { target: { value: minorDate } });
    fireEvent.change(cityInput, { target: { value: 'Paris' } });
    fireEvent.change(postalCodeInput, { target: { value: '75000' } });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText('Vous devez avoir au moins 18 ans pour vous inscrire')).toBeInTheDocument();
    });
  });

  test('should show error if postal code is invalid', async () => {
    renderWithProviders(<Register />);
    const nameInput = screen.getByTestId('register-first-name');
    const lastNameInput = screen.getByTestId('register-last-name');
    const emailInput = screen.getByTestId('register-email');
    const passwordInput = screen.getByTestId('register-password');
    const confirmPasswordInput = screen.getByTestId('register-confirm-password');
    const birthdateInput = screen.getByTestId('register-birthdate');
    const cityInput = screen.getByTestId('register-city');
    const postalCodeInput = screen.getByTestId('register-postal-code');
    const submitButton = screen.getByTestId('register-submit-button');
    fireEvent.change(nameInput, { target: { value: 'Test' } });
    fireEvent.change(lastNameInput, { target: { value: 'User' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.change(birthdateInput, { target: { value: '2000-01-01' } });
    fireEvent.change(cityInput, { target: { value: 'Paris' } });
    fireEvent.change(postalCodeInput, { target: { value: 'ABCDE' } });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText('Le code postal doit être composé de 5 chiffres')).toBeInTheDocument();
    });
  });

  test('should show error if first name or last name is invalid', async () => {
    renderWithProviders(<Register />);
    const nameInput = screen.getByTestId('register-first-name');
    const lastNameInput = screen.getByTestId('register-last-name');
    const emailInput = screen.getByTestId('register-email');
    const passwordInput = screen.getByTestId('register-password');
    const confirmPasswordInput = screen.getByTestId('register-confirm-password');
    const birthdateInput = screen.getByTestId('register-birthdate');
    const cityInput = screen.getByTestId('register-city');
    const postalCodeInput = screen.getByTestId('register-postal-code');
    const submitButton = screen.getByTestId('register-submit-button');
    // Prénom invalide
    fireEvent.change(nameInput, { target: { value: '1' } });
    fireEvent.change(lastNameInput, { target: { value: 'User' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.change(birthdateInput, { target: { value: '2000-01-01' } });
    fireEvent.change(cityInput, { target: { value: 'Paris' } });
    fireEvent.change(postalCodeInput, { target: { value: '75000' } });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText('Le prénom est invalide')).toBeInTheDocument();
    });
    // Nom invalide
    fireEvent.change(nameInput, { target: { value: 'Jean' } });
    fireEvent.change(lastNameInput, { target: { value: '2' } });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText('Le nom est invalide')).toBeInTheDocument();
    });
  });
});
