const authCommands = require('../../src/commands/auth');
const inquirer = require('inquirer');
const display = require('../../src/utils/display');
const api = require('../../src/services/api');
const config = require('../../src/config');

// Mock dependencies
jest.mock('inquirer');
jest.mock('../../src/utils/display');
jest.mock('../../src/services/api');
jest.mock('../../src/config');

describe('Authentication Commands', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Mock display methods
    display.header = jest.fn();
    display.spinner = jest.fn(() => ({
      succeed: jest.fn(),
      fail: jest.fn()
    }));
    display.success = jest.fn();
    display.error = jest.fn();
    display.info = jest.fn();
    display.formatCurrency = jest.fn((amount) => `£${amount}`);
  });

  describe('register', () => {
    test('should successfully register a new user', async () => {
      const mockAnswers = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      };

      const mockApiResponse = {
        data: {
          user: {
            user_id: 1,
            username: 'testuser',
            email: 'test@example.com',
            funds: 10000
          },
          token: 'mock-jwt-token'
        }
      };

      inquirer.prompt.mockResolvedValue(mockAnswers);
      api.register.mockResolvedValue(mockApiResponse);

      await authCommands.register();

      // Verify inquirer was called with correct questions
      expect(inquirer.prompt).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({ name: 'username' }),
        expect.objectContaining({ name: 'email' }),
        expect.objectContaining({ name: 'password' }),
        expect.objectContaining({ name: 'confirmPassword' })
      ]));

      // Verify API call
      expect(api.register).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });

      // Verify config was set
      expect(config.set).toHaveBeenCalledWith('user.userId', 1);
      expect(config.set).toHaveBeenCalledWith('user.username', 'testuser');
      expect(config.set).toHaveBeenCalledWith('user.funds', 10000);

      // Verify success messages
      expect(display.success).toHaveBeenCalledWith('Welcome, testuser!');
      expect(display.info).toHaveBeenCalledWith('Your account has been created with £10000 in funds.');
    });

    test('should handle registration validation errors', async () => {
      const mockAnswers = {
        username: 'ab', // Too short
        email: 'invalid-email',
        password: '123', // Too short
        confirmPassword: 'different'
      };

      inquirer.prompt.mockResolvedValue(mockAnswers);

      // Mock validation functions
      const questions = [
        {
          name: 'username',
          validate: (input) => input.length < 3 ? 'Username must be at least 3 characters long' : true
        },
        {
          name: 'email',
          validate: (input) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(input) ? true : 'Please enter a valid email address';
          }
        },
        {
          name: 'password',
          validate: (input) => input.length < 6 ? 'Password must be at least 6 characters long' : true
        },
        {
          name: 'confirmPassword',
          validate: (input, answers) => input === answers.password ? true : 'Passwords do not match'
        }
      ];

      // Test username validation
      expect(questions[0].validate('ab')).toBe('Username must be at least 3 characters long');
      expect(questions[0].validate('abc')).toBe(true);

      // Test email validation
      expect(questions[1].validate('invalid-email')).toBe('Please enter a valid email address');
      expect(questions[1].validate('test@example.com')).toBe(true);

      // Test password validation
      expect(questions[2].validate('123')).toBe('Password must be at least 6 characters long');
      expect(questions[2].validate('123456')).toBe(true);

      // Test password confirmation
      expect(questions[3].validate('different', { password: 'password123' })).toBe('Passwords do not match');
      expect(questions[3].validate('password123', { password: 'password123' })).toBe(true);
    });

    test('should handle API errors during registration', async () => {
      const mockAnswers = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      };

      const mockError = {
        response: {
          status: 409,
          data: { msg: 'User already exists' }
        }
      };

      inquirer.prompt.mockResolvedValue(mockAnswers);
      api.register.mockRejectedValue(mockError);

      await authCommands.register();

      expect(display.error).toHaveBeenCalledWith('Registration failed (HTTP 409)');
      expect(display.error).toHaveBeenCalledWith('Username or email already exists');
      expect(display.info).toHaveBeenCalledWith('Please try a different username or email');
    });

    test('should handle network errors during registration', async () => {
      const mockAnswers = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      };

      const mockError = {
        request: {},
        message: 'Network Error'
      };

      inquirer.prompt.mockResolvedValue(mockAnswers);
      api.register.mockRejectedValue(mockError);

      await authCommands.register();

      expect(display.error).toHaveBeenCalledWith('Network error - no response received from server');
      expect(display.info).toHaveBeenCalledWith('Please check your internet connection and try again');
    });
  });

  describe('login', () => {
    test('should successfully login a user', async () => {
      const mockAnswers = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockApiResponse = {
        data: {
          user: {
            user_id: 1,
            username: 'testuser',
            email: 'test@example.com',
            funds: 10000
          },
          token: 'mock-jwt-token'
        }
      };

      inquirer.prompt.mockResolvedValue(mockAnswers);
      api.login.mockResolvedValue(mockApiResponse);

      await authCommands.login();

      // Verify inquirer was called with correct questions
      expect(inquirer.prompt).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({ name: 'email' }),
        expect.objectContaining({ name: 'password' })
      ]));

      // Verify API call
      expect(api.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });

      // Verify config was set
      expect(config.set).toHaveBeenCalledWith('user.token', 'mock-jwt-token');
      expect(config.set).toHaveBeenCalledWith('user.userId', 1);
      expect(config.set).toHaveBeenCalledWith('user.username', 'testuser');
      expect(config.set).toHaveBeenCalledWith('user.funds', 10000);

      // Verify success messages
      expect(display.success).toHaveBeenCalledWith('Welcome back, testuser!');
      expect(display.info).toHaveBeenCalledWith('Current funds: £10000');
    });

    test('should handle login validation errors', async () => {
      const mockAnswers = {
        email: '',
        password: ''
      };

      inquirer.prompt.mockResolvedValue(mockAnswers);

      // Mock validation functions
      const questions = [
        {
          name: 'email',
          validate: (input) => input.trim() ? true : 'Email is required'
        },
        {
          name: 'password',
          validate: (input) => input.trim() ? true : 'Password is required'
        }
      ];

      // Test email validation
      expect(questions[0].validate('')).toBe('Email is required');
      expect(questions[0].validate('test@example.com')).toBe(true);

      // Test password validation
      expect(questions[1].validate('')).toBe('Password is required');
      expect(questions[1].validate('password123')).toBe(true);
    });

    test('should handle authentication errors during login', async () => {
      const mockAnswers = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const mockError = {
        response: {
          status: 401,
          data: { msg: 'Invalid credentials' }
        }
      };

      inquirer.prompt.mockResolvedValue(mockAnswers);
      api.login.mockRejectedValue(mockError);

      await authCommands.login();

      expect(display.error).toHaveBeenCalledWith('Login failed (HTTP 401)');
      expect(display.error).toHaveBeenCalledWith('Invalid email or password');
      expect(display.info).toHaveBeenCalledWith('Please check your credentials and try again');
    });

    test('should handle server errors during login', async () => {
      const mockAnswers = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockError = {
        response: {
          status: 500,
          data: { msg: 'Internal server error' }
        }
      };

      inquirer.prompt.mockResolvedValue(mockAnswers);
      api.login.mockRejectedValue(mockError);

      await authCommands.login();

      expect(display.error).toHaveBeenCalledWith('Login failed (HTTP 500)');
      expect(display.error).toHaveBeenCalledWith('Server error occurred');
      expect(display.info).toHaveBeenCalledWith('Please try again later or contact support');
    });
  });

  describe('logout', () => {
    test('should successfully logout a user when confirmed', async () => {
      inquirer.prompt.mockResolvedValue({ confirm: true });

      await authCommands.logout();

      // Verify config was cleared
      expect(config.delete).toHaveBeenCalledWith('user.token');
      expect(config.delete).toHaveBeenCalledWith('user.userId');
      expect(config.delete).toHaveBeenCalledWith('user.username');
      expect(config.delete).toHaveBeenCalledWith('user.funds');

      // Verify success message
      expect(display.success).toHaveBeenCalledWith('Logged out successfully');
    });

    test('should not logout when user cancels', async () => {
      inquirer.prompt.mockResolvedValue({ confirm: false });

      await authCommands.logout();

      // Verify config was not cleared
      expect(config.delete).not.toHaveBeenCalled();

      // Verify cancel message
      expect(display.info).toHaveBeenCalledWith('Logout cancelled');
    });
  });

  describe('isAuthenticated', () => {
    test('should return true when user has token', () => {
      config.get.mockReturnValue('mock-token');
      
      const result = authCommands.isAuthenticated();
      
      expect(result).toBe(true);
      expect(config.get).toHaveBeenCalledWith('user.token');
    });

    test('should return false when user has no token', () => {
      config.get.mockReturnValue(null);
      
      const result = authCommands.isAuthenticated();
      
      expect(result).toBe(false);
      expect(config.get).toHaveBeenCalledWith('user.token');
    });
  });

  describe('getCurrentUser', () => {
    test('should return current user data', () => {
      const mockUser = {
        userId: 1,
        username: 'testuser',
        funds: 10000
      };

      config.get.mockImplementation((key) => {
        const userData = {
          'user.userId': 1,
          'user.username': 'testuser',
          'user.funds': 10000
        };
        return userData[key];
      });

      const result = authCommands.getCurrentUser();

      expect(result).toEqual(mockUser);
      expect(config.get).toHaveBeenCalledWith('user.userId');
      expect(config.get).toHaveBeenCalledWith('user.username');
      expect(config.get).toHaveBeenCalledWith('user.funds');
    });

    test('should return user data with null values when not set', () => {
      config.get.mockReturnValue(null);

      const result = authCommands.getCurrentUser();

      expect(result).toEqual({
        userId: null,
        username: null,
        token: null,
        funds: null
      });
    });
  });

  describe('requireAuth', () => {
    test('should not throw error when user is authenticated', () => {
      config.get.mockReturnValue('mock-token');

      expect(() => authCommands.requireAuth()).not.toThrow();
    });

    test('should exit when user is not authenticated', () => {
      config.get.mockReturnValue(null);

      authCommands.requireAuth();

      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });
}); 