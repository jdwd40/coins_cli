const jwt = require('jsonwebtoken');
const config = require('../config');
const api = require('./api');
const display = require('../utils/display');

class AuthMiddleware {
  constructor() {
    this.isRefreshing = false;
    this.failedQueue = [];
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = config.get('user.token');
    const userId = config.get('user.userId');
    return !!(token && userId);
  }

  // Validate JWT token
  validateToken(token) {
    try {
      // Decode token without verification to check expiration
      const decoded = jwt.decode(token);
      if (!decoded) return false;
      
      // Check if token is expired
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch (error) {
      return false;
    }
  }

  // Get current user info
  getCurrentUser() {
    return {
      userId: config.get('user.userId'),
      username: config.get('user.username'),
      token: config.get('user.token')
    };
  }

  // Require authentication - middleware function
  requireAuth() {
    const token = config.get('user.token');
    const userId = config.get('user.userId');

    if (!token || !userId) {
      display.error('Authentication required');
      display.info('Please run: coins-cli login');
      process.exit(1);
    }

    // Check if token is valid
    if (!this.validateToken(token)) {
      display.warning('Your session has expired');
      this.clearAuth();
      display.info('Please run: coins-cli login');
      process.exit(1);
    }

    return this.getCurrentUser();
  }

  // Clear authentication data
  clearAuth() {
    config.delete('user.token');
    config.delete('user.userId');
    config.delete('user.username');
  }

  // Process failed requests queue
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

  // Handle token refresh
  async refreshToken() {
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      });
    }

    this.isRefreshing = true;

    try {
      // For now, we'll just clear auth and require re-login
      // In a real implementation, you'd call a refresh endpoint
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

  // Setup axios interceptors for automatic token handling
  setupInterceptors(axiosInstance) {
    // Request interceptor
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

    // Response interceptor
    axiosInstance.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then(token => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return axiosInstance(originalRequest);
            }).catch(err => {
              return Promise.reject(err);
            });
          }

          originalRequest._retry = true;

          try {
            await this.refreshToken();
            return axiosInstance(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }
}

module.exports = new AuthMiddleware(); 