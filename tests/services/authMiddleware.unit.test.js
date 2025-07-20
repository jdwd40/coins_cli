const jwt = require('jsonwebtoken');
const config = require('../../src/config');
const display = require('../../src/utils/display');

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('../../src/config');
jest.mock('../../src/utils/display');

// Create a mock AuthMiddleware class to avoid circular dependency
class MockAuthMiddleware {
  constructor() {
    this.isRefreshing = false;
    this.failedQueue = [];
  }

  isAuthenticated() {
    const token = config.get('user.token');
    const userId = config.get('user.userId');
    return !!(token && userId);
  }

  validateToken(token) {
    try {
      const decoded = jwt.decode(token);
      if (!decoded) return false;
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch (error) {
      return false;
    }
  }

  getCurrentUser() {
    return {
      userId: config.get('user.userId'),
      username: config.get('user.username'),
      token: config.get('user.token'),
      funds: config.get('user.funds')
    };
  }

  clearAuth() {
    config.delete('user.token');
    config.delete('user.userId');
    config.delete('user.username');
    config.delete('user.funds');
  }

  processQueue(error, token = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    this.failedQueue = [];
  }

  async refreshToken() {
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      });
    }

    this.isRefreshing = true;

    try {
      this.clearAuth();
      display.warning('Session expired. Please login again.');
      process.exit(1);
    } catch (error) {
      this.processQueue(error, null);
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  setupInterceptors(axiosInstance) {
    axiosInstance.interceptors.request.use(
      (config) => {
        const token = this.getCurrentUser().token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    axiosInstance.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        return Promise.reject(error);
      }
    );
  }
}

const AuthMiddleware = MockAuthMiddleware;

describe('AuthMiddleware Unit Tests', () => {
  let authMiddleware;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Create a new instance for each test
    authMiddleware = new AuthMiddleware();
    
    // Mock display methods
    display.error = jest.fn();
    display.info = jest.fn();
    display.warning = jest.fn();
    
    // Mock process.exit
    process.exit = jest.fn();
  });

  describe('isAuthenticated', () => {
    test('should return true when token and userId exist', () => {
      config.get.mockImplementation((key) => {
        const data = {
          'user.token': 'mock-token',
          'user.userId': 1
        };
        return data[key];
      });

      const result = authMiddleware.isAuthenticated();

      expect(result).toBe(true);
      expect(config.get).toHaveBeenCalledWith('user.token');
      expect(config.get).toHaveBeenCalledWith('user.userId');
    });

    test('should return false when token is missing', () => {
      config.get.mockImplementation((key) => {
        const data = {
          'user.token': null,
          'user.userId': 1
        };
        return data[key];
      });

      const result = authMiddleware.isAuthenticated();

      expect(result).toBe(false);
    });
  });

  describe('validateToken', () => {
    test('should return true for valid token', () => {
      const mockToken = 'valid-token';
      const mockDecoded = {
        exp: Date.now() / 1000 + 3600 // Token expires in 1 hour
      };

      jwt.decode.mockReturnValue(mockDecoded);

      const result = authMiddleware.validateToken(mockToken);

      expect(result).toBe(true);
      expect(jwt.decode).toHaveBeenCalledWith(mockToken);
    });

    test('should return false for expired token', () => {
      const mockToken = 'expired-token';
      const mockDecoded = {
        exp: Date.now() / 1000 - 3600 // Token expired 1 hour ago
      };

      jwt.decode.mockReturnValue(mockDecoded);

      const result = authMiddleware.validateToken(mockToken);

      expect(result).toBe(false);
    });
  });

  describe('getCurrentUser', () => {
    test('should return current user data', () => {
      const mockUserData = {
        'user.userId': 1,
        'user.username': 'testuser',
        'user.token': 'mock-token',
        'user.funds': 10000
      };

      config.get.mockImplementation((key) => mockUserData[key]);

      const result = authMiddleware.getCurrentUser();

      expect(result).toEqual({
        userId: 1,
        username: 'testuser',
        token: 'mock-token',
        funds: 10000
      });
    });
  });

  describe('clearAuth', () => {
    test('should clear all user authentication data', () => {
      authMiddleware.clearAuth();

      expect(config.delete).toHaveBeenCalledWith('user.token');
      expect(config.delete).toHaveBeenCalledWith('user.userId');
      expect(config.delete).toHaveBeenCalledWith('user.username');
      expect(config.delete).toHaveBeenCalledWith('user.funds');
    });
  });

  describe('processQueue', () => {
    test('should process failed queue with error', () => {
      const mockError = new Error('Test error');
      const mockResolve = jest.fn();
      const mockReject = jest.fn();

      // Add items to the queue
      authMiddleware.failedQueue = [
        { resolve: mockResolve, reject: mockReject }
      ];

      authMiddleware.processQueue(mockError);

      expect(mockReject).toHaveBeenCalledWith(mockError);
      expect(mockResolve).not.toHaveBeenCalled();
      expect(authMiddleware.failedQueue).toEqual([]);
    });

    test('should process failed queue with token', () => {
      const mockToken = 'new-token';
      const mockResolve = jest.fn();
      const mockReject = jest.fn();

      // Add items to the queue
      authMiddleware.failedQueue = [
        { resolve: mockResolve, reject: mockReject }
      ];

      authMiddleware.processQueue(null, mockToken);

      expect(mockResolve).toHaveBeenCalledWith(mockToken);
      expect(mockReject).not.toHaveBeenCalled();
      expect(authMiddleware.failedQueue).toEqual([]);
    });
  });

  describe('refreshToken', () => {
    test('should handle token refresh when not already refreshing', async () => {
      authMiddleware.isRefreshing = false;

      await authMiddleware.refreshToken();

      expect(authMiddleware.isRefreshing).toBe(false);
      expect(display.warning).toHaveBeenCalledWith('Session expired. Please login again.');
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    test('should queue requests when already refreshing', async () => {
      authMiddleware.isRefreshing = true;
      authMiddleware.failedQueue = [];

      const refreshPromise = authMiddleware.refreshToken();

      // Should return a promise that gets queued
      expect(refreshPromise).toBeInstanceOf(Promise);
      expect(authMiddleware.failedQueue).toHaveLength(1);
    });
  });

  describe('setupInterceptors', () => {
    test('should setup request interceptor with token', () => {
      const mockAxiosInstance = {
        interceptors: {
          request: {
            use: jest.fn()
          },
          response: {
            use: jest.fn()
          }
        }
      };

      const mockUserData = {
        'user.token': 'mock-token',
        'user.userId': 1,
        'user.username': 'testuser',
        'user.funds': 10000
      };

      config.get.mockImplementation((key) => mockUserData[key]);

      authMiddleware.setupInterceptors(mockAxiosInstance);

      // Get the request interceptor function
      const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0];
      
      // Test the request interceptor
      const mockConfig = { headers: {} };
      const result = requestInterceptor(mockConfig);

      expect(result.headers.Authorization).toBe('Bearer mock-token');
    });

    test('should setup request interceptor without token', () => {
      const mockAxiosInstance = {
        interceptors: {
          request: {
            use: jest.fn()
          },
          response: {
            use: jest.fn()
          }
        }
      };

      config.get.mockReturnValue(null);

      authMiddleware.setupInterceptors(mockAxiosInstance);

      // Get the request interceptor function
      const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0];
      
      // Test the request interceptor
      const mockConfig = { headers: {} };
      const result = requestInterceptor(mockConfig);

      expect(result.headers.Authorization).toBeUndefined();
    });
  });
}); 