const inquirer = require('inquirer');
const chalk = require('chalk');
const Table = require('cli-table3');
const display = require('../utils/display');
const api = require('../services/api');
const authMiddleware = require('../services/authMiddleware');
const authCommands = require('./auth');
const marketCommands = require('./market');
const portfolioCommands = require('./portfolio');
const transactionCommands = require('./transactions');

// Interactive menu system
const interactiveCommands = {
  // Main interactive menu with enhanced dashboard
  async start() {
    display.header('Coins CLI - Interactive Mode');
    
    // Check if user is logged in first - before showing any user info
    let user = authCommands.getCurrentUser();
    if (!user || !user.userId) {
      display.warning('You need to log in first to use the dashboard.');
      const { shouldLogin } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'shouldLogin',
          message: 'Would you like to log in now?',
          default: true
        }
      ]);
      
      if (shouldLogin) {
        await authCommands.login();
        user = authCommands.getCurrentUser(); // Get updated user after login
      } else {
        display.info('Goodbye!');
        return;
      }
    }
    
    while (true) {
      // Get current user status to update menu choices
      const currentUser = authCommands.getCurrentUser();
      const isLoggedIn = !!(currentUser && currentUser.userId);
      
      // Only show user info if logged in
      if (isLoggedIn) {
        await this.displayUserInfo();
      }
      
      const menuChoices = [
        { name: '📊 Market Data', value: 'market' },
        { name: '💼 Portfolio', value: 'portfolio' },
        { name: '💰 Trading', value: 'trading' },
        { name: '📈 Transaction History', value: 'transactions' },
        { name: '👤 Account Settings', value: 'account' }
      ];
      
      // Add logout option only if user is logged in
      if (isLoggedIn) {
        menuChoices.push({ name: '🚪 Logout', value: 'logout' });
      }
      
      // Add exit option at the end
      menuChoices.push({ name: '❌ Exit', value: 'exit' });
      
      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: 'What would you like to do?',
          choices: menuChoices
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

  // Display user information prominently
  async displayUserInfo() {
    const user = authCommands.getCurrentUser();
    if (user) {
      // Debug: Log the user object to see its structure
      if (process.argv.includes('--debug')) {
        console.log('Debug - User object:', JSON.stringify(user, null, 2));
      }
      
      console.log(chalk.cyan.bold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
      console.log(chalk.white.bold(`👤 User: ${user.username}`));
      
      // Safely handle funds display
      if (user.funds !== undefined && user.funds !== null) {
        const funds = parseFloat(user.funds);
        if (!isNaN(funds)) {
          console.log(chalk.green.bold(`💰 Available Funds: £${funds.toFixed(2)}`));
        } else {
          console.log(chalk.yellow.bold(`💰 Available Funds: £0.00 (invalid format)`));
        }
      } else {
        console.log(chalk.yellow.bold(`💰 Available Funds: £0.00 (not available)`));
      }
      
      console.log(chalk.cyan.bold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
      console.log('');
    }
  },

  // Handle main menu actions
  async handleAction(action) {
    let needsPause = false;
    
    switch (action) {
      case 'market':
        await this.showMarketMenu();
        needsPause = true;
        break;
      case 'portfolio':
        await this.showPortfolioMenu();
        needsPause = true;
        break;
      case 'trading':
        await this.showTradingMenu();
        break;
      case 'transactions':
        await this.showTransactionsMenu();
        needsPause = true;
        break;
      case 'account':
        await this.showAccountMenu();
        needsPause = true;
        break;
      case 'logout':
        await authCommands.logout();
        display.success('Logged out successfully');
        return; // Don't pause after logout
    }
    
    // Only pause after data display actions
    if (needsPause) {
      await this.pauseForUser();
    }
  },

  // Add a pause method to wait for user input
  async pauseForUser() {
    await inquirer.prompt([
      {
        type: 'input',
        name: 'continue',
        message: chalk.cyan('Press Enter to continue...'),
      }
    ]);
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
    
    // Add pause after portfolio operations
    if (portfolioAction !== 'back') {
      await this.pauseForUser();
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

  // Buy submenu with coin list and 'q' to quit
  async showBuyMenu() {
    // First, show the list of available coins
    display.header('Available Coins for Purchase');
    
    try {
      const spinner = display.spinner('Fetching available coins...');
      const response = await api.getCoins();
      spinner.succeed('Coins loaded');
      
      const table = display.createCoinTable();
      
      // Handle the coins wrapper object in the response
      const coins = response.data.coins || response.data;
      
      coins.forEach(coin => {
        table.push([
          coin.coin_id,
          coin.name,
          coin.symbol,
          display.formatCurrency(coin.current_price),
          display.formatCurrency(coin.market_cap),
          display.formatPercentage(coin.price_change_24h)
        ]);
      });
      
      console.log(table.toString());
      display.info(`Showing ${coins.length} coins`);
      display.info(chalk.yellow('Type "q" at any time to return to main menu'));
      console.log('');
      
    } catch (error) {
      display.error('Failed to fetch market data');
      if (process.argv.includes('--debug')) {
        console.error(error);
      }
      return;
    }

    // Get coin ID with 'q' to quit option
    const { coinId } = await inquirer.prompt([
      {
        type: 'input',
        name: 'coinId',
        message: 'Enter coin ID (or "q" to quit):',
        validate: (input) => {
          if (input.toLowerCase() === 'q') return true;
          return input.trim() ? true : 'Coin ID is required';
        }
      }
    ]);

    if (coinId.toLowerCase() === 'q') {
      display.info('Returning to main menu...');
      return;
    }

    // Get amount with 'q' to quit option
    const { amount } = await inquirer.prompt([
      {
        type: 'input',
        name: 'amount',
        message: 'Enter amount to buy (or "q" to quit):',
        validate: (input) => {
          if (input.toLowerCase() === 'q') return true;
          const num = parseFloat(input);
          return !isNaN(num) && num > 0 ? true : 'Amount must be a positive number';
        }
      }
    ]);

    if (amount.toLowerCase() === 'q') {
      display.info('Returning to main menu...');
      return;
    }

    // Execute the buy transaction
    await transactionCommands.buy(coinId, parseFloat(amount));
  },

  // Sell submenu with coin list and 'q' to quit
  async showSellMenu() {
    // First, show the user's portfolio with coin IDs and current amounts
    display.header('Your Portfolio - Available for Sale');
    
    try {
      const user = authMiddleware.requireAuth();
      const spinner = display.spinner('Fetching your portfolio...');
      const response = await api.getPortfolio(user.userId);
      spinner.succeed('Portfolio loaded');
      
      const portfolio = response.data.portfolio;
      const userFunds = response.data.user_funds || 0;
      
      if (!portfolio || portfolio.length === 0) {
        display.info('Your portfolio is empty - nothing to sell');
        display.info(`Available funds: ${display.formatCurrency(userFunds)}`);
        return;
      }

      // Create a table specifically for selling with coin IDs and amounts
      const table = new Table({
        head: [
          display.colors.bold('Coin ID'),
          display.colors.bold('Name'),
          display.colors.bold('Symbol'),
          display.colors.bold('Current Amount'),
          display.colors.bold('Current Price'),
          display.colors.bold('Total Value'),
          display.colors.bold('P&L')
        ],
        colWidths: [8, 20, 8, 15, 12, 12, 12]
      });
      
      portfolio.forEach(holding => {
        const currentValue = parseFloat(holding.total_amount) * parseFloat(holding.current_price);
        const totalInvested = parseFloat(holding.total_invested);
        const profitLoss = currentValue - totalInvested;
        
        table.push([
          holding.coin_id,
          holding.name,
          holding.symbol,
          holding.total_amount,
          display.formatCurrency(holding.current_price),
          display.formatCurrency(currentValue),
          profitLoss >= 0 
            ? display.profit(display.formatCurrency(profitLoss))
            : display.loss(display.formatCurrency(Math.abs(profitLoss)))
        ]);
      });
      
      console.log(table.toString());
      display.info(`Showing ${portfolio.length} coins in your portfolio`);
      display.info(chalk.yellow('Type "q" at any time to return to main menu'));
      console.log('');
      
    } catch (error) {
      display.error('Failed to fetch portfolio data');
      if (process.argv.includes('--debug')) {
        console.error(error);
      }
      return;
    }

    // Get coin ID with 'q' to quit option
    const { coinId } = await inquirer.prompt([
      {
        type: 'input',
        name: 'coinId',
        message: 'Enter coin ID from your portfolio (or "q" to quit):',
        validate: (input) => {
          if (input.toLowerCase() === 'q') return true;
          return input.trim() ? true : 'Coin ID is required';
        }
      }
    ]);

    if (coinId.toLowerCase() === 'q') {
      display.info('Returning to main menu...');
      return;
    }

    // Get amount with 'q' to quit option
    const { amount } = await inquirer.prompt([
      {
        type: 'input',
        name: 'amount',
        message: 'Enter amount to sell (or "q" to quit):',
        validate: (input) => {
          if (input.toLowerCase() === 'q') return true;
          const num = parseFloat(input);
          return !isNaN(num) && num > 0 ? true : 'Amount must be a positive number';
        }
      }
    ]);

    if (amount.toLowerCase() === 'q') {
      display.info('Returning to main menu...');
      return;
    }

    // Execute the sell transaction
    await transactionCommands.sell(coinId, parseFloat(amount));
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
  },

  // Account settings submenu
  async showAccountMenu() {
    const user = authCommands.getCurrentUser();
    if (!user) {
      display.error('Please login first');
      return;
    }

    const { accountAction } = await inquirer.prompt([
      {
        type: 'list',
        name: 'accountAction',
        message: 'Account Settings:',
        choices: [
          { name: '👤 Show User Info', value: 'info' },
          { name: '🔑 Change Password', value: 'password' },
          { name: '🚪 Logout', value: 'logout' },
          { name: '⬅️ Back to Main Menu', value: 'back' }
        ]
      }
    ]);

    if (accountAction === 'back') return;

    switch (accountAction) {
      case 'info':
        console.log(chalk.cyan.bold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
        console.log(chalk.white.bold(`👤 Username: ${user.username}`));
        console.log(chalk.white.bold(`📧 Email: ${user.email || 'Not available'}`));
        
        // Safely handle funds display
        if (user.funds !== undefined && user.funds !== null) {
          const funds = parseFloat(user.funds);
          if (!isNaN(funds)) {
            console.log(chalk.green.bold(`💰 Available Funds: £${funds.toFixed(2)}`));
          } else {
            console.log(chalk.yellow.bold(`💰 Available Funds: £0.00 (invalid format)`));
          }
        } else {
          console.log(chalk.yellow.bold(`💰 Available Funds: £0.00 (not available)`));
        }
        
        if (user.created_at) {
          console.log(chalk.gray(`📅 Member since: ${new Date(user.created_at).toLocaleDateString()}`));
        }
        console.log(chalk.cyan.bold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
        break;
      case 'password':
        display.info('Password change functionality coming soon...');
        break;
      case 'logout':
        await authCommands.logout();
        break;
    }
  }
};

module.exports = interactiveCommands; 