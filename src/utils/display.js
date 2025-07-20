const chalk = require('chalk');
const ora = require('ora');
const Table = require('cli-table3');

// Color schemes for different types of output
const colors = {
  success: chalk.green,
  error: chalk.red,
  warning: chalk.yellow,
  info: chalk.blue,
  gray: chalk.gray,
  bold: chalk.bold,
  profit: chalk.green,
  loss: chalk.red,
  neutral: chalk.white
};

// Display utilities
const display = {
  // Success messages
  success: (message) => console.log(colors.success(`✅ ${message}`)),
  
  // Error messages
  error: (message) => console.error(colors.error(`❌ ${message}`)),
  
  // Warning messages
  warning: (message) => console.log(colors.warning(`⚠️  ${message}`)),
  
  // Info messages
  info: (message) => console.log(colors.info(`ℹ️  ${message}`)),
  
  // Profit/loss formatting
  profit: (amount) => colors.profit(`+${amount}`),
  loss: (amount) => colors.loss(`-${amount}`),
  
  // Headers
  header: (title) => console.log(colors.bold.blue(`\n${title}`)),
  subheader: (title) => console.log(colors.bold.white(`\n${title}`)),
  
  // Loading spinner
  spinner: (text) => ora(text).start(),
  
  // Create table for coin data
  createCoinTable: () => {
    return new Table({
      head: [
        colors.bold('ID'),
        colors.bold('Name'),
        colors.bold('Symbol'),
        colors.bold('Price'),
        colors.bold('Market Cap'),
        colors.bold('24h Change')
      ],
      colWidths: [5, 20, 10, 12, 15, 12]
    });
  },
  
  // Create table for portfolio data
  createPortfolioTable: () => {
    return new Table({
      head: [
        colors.bold('Coin'),
        colors.bold('Symbol'),
        colors.bold('Quantity'),
        colors.bold('Current Price'),
        colors.bold('Total Value'),
        colors.bold('P&L')
      ],
      colWidths: [15, 10, 12, 12, 15, 12]
    });
  },
  
  // Create table for transaction data
  createTransactionTable: () => {
    return new Table({
      head: [
        colors.bold('ID'),
        colors.bold('Type'),
        colors.bold('Coin'),
        colors.bold('Quantity'),
        colors.bold('Price'),
        colors.bold('Total'),
        colors.bold('Date')
      ],
      colWidths: [8, 8, 12, 12, 12, 15, 20]
    });
  },
  
  // Format currency
  formatCurrency: (amount, currency = 'GBP') => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency
    }).format(amount);
  },
  
  // Format percentage
  formatPercentage: (value) => {
    const formatted = value >= 0 ? `+${value.toFixed(2)}%` : `${value.toFixed(2)}%`;
    return value >= 0 ? colors.profit(formatted) : colors.loss(formatted);
  },
  
  // Format market trend
  formatMarketTrend: (trend) => {
    const trendMap = {
      'STRONG_BOOM': colors.profit('🚀 STRONG BOOM'),
      'BOOM': colors.profit('📈 BOOM'),
      'SLIGHT_BOOM': colors.profit('↗️ SLIGHT BOOM'),
      'NEUTRAL': colors.neutral('➡️ NEUTRAL'),
      'SLIGHT_BUST': colors.loss('↘️ SLIGHT BUST'),
      'BUST': colors.loss('📉 BUST'),
      'STRONG_BUST': colors.loss('💥 STRONG BUST')
    };
    
    return trendMap[trend] || colors.gray(trend || 'UNKNOWN');
  },
  
  // Clear screen
  clearScreen: () => {
    console.clear();
  },
  
  // Print separator
  separator: () => {
    console.log(colors.gray('─'.repeat(80)));
  },
  
  // Export colors for use in other modules
  colors: colors
};

module.exports = display; 