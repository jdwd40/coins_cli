const inquirer = require('inquirer');
const display = require('../utils/display');
const api = require('../services/api');
const config = require('../config');
const authMiddleware = require('../services/authMiddleware');

// Authentication commands
const authCommands = {
  // Register new user
  async register() {
    display.header('User Registration');
    
    const questions = [
      {
        type: 'input',
        name: 'username',
        message: 'Enter username:',
        validate: (input) => {
          if (input.length < 3) {
            return 'Username must be at least 3 characters long';
          }
          return true;
        }
      },
      {
        type: 'input',
        name: 'email',
        message: 'Enter email:',
        validate: (input) => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(input)) {
            return 'Please enter a valid email address';
          }
        }
      },
      {
        type: 'password',
        name: 'password',
        message: 'Enter password:',
        validate: (input) => {
          if (input.length < 6) {
            return 'Password must be at least 6 characters long';
          }
          return true;
        }
      },
      {
        type: 'password',
        name: 'confirmPassword',
        message: 'Confirm password:',
        validate: (input, answers) => {
          if (input !== answers.password) {
            return 'Passwords do not match';
          }
          return true;
        }
      }
    ];

    try {
      const answers = await inquirer.prompt(questions);
      
      const spinner = display.spinner('Creating account...');
      
      try {
        const response = await api.register({
          username: answers.username,
          email: answers.email,
          password: answers.password
        });
        
        spinner.succeed('Account created successfully!');
        
        // Store user data
        config.set('user.userId', response.data.user.user_id);
        config.set('user.username', response.data.user.username);
        config.set('user.funds', response.data.user.funds);
        
        display.success(`Welcome, ${response.data.user.username}!`);
        display.info(`Your account has been created with ${display.formatCurrency(response.data.user.funds)} in funds.`);
        
      } catch (apiError) {
        spinner.fail('Account creation failed');
        throw apiError;
      }
      
    } catch (error) {
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const data = error.response.data;
        
        display.error(`Registration failed (HTTP ${status})`);
        
        if (status === 409) {
          display.error('Username or email already exists');
          display.info('Please try a different username or email');
        } else if (status === 400) {
          display.error('Bad request - check your input');
          if (data && data.msg) {
            display.info(`Server message: ${data.msg}`);
          }
        } else if (status === 404) {
          display.error('Registration endpoint not found');
          display.info('Please check if the API server is running correctly');
        } else if (status >= 500) {
          display.error('Server error occurred');
          display.info('Please try again later or contact support');
        } else {
          display.error(`Unexpected error (${status})`);
          if (data && data.msg) {
            display.info(`Server message: ${data.msg}`);
          }
        }
        
        // Debug information
        if (process.argv.includes('--debug') || process.argv.includes('-d')) {
          display.info('Debug information:');
          display.info(`  Request URL: ${error.config?.url || 'Unknown'}`);
          display.info(`  Request method: ${error.config?.method || 'Unknown'}`);
          display.info(`  Response status: ${status}`);
          display.info(`  Response data: ${JSON.stringify(data, null, 2)}`);
        }
      } else if (error.request) {
        // Request was made but no response received
        display.error('Network error - no response received from server');
        display.info('Please check your internet connection and try again');
        
        if (process.argv.includes('--debug') || process.argv.includes('-d')) {
          display.info('Debug information:');
          display.info(`  Request URL: ${error.config?.url || 'Unknown'}`);
          display.info(`  Request method: ${error.config?.method || 'Unknown'}`);
          display.info(`  Error code: ${error.code || 'Unknown'}`);
        }
      } else {
        // Something else happened
        display.error(`Registration failed: ${error.message}`);
        
        if (process.argv.includes('--debug') || process.argv.includes('-d')) {
          display.info('Debug information:');
          display.info(`  Error: ${error.message}`);
          display.info(`  Stack: ${error.stack}`);
        }
      }
    }
  },

  // Login user
  async login() {
    display.header('User Login');
    
    const questions = [
      {
        type: 'input',
        name: 'email',
        message: 'Enter email:',
        validate: (input) => {
          if (!input.trim()) {
            return 'Email is required';
          }
          return true;
        }
      },
      {
        type: 'password',
        name: 'password',
        message: 'Enter password:',
        validate: (input) => {
          if (!input.trim()) {
            return 'Password is required';
          }
          return true;
        }
      }
    ];

    try {
      const answers = await inquirer.prompt(questions);
      
      const spinner = display.spinner('Logging in...');
      
      try {
        const response = await api.login({
          email: answers.email,
          password: answers.password
        });
        
        spinner.succeed('Login successful!');
        
        // Store authentication data
        config.set('user.token', response.data.token);
        config.set('user.userId', response.data.user.user_id);
        config.set('user.username', response.data.user.username);
        config.set('user.funds', response.data.user.funds);
        
        display.success(`Welcome back, ${response.data.user.username}!`);
        display.info(`Current funds: ${display.formatCurrency(response.data.user.funds)}`);
        
      } catch (apiError) {
        spinner.fail('Login failed');
        throw apiError;
      }
      
    } catch (error) {
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const data = error.response.data;
        
        display.error(`Login failed (HTTP ${status})`);
        
        if (status === 401) {
          display.error('Invalid email or password');
          display.info('Please check your credentials and try again');
        } else if (status === 400) {
          display.error('Bad request - check your input');
          if (data && data.msg) {
            display.info(`Server message: ${data.msg}`);
          }
        } else if (status === 404) {
          display.error('Login endpoint not found');
          display.info('Please check if the API server is running correctly');
        } else if (status >= 500) {
          display.error('Server error occurred');
          display.info('Please try again later or contact support');
        } else {
          display.error(`Unexpected error (${status})`);
          if (data && data.msg) {
            display.info(`Server message: ${data.msg}`);
          }
        }
        
        // Debug information
        if (process.argv.includes('--debug') || process.argv.includes('-d')) {
          display.info('Debug information:');
          display.info(`  Request URL: ${error.config?.url || 'Unknown'}`);
          display.info(`  Request method: ${error.config?.method || 'Unknown'}`);
          display.info(`  Response status: ${status}`);
          display.info(`  Response data: ${JSON.stringify(data, null, 2)}`);
        }
      } else if (error.request) {
        // Request was made but no response received
        display.error('Network error - no response received from server');
        display.info('Please check your internet connection and try again');
        
        if (process.argv.includes('--debug') || process.argv.includes('-d')) {
          display.info('Debug information:');
          display.info(`  Request URL: ${error.config?.url || 'Unknown'}`);
          display.info(`  Request method: ${error.config?.method || 'Unknown'}`);
          display.info(`  Error code: ${error.code || 'Unknown'}`);
        }
      } else {
        // Something else happened
        display.error(`Login failed: ${error.message}`);
        
        if (process.argv.includes('--debug') || process.argv.includes('-d')) {
          display.info('Debug information:');
          display.info(`  Error: ${error.message}`);
          display.info(`  Stack: ${error.stack}`);
        }
      }
    }
  },

  // Logout user
  async logout() {
    const questions = [
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Are you sure you want to logout?',
        default: true
      }
    ];

    const answers = await inquirer.prompt(questions);
    
    if (answers.confirm) {
      // Clear stored data
      config.delete('user.token');
      config.delete('user.userId');
      config.delete('user.username');
      config.delete('user.funds');
      
      display.success('Logged out successfully');
    } else {
      display.info('Logout cancelled');
    }
  },

  // Check if user is authenticated
  isAuthenticated() {
    return authMiddleware.isAuthenticated();
  },

  // Get current user info
  getCurrentUser() {
    return authMiddleware.getCurrentUser();
  },

  // Require authentication middleware
  requireAuth() {
    return authMiddleware.requireAuth();
  }
};

module.exports = authCommands; 