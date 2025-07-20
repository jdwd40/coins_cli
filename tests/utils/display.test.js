const display = require('../../src/utils/display');

describe('Display Utilities', () => {
  beforeEach(() => {
    // Clear console mocks before each test
    jest.clearAllMocks();
  });

  describe('Message Display Methods', () => {
    test('success should log success message with checkmark', () => {
      const message = 'Operation completed successfully';
      display.success(message);
      
      expect(console.log).toHaveBeenCalledWith(`✅ ${message}`);
    });

    test('error should log error message with X mark', () => {
      const message = 'Something went wrong';
      display.error(message);
      
      expect(console.error).toHaveBeenCalledWith(`❌ ${message}`);
    });

    test('warning should log warning message with warning symbol', () => {
      const message = 'Please check your input';
      display.warning(message);
      
      expect(console.log).toHaveBeenCalledWith(`⚠️  ${message}`);
    });

    test('info should log info message with info symbol', () => {
      const message = 'This is informational';
      display.info(message);
      
      expect(console.log).toHaveBeenCalledWith(`ℹ️  ${message}`);
    });
  });

  describe('Profit/Loss Formatting', () => {
    test('profit should format positive amounts with plus sign', () => {
      const amount = '1000.50';
      const result = display.profit(amount);
      
      expect(result).toBe(`+${amount}`);
    });

    test('loss should format amounts with minus sign', () => {
      const amount = '500.25';
      const result = display.loss(amount);
      
      expect(result).toBe(`-${amount}`);
    });
  });

  describe('Header Display', () => {
    test('header should log bold blue header', () => {
      const title = 'Market Overview';
      display.header(title);
      
      expect(console.log).toHaveBeenCalledWith(`\n${title}`);
    });

    test('subheader should log bold white subheader', () => {
      const title = 'Recent Transactions';
      display.subheader(title);
      
      expect(console.log).toHaveBeenCalledWith(`\n${title}`);
    });
  });

  describe('Table Creation', () => {
    test('createCoinTable should create table with coin headers', () => {
      const table = display.createCoinTable();
      
      expect(table).toBeDefined();
      expect(table.options.head).toEqual([
        'ID',
        'Name',
        'Symbol',
        'Price',
        'Market Cap',
        '24h Change'
      ]);
      expect(table.options.colWidths).toEqual([5, 20, 10, 12, 15, 12]);
    });

    test('createPortfolioTable should create table with portfolio headers', () => {
      const table = display.createPortfolioTable();
      
      expect(table).toBeDefined();
      expect(table.options.head).toEqual([
        'Coin',
        'Symbol',
        'Quantity',
        'Current Price',
        'Total Value',
        'P&L'
      ]);
      expect(table.options.colWidths).toEqual([15, 10, 12, 12, 15, 12]);
    });

    test('createTransactionTable should create table with transaction headers', () => {
      const table = display.createTransactionTable();
      
      expect(table).toBeDefined();
      expect(table.options.head).toEqual([
        'ID',
        'Type',
        'Coin',
        'Quantity',
        'Price',
        'Total',
        'Date'
      ]);
      expect(table.options.colWidths).toEqual([8, 8, 12, 12, 12, 15, 20]);
    });
  });

  describe('Currency Formatting', () => {
    test('formatCurrency should format GBP currency correctly', () => {
      const amount = 1234.56;
      const result = display.formatCurrency(amount, 'GBP');
      
      expect(result).toMatch(/£1,234\.56/);
    });

    test('formatCurrency should format USD currency correctly', () => {
      const amount = 1234.56;
      const result = display.formatCurrency(amount, 'USD');
      
      expect(result).toMatch(/\$1,234\.56/);
    });

    test('formatCurrency should handle zero amounts', () => {
      const amount = 0;
      const result = display.formatCurrency(amount, 'GBP');
      
      expect(result).toMatch(/£0\.00/);
    });

    test('formatCurrency should handle negative amounts', () => {
      const amount = -1234.56;
      const result = display.formatCurrency(amount, 'GBP');
      
      expect(result).toMatch(/-£1,234\.56/);
    });
  });

  describe('Percentage Formatting', () => {
    test('formatPercentage should format positive percentages with plus sign', () => {
      const value = 5.25;
      const result = display.formatPercentage(value);
      
      expect(result).toBe('+5.25%');
    });

    test('formatPercentage should format negative percentages with minus sign', () => {
      const value = -3.75;
      const result = display.formatPercentage(value);
      
      expect(result).toBe('-3.75%');
    });

    test('formatPercentage should format zero percentage', () => {
      const value = 0;
      const result = display.formatPercentage(value);
      
      expect(result).toBe('+0.00%');
    });

    test('formatPercentage should handle decimal precision', () => {
      const value = 12.345;
      const result = display.formatPercentage(value);
      
      expect(result).toBe('+12.35%'); // Should round to 2 decimal places
    });
  });

  describe('Market Trend Formatting', () => {
    test('formatMarketTrend should format STRONG_BOOM trend', () => {
      const trend = 'STRONG_BOOM';
      const result = display.formatMarketTrend(trend);
      
      expect(result).toBe('🚀 STRONG BOOM');
    });

    test('formatMarketTrend should format BOOM trend', () => {
      const trend = 'BOOM';
      const result = display.formatMarketTrend(trend);
      
      expect(result).toBe('📈 BOOM');
    });

    test('formatMarketTrend should format SLIGHT_BOOM trend', () => {
      const trend = 'SLIGHT_BOOM';
      const result = display.formatMarketTrend(trend);
      
      expect(result).toBe('↗️ SLIGHT BOOM');
    });

    test('formatMarketTrend should format NEUTRAL trend', () => {
      const trend = 'NEUTRAL';
      const result = display.formatMarketTrend(trend);
      
      expect(result).toBe('➡️ NEUTRAL');
    });

    test('formatMarketTrend should format SLIGHT_BUST trend', () => {
      const trend = 'SLIGHT_BUST';
      const result = display.formatMarketTrend(trend);
      
      expect(result).toBe('↘️ SLIGHT BUST');
    });

    test('formatMarketTrend should format BUST trend', () => {
      const trend = 'BUST';
      const result = display.formatMarketTrend(trend);
      
      expect(result).toBe('📉 BUST');
    });

    test('formatMarketTrend should format STRONG_BUST trend', () => {
      const trend = 'STRONG_BUST';
      const result = display.formatMarketTrend(trend);
      
      expect(result).toBe('💥 STRONG BUST');
    });

    test('formatMarketTrend should handle unknown trends', () => {
      const trend = 'UNKNOWN_TREND';
      const result = display.formatMarketTrend(trend);
      
      expect(result).toBe('UNKNOWN_TREND');
    });

    test('formatMarketTrend should handle null/undefined trends', () => {
      const result = display.formatMarketTrend(null);
      
      expect(result).toBe('UNKNOWN');
    });
  });

  describe('Screen Management', () => {
    test('clearScreen should call console.clear', () => {
      display.clearScreen();
      
      expect(console.clear).toHaveBeenCalled();
    });

    test('separator should log separator line', () => {
      display.separator();
      
      expect(console.log).toHaveBeenCalledWith('─'.repeat(80));
    });
  });

  describe('Spinner Creation', () => {
    test('spinner should create ora spinner instance', () => {
      const text = 'Loading...';
      const spinner = display.spinner(text);
      
      expect(spinner).toBeDefined();
      expect(typeof spinner.start).toBe('function');
      expect(typeof spinner.stop).toBe('function');
    });
  });

  describe('Color Export', () => {
    test('colors should be exported for external use', () => {
      expect(display.colors).toBeDefined();
      expect(display.colors.success).toBeDefined();
      expect(display.colors.error).toBeDefined();
      expect(display.colors.warning).toBeDefined();
      expect(display.colors.info).toBeDefined();
      expect(display.colors.profit).toBeDefined();
      expect(display.colors.loss).toBeDefined();
      expect(display.colors.neutral).toBeDefined();
    });
  });
}); 