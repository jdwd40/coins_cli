// Test setup file
const nock = require('nock');

// Mock console methods to avoid cluttering test output
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  clear: jest.fn(),
};

// Mock process.exit to prevent tests from actually exiting
process.exit = jest.fn();

// Clean up nock after each test
afterEach(() => {
  nock.cleanAll();
});

// Mock chalk to avoid color codes in test output
jest.mock('chalk', () => {
  const mockChalk = {
    green: jest.fn((text) => text),
    red: jest.fn((text) => text),
    yellow: jest.fn((text) => text),
    blue: jest.fn((text) => text),
    cyan: jest.fn((text) => text),
    magenta: jest.fn((text) => text),
    white: jest.fn((text) => text),
    gray: jest.fn((text) => text),
    dim: jest.fn((text) => text),
  };
  
  // Add nested bold functions
  mockChalk.bold = jest.fn((text) => text);
  mockChalk.bold.blue = jest.fn((text) => text);
  mockChalk.bold.white = jest.fn((text) => text);
  mockChalk.bold.yellow = jest.fn((text) => text);
  mockChalk.bold.green = jest.fn((text) => text);
  mockChalk.bold.red = jest.fn((text) => text);
  mockChalk.bold.gray = jest.fn((text) => text);
  mockChalk.bold.cyan = jest.fn((text) => text);
  mockChalk.bold.magenta = jest.fn((text) => text);
  
  return mockChalk;
});

// Mock ora spinner
jest.mock('ora', () => {
  return jest.fn(() => ({
    start: jest.fn().mockReturnThis(),
    stop: jest.fn().mockReturnThis(),
    succeed: jest.fn().mockReturnThis(),
    fail: jest.fn().mockReturnThis(),
    warn: jest.fn().mockReturnThis(),
    info: jest.fn().mockReturnThis(),
  }));
});

// Mock inquirer
jest.mock('inquirer', () => ({
  prompt: jest.fn(),
}));

// Mock conf for configuration management
jest.mock('conf', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    clear: jest.fn(),
    has: jest.fn(),
  }));
}); 