const axios = require('axios');
const config = require('../config');

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: config.get('api.baseUrl'),
  timeout: config.get('api.timeout'),
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'coins-cli/1.0.0'
  }
});

// Request interceptor to add authentication token
apiClient.interceptors.request.use(
  (config) => {
    const token = require('../config').get('user.token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error(`API Error: ${error.response.status} - ${error.response.statusText}`);
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error: No response received from server');
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// API methods
const api = {
  // Authentication
  register: (userData) => apiClient.post('/api/users/register', userData),
  login: (credentials) => apiClient.post('/api/users/login', credentials),
  
  // Coins
  getCoins: () => apiClient.get('/api/coins'),
  getCoin: (coinId) => apiClient.get(`/api/coins/${coinId}`),
  getCoinHistory: (coinId, page = 1, limit = 10) => 
    apiClient.get(`/api/coins/${coinId}/history?page=${page}&limit=${limit}`),
  
  // Market
  getMarketHistory: (timeRange = '30M') => 
    apiClient.get(`/api/market/price-history?timeRange=${timeRange}`),
  getMarketStats: () => apiClient.get('/api/market/stats'),
  
  // Transactions
  buyCoin: (transactionData) => apiClient.post('/api/transactions/buy', transactionData),
  sellCoin: (transactionData) => apiClient.post('/api/transactions/sell', transactionData),
  getUserTransactions: (userId, limit = 10) => 
    apiClient.get(`/api/transactions/user/${userId}?limit=${limit}`),
  getTransaction: (transactionId) => apiClient.get(`/api/transactions/${transactionId}`),
  getPortfolio: (userId) => apiClient.get(`/api/transactions/portfolio/${userId}`),
  
  // Utility method to update base URL
  setBaseUrl: (url) => {
    apiClient.defaults.baseURL = url;
    require('../config').set('api.baseUrl', url);
  }
};

module.exports = api; 