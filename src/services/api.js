const axios = require('axios');
const config = require('../config');
const authMiddleware = require('./authMiddleware');

// Create public axios instance for market data (no auth required)
const publicApiClient = axios.create({
  baseURL: config.get('api.baseUrl'),
  timeout: config.get('api.timeout'),
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'coins-cli/1.0.0'
  }
});

// Create authenticated axios instance with auth middleware
const authenticatedApiClient = axios.create({
  baseURL: config.get('api.baseUrl'),
  timeout: config.get('api.timeout'),
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'coins-cli/1.0.0'
  }
});

// Setup authentication middleware interceptors only for authenticated client
authMiddleware.setupInterceptors(authenticatedApiClient);

// Response interceptor for error handling (both clients)
const setupErrorHandling = (client) => {
  client.interceptors.response.use(
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
};

setupErrorHandling(publicApiClient);
setupErrorHandling(authenticatedApiClient);

// API methods
const api = {
  // Authentication (uses authenticated client)
  register: (userData) => authenticatedApiClient.post('/api/users/register', userData),
  login: (credentials) => authenticatedApiClient.post('/api/users/login', credentials),
  
  // Coins (public data - no auth required)
  getCoins: () => publicApiClient.get('/api/coins'),
  getCoin: (coinId) => publicApiClient.get(`/api/coins/${coinId}`),
  getCoinHistory: (coinId, page = 1, limit = 10) => 
    publicApiClient.get(`/api/coins/${coinId}/price-history?page=${page}&limit=${limit}`),
  
  // Get coin history with time range (if API supports it)
  getCoinHistoryWithTimeRange: (coinId, timeRange = '30M', page = 1, limit = 10) => 
    publicApiClient.get(`/api/coins/${coinId}/price-history?timeRange=${timeRange}&page=${page}&limit=${limit}`),
  
  // Market (public data - no auth required)
  getMarketHistory: (timeRange = '30M') => 
    publicApiClient.get(`/api/market/price-history?timeRange=${timeRange}`),
  getMarketStats: () => publicApiClient.get('https://jdwd40.com/api-2/api/market/stats'),
  
  // Transactions (requires authentication)
  buyCoin: (transactionData) => authenticatedApiClient.post('/api/transactions/buy', transactionData),
  sellCoin: (transactionData) => authenticatedApiClient.post('/api/transactions/sell', transactionData),
  getUserTransactions: (userId, limit = 10) => 
    authenticatedApiClient.get(`/api/transactions/user/${userId}?limit=${limit}`),
  getTransaction: (transactionId) => authenticatedApiClient.get(`/api/transactions/${transactionId}`),
  getPortfolio: (userId) => authenticatedApiClient.get(`/api/transactions/portfolio/${userId}`),
  
  // Utility method to update base URL
  setBaseUrl: (url) => {
    publicApiClient.defaults.baseURL = url;
    authenticatedApiClient.defaults.baseURL = url;
    require('../config').set('api.baseUrl', url);
  }
};

module.exports = api; 