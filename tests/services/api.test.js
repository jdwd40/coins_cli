const nock = require('nock');
const api = require('../../src/services/api');

// Mock the config module
jest.mock('../../src/config', () => ({
  get: jest.fn((key) => {
    const config = {
      'api.baseUrl': 'https://api.example.com',
      'api.timeout': 10000
    };
    return config[key];
  }),
  set: jest.fn()
}));

// Mock authMiddleware
jest.mock('../../src/services/authMiddleware', () => ({
  setupInterceptors: jest.fn()
}));

describe('API Service', () => {
  const baseUrl = 'https://api.example.com';
  
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('Authentication Methods', () => {
    test('register should make POST request to /api/users/register', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };
      
      const mockResponse = {
        user_id: 1,
        username: 'testuser',
        email: 'test@example.com',
        token: 'mock-jwt-token'
      };

      nock(baseUrl)
        .post('/api/users/register', userData)
        .reply(201, mockResponse);

      const response = await api.register(userData);
      
      expect(response.data).toEqual(mockResponse);
      expect(response.status).toBe(201);
    });

    test('login should make POST request to /api/users/login', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      const mockResponse = {
        user_id: 1,
        username: 'testuser',
        email: 'test@example.com',
        token: 'mock-jwt-token'
      };

      nock(baseUrl)
        .post('/api/users/login', credentials)
        .reply(200, mockResponse);

      const response = await api.login(credentials);
      
      expect(response.data).toEqual(mockResponse);
      expect(response.status).toBe(200);
    });
  });

  describe('Coin Methods', () => {
    test('getCoins should make GET request to /api/coins', async () => {
      const mockResponse = [
        {
          coin_id: 1,
          name: 'Bitcoin',
          symbol: 'BTC',
          current_price: 50000,
          market_cap: 1000000000
        }
      ];

      nock(baseUrl)
        .get('/api/coins')
        .reply(200, mockResponse);

      const response = await api.getCoins();
      
      expect(response.data).toEqual(mockResponse);
      expect(response.status).toBe(200);
    });

    test('getCoin should make GET request to /api/coins/:coinId', async () => {
      const coinId = 1;
      const mockResponse = {
        coin_id: 1,
        name: 'Bitcoin',
        symbol: 'BTC',
        current_price: 50000,
        market_cap: 1000000000,
        founder: 'Satoshi Nakamoto'
      };

      nock(baseUrl)
        .get(`/api/coins/${coinId}`)
        .reply(200, mockResponse);

      const response = await api.getCoin(coinId);
      
      expect(response.data).toEqual(mockResponse);
      expect(response.status).toBe(200);
    });

    test('getCoinHistory should make GET request with pagination', async () => {
      const coinId = 1;
      const page = 2;
      const limit = 20;
      
      const mockResponse = {
        data: [
          { timestamp: '2024-01-01T00:00:00Z', price: 50000 },
          { timestamp: '2024-01-01T00:01:00Z', price: 50100 }
        ],
        pagination: {
          page: 2,
          limit: 20,
          total: 100
        }
      };

      nock(baseUrl)
        .get(`/api/coins/${coinId}/price-history?page=${page}&limit=${limit}`)
        .reply(200, mockResponse);

      const response = await api.getCoinHistory(coinId, page, limit);
      
      expect(response.data).toEqual(mockResponse);
      expect(response.status).toBe(200);
    });

    test('getCoinHistoryWithTimeRange should make GET request with time range', async () => {
      const coinId = 1;
      const timeRange = '1H';
      const page = 1;
      const limit = 10;
      
      const mockResponse = {
        data: [
          { timestamp: '2024-01-01T00:00:00Z', price: 50000 }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 60
        }
      };

      nock(baseUrl)
        .get(`/api/coins/${coinId}/price-history?timeRange=${timeRange}&page=${page}&limit=${limit}`)
        .reply(200, mockResponse);

      const response = await api.getCoinHistoryWithTimeRange(coinId, timeRange, page, limit);
      
      expect(response.data).toEqual(mockResponse);
      expect(response.status).toBe(200);
    });
  });

  describe('Market Methods', () => {
    test('getMarketHistory should make GET request with time range', async () => {
      const timeRange = '24H';
      const mockResponse = {
        data: [
          { timestamp: '2024-01-01T00:00:00Z', total_value: 1000000 }
        ],
        trend: 'BOOM'
      };

      nock(baseUrl)
        .get(`/api/market/price-history?timeRange=${timeRange}`)
        .reply(200, mockResponse);

      const response = await api.getMarketHistory(timeRange);
      
      expect(response.data).toEqual(mockResponse);
      expect(response.status).toBe(200);
    });

    test('getMarketStats should make GET request to external URL', async () => {
      const mockResponse = {
        current_cycle: 'BOOM',
        total_market_value: 1000000,
        active_events: [
          { name: 'Bull Market', effect: 'price_increase' }
        ]
      };

      nock('https://jdwd40.com')
        .get('/api-2/api/market/stats')
        .reply(200, mockResponse);

      const response = await api.getMarketStats();
      
      expect(response.data).toEqual(mockResponse);
      expect(response.status).toBe(200);
    });
  });

  describe('Transaction Methods', () => {
    test('buyCoin should make POST request to /api/transactions/buy', async () => {
      const transactionData = {
        coin_id: 1,
        quantity: 0.5,
        price: 50000
      };
      
      const mockResponse = {
        transaction_id: 1,
        user_id: 1,
        coin_id: 1,
        type: 'BUY',
        quantity: 0.5,
        price: 50000,
        total_amount: 25000,
        created_at: '2024-01-01T00:00:00Z'
      };

      nock(baseUrl)
        .post('/api/transactions/buy', transactionData)
        .reply(201, mockResponse);

      const response = await api.buyCoin(transactionData);
      
      expect(response.data).toEqual(mockResponse);
      expect(response.status).toBe(201);
    });

    test('sellCoin should make POST request to /api/transactions/sell', async () => {
      const transactionData = {
        coin_id: 1,
        quantity: 0.5,
        price: 51000
      };
      
      const mockResponse = {
        transaction_id: 2,
        user_id: 1,
        coin_id: 1,
        type: 'SELL',
        quantity: 0.5,
        price: 51000,
        total_amount: 25500,
        created_at: '2024-01-01T00:00:00Z'
      };

      nock(baseUrl)
        .post('/api/transactions/sell', transactionData)
        .reply(201, mockResponse);

      const response = await api.sellCoin(transactionData);
      
      expect(response.data).toEqual(mockResponse);
      expect(response.status).toBe(201);
    });

    test('getUserTransactions should make GET request with limit', async () => {
      const userId = 1;
      const limit = 5;
      
      const mockResponse = [
        {
          transaction_id: 1,
          user_id: 1,
          coin_id: 1,
          type: 'BUY',
          quantity: 0.5,
          price: 50000,
          total_amount: 25000,
          created_at: '2024-01-01T00:00:00Z'
        }
      ];

      nock(baseUrl)
        .get(`/api/transactions/user/${userId}?limit=${limit}`)
        .reply(200, mockResponse);

      const response = await api.getUserTransactions(userId, limit);
      
      expect(response.data).toEqual(mockResponse);
      expect(response.status).toBe(200);
    });

    test('getTransaction should make GET request to /api/transactions/:transactionId', async () => {
      const transactionId = 1;
      const mockResponse = {
        transaction_id: 1,
        user_id: 1,
        coin_id: 1,
        type: 'BUY',
        quantity: 0.5,
        price: 50000,
        total_amount: 25000,
        created_at: '2024-01-01T00:00:00Z'
      };

      nock(baseUrl)
        .get(`/api/transactions/${transactionId}`)
        .reply(200, mockResponse);

      const response = await api.getTransaction(transactionId);
      
      expect(response.data).toEqual(mockResponse);
      expect(response.status).toBe(200);
    });

    test('getPortfolio should make GET request to /api/transactions/portfolio/:userId', async () => {
      const userId = 1;
      const mockResponse = [
        {
          coin_id: 1,
          name: 'Bitcoin',
          symbol: 'BTC',
          current_price: 50000,
          total_amount: 0.5,
          total_invested: 25000
        }
      ];

      nock(baseUrl)
        .get(`/api/transactions/portfolio/${userId}`)
        .reply(200, mockResponse);

      const response = await api.getPortfolio(userId);
      
      expect(response.data).toEqual(mockResponse);
      expect(response.status).toBe(200);
    });
  });

  describe('Utility Methods', () => {
    test('setBaseUrl should update base URL for both clients', () => {
      const newUrl = 'https://new-api.example.com';
      
      api.setBaseUrl(newUrl);
      
      // Verify that the config was updated
      const config = require('../../src/config');
      expect(config.set).toHaveBeenCalledWith('api.baseUrl', newUrl);
    });
  });

  describe('Error Handling', () => {
    test('should handle server errors gracefully', async () => {
      nock(baseUrl)
        .get('/api/coins')
        .reply(500, { error: 'Internal Server Error' });

      await expect(api.getCoins()).rejects.toThrow();
    });

    test('should handle network errors gracefully', async () => {
      nock(baseUrl)
        .get('/api/coins')
        .replyWithError('Network Error');

      await expect(api.getCoins()).rejects.toThrow();
    });

    test('should handle timeout errors gracefully', async () => {
      nock(baseUrl)
        .get('/api/coins')
        .delay(15000) // Longer than timeout
        .reply(200, []);

      await expect(api.getCoins()).rejects.toThrow();
    });
  });
}); 