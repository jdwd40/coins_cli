const inquirer = require('inquirer');
const display = require('../utils/display');
const authCommands = require('./auth');
const marketCommands = require('./market');
const portfolioCommands = require('./portfolio');
const transactionCommands = require('./transactions');

// Interactive menu system
const interactiveCommands = {
  // Main interactive menu
  async start() {
    display.header('Coins CLI - Interactive Mode');
    
    while (true) {
      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: 'What would you like to do?',
          choices: [
            { name: '🔐 Authentication', value: 'auth' },
            { name: '📊 Market Data', value: 'market' },
            { name: '💼 Portfolio', value: 'portfolio' },
            { name: '💰 Trading', value: 'trading' },
            { name: '📈 Transaction History', value: 'transactions' },
            { name: '❌ Exit', value: 'exit' }
          ]
        }
      ]);

      if (action === 'exit') {
        display.info('Goodbye!');
        break;
      }

      try {
        await this.handleAction(action);
      } catch (error) {
        display.error('An error occurred');
        if (process.argv.includes('--debug')) {
          console.error(error);
        }
      }

      console.log(''); // Add spacing
    }
  },

  // Handle main menu actions
  async handleAction(action) {
    switch (action) {
      case 'auth':
        await this.showAuthMenu();
        break;
      case 'market':
        await this.showMarketMenu();
        break;
      case 'portfolio':
        await this.showPortfolioMenu();
        break;
      case 'trading':
        await this.showTradingMenu();
        break;
      case 'transactions':
        await this.showTransactionsMenu();
        break;
    }
  },

  // Authentication submenu
  async showAuthMenu() {
    const { authAction } = await inquirer.prompt([
      {
        type: 'list',
        name: 'authAction',
        message: 'Authentication Options:',
        choices: [
          { name: '🔑 Login', value: 'login' },
          { name: '📝 Register', value: 'register' },
          { name: '🚪 Logout', value: 'logout' },
          { name: '👤 Show Current User', value: 'user' },
          { name: '⬅️ Back to Main Menu', value: 'back' }
        ]
      }
    ]);

    if (authAction === 'back') return;

    switch (authAction) {
      case 'login':
        await authCommands.login();
        break;
      case 'register':
        await authCommands.register();
        break;
      case 'logout':
        await authCommands.logout();
        break;
      case 'user':
        const user = authCommands.getCurrentUser();
        if (user) {
          display.info(`Current user: ${user.username} (ID: ${user.userId})`);
        } else {
          display.info('No user logged in');
        }
        break;
    }
  },

  // Market submenu
  async showMarketMenu() {
    const { marketAction } = await inquirer.prompt([
      {
        type: 'list',
        name: 'marketAction',
        message: 'Market Data Options:',
        choices: [
          { name: '📋 List All Coins', value: 'list' },
          { name: '🔍 Search Coins', value: 'search' },
          { name: '📈 Coin Price History', value: 'history' },
          { name: '📊 Market Overview', value: 'overview' },
          { name: '📈 Market Statistics', value: 'stats' },
          { name: '⬅️ Back to Main Menu', value: 'back' }
        ]
      }
    ]);

    if (marketAction === 'back') return;

    switch (marketAction) {
      case 'list':
        await marketCommands.list();
        break;
      case 'search':
        const { query } = await inquirer.prompt([
          {
            type: 'input',
            name: 'query',
            message: 'Enter search term:',
            validate: (input) => input.trim() ? true : 'Search term is required'
          }
        ]);
        await marketCommands.search(query);
        break;
      case 'history':
        const { coinId } = await inquirer.prompt([
          {
            type: 'input',
            name: 'coinId',
            message: 'Enter coin ID:',
            validate: (input) => input.trim() ? true : 'Coin ID is required'
          }
        ]);
        
        const { timeRange } = await inquirer.prompt([
          {
            type: 'list',
            name: 'timeRange',
            message: 'Select time range:',
            choices: [
              { name: '10 Minutes', value: '10M' },
              { name: '30 Minutes', value: '30M' },
              { name: '1 Hour', value: '1H' },
              { name: '2 Hours', value: '2H' },
              { name: '12 Hours', value: '12H' },
              { name: '24 Hours', value: '24H' },
              { name: 'All Time', value: 'ALL' }
            ]
          }
        ]);
        
        await marketCommands.history(coinId, { timeRange });
        break;
      case 'overview':
        const { overviewTimeRange } = await inquirer.prompt([
          {
            type: 'list',
            name: 'overviewTimeRange',
            message: 'Select time range:',
            choices: [
              { name: '10 Minutes', value: '10M' },
              { name: '30 Minutes', value: '30M' },
              { name: '1 Hour', value: '1H' },
              { name: '2 Hours', value: '2H' },
              { name: '12 Hours', value: '12H' },
              { name: '24 Hours', value: '24H' },
              { name: 'All Time', value: 'ALL' }
            ]
          }
        ]);
        await marketCommands.overview({ timeRange: overviewTimeRange });
        break;
      case 'stats':
        await marketCommands.stats();
        break;
    }
  },

  // Portfolio submenu
  async showPortfolioMenu() {
    const { portfolioAction } = await inquirer.prompt([
      {
        type: 'list',
        name: 'portfolioAction',
        message: 'Portfolio Options:',
        choices: [
          { name: '👁️ View Portfolio', value: 'view' },
          { name: '📊 Portfolio Summary', value: 'summary' },
          { name: '🔍 Filter Portfolio', value: 'filter' },
          { name: '💾 Export Portfolio', value: 'export' },
          { name: '⬅️ Back to Main Menu', value: 'back' }
        ]
      }
    ]);

    if (portfolioAction === 'back') return;

    switch (portfolioAction) {
      case 'view':
        await portfolioCommands.view();
        break;
      case 'summary':
        await portfolioCommands.summary();
        break;
      case 'filter':
        await this.showPortfolioFilterMenu();
        break;
      case 'export':
        await this.showPortfolioExportMenu();
        break;
    }
  },

  // Portfolio filter submenu
  async showPortfolioFilterMenu() {
    const { filterOptions } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'filterOptions',
        message: 'Select filter options:',
        choices: [
          { name: 'Show only profitable positions', value: 'profitable' },
          { name: 'Show only losing positions', value: 'losing' }
        ]
      }
    ]);

    const { sortBy } = await inquirer.prompt([
      {
        type: 'list',
        name: 'sortBy',
        message: 'Sort by:',
        choices: [
          { name: 'Value (highest first)', value: 'value' },
          { name: 'Profit/Loss (highest first)', value: 'profit' },
          { name: 'Quantity (highest first)', value: 'quantity' }
        ]
      }
    ]);

    const options = {};
    if (filterOptions.includes('profitable')) options.profitable = true;
    if (filterOptions.includes('losing')) options.losing = true;
    options.sort = sortBy;

    await portfolioCommands.filter(options);
  },

  // Portfolio export submenu
  async showPortfolioExportMenu() {
    const { format } = await inquirer.prompt([
      {
        type: 'list',
        name: 'format',
        message: 'Export format:',
        choices: [
          { name: 'JSON', value: 'json' },
          { name: 'CSV', value: 'csv' }
        ]
      }
    ]);

    const { filename } = await inquirer.prompt([
      {
        type: 'input',
        name: 'filename',
        message: 'Filename (without extension):',
        default: `portfolio-${new Date().toISOString().split('T')[0]}`
      }
    ]);

    await portfolioCommands.export({ format, filename });
  },

  // Trading submenu
  async showTradingMenu() {
    const { tradingAction } = await inquirer.prompt([
      {
        type: 'list',
        name: 'tradingAction',
        message: 'Trading Options:',
        choices: [
          { name: '🛒 Buy Coins', value: 'buy' },
          { name: '💰 Sell Coins', value: 'sell' },
          { name: '⬅️ Back to Main Menu', value: 'back' }
        ]
      }
    ]);

    if (tradingAction === 'back') return;

    switch (tradingAction) {
      case 'buy':
        await this.showBuyMenu();
        break;
      case 'sell':
        await this.showSellMenu();
        break;
    }
  },

  // Buy submenu
  async showBuyMenu() {
    const { coinId } = await inquirer.prompt([
      {
        type: 'input',
        name: 'coinId',
        message: 'Enter coin ID:',
        validate: (input) => input.trim() ? true : 'Coin ID is required'
      }
    ]);

    const { amount } = await inquirer.prompt([
      {
        type: 'number',
        name: 'amount',
        message: 'Enter amount to buy:',
        validate: (input) => input > 0 ? true : 'Amount must be positive'
      }
    ]);

    await transactionCommands.buy(coinId, amount);
  },

  // Sell submenu
  async showSellMenu() {
    const { coinId } = await inquirer.prompt([
      {
        type: 'input',
        name: 'coinId',
        message: 'Enter coin ID:',
        validate: (input) => input.trim() ? true : 'Coin ID is required'
      }
    ]);

    const { amount } = await inquirer.prompt([
      {
        type: 'number',
        name: 'amount',
        message: 'Enter amount to sell:',
        validate: (input) => input > 0 ? true : 'Amount must be positive'
      }
    ]);

    await transactionCommands.sell(coinId, amount);
  },

  // Transactions submenu
  async showTransactionsMenu() {
    const { transactionAction } = await inquirer.prompt([
      {
        type: 'list',
        name: 'transactionAction',
        message: 'Transaction History Options:',
        choices: [
          { name: '📋 View History', value: 'history' },
          { name: '🔍 Filter by Type', value: 'filter' },
          { name: '💾 Export History', value: 'export' },
          { name: '⬅️ Back to Main Menu', value: 'back' }
        ]
      }
    ]);

    if (transactionAction === 'back') return;

    switch (transactionAction) {
      case 'history':
        const { limit } = await inquirer.prompt([
          {
            type: 'number',
            name: 'limit',
            message: 'Number of transactions to show:',
            default: 10,
            validate: (input) => input > 0 ? true : 'Limit must be positive'
          }
        ]);
        await transactionCommands.history({ limit });
        break;
      case 'filter':
        const { type } = await inquirer.prompt([
          {
            type: 'list',
            name: 'type',
            message: 'Filter by transaction type:',
            choices: [
              { name: 'Buy transactions', value: 'BUY' },
              { name: 'Sell transactions', value: 'SELL' }
            ]
          }
        ]);
        await transactionCommands.history({ type });
        break;
      case 'export':
        await this.showTransactionExportMenu();
        break;
    }
  },

  // Transaction export submenu
  async showTransactionExportMenu() {
    const { format } = await inquirer.prompt([
      {
        type: 'list',
        name: 'format',
        message: 'Export format:',
        choices: [
          { name: 'JSON', value: 'json' },
          { name: 'CSV', value: 'csv' }
        ]
      }
    ]);

    const { limit } = await inquirer.prompt([
      {
        type: 'number',
        name: 'limit',
        message: 'Number of transactions to export:',
        default: 100,
        validate: (input) => input > 0 ? true : 'Limit must be positive'
      }
    ]);

    const { filename } = await inquirer.prompt([
      {
        type: 'input',
        name: 'filename',
        message: 'Filename (without extension):',
        default: `transactions-${new Date().toISOString().split('T')[0]}`
      }
    ]);

    await transactionCommands.export({ format, filename, limit });
  }
};

module.exports = interactiveCommands; 