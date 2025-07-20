#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');

// Create the main program
const program = new Command();

// Set up the program
program
  .name('coins-cli')
  .description('A command-line interface for the Coins API')
  .version('1.0.0');

// Add global options
program
  .option('-d, --debug', 'Enable debug mode')
  .option('-v, --verbose', 'Enable verbose output');

// Import command modules
const authCommands = require('../src/commands/auth');
const marketCommands = require('../src/commands/market');
const portfolioCommands = require('../src/commands/portfolio');
const transactionCommands = require('../src/commands/transactions');
const interactiveCommands = require('../src/commands/interactive');

// ============================================================================
// AUTHENTICATION COMMANDS
// ============================================================================

program
  .command('login')
  .description('Authenticate with the API')
  .action(async () => {
    await authCommands.login();
  });

program
  .command('register')
  .description('Create a new account')
  .action(async () => {
    await authCommands.register();
  });

program
  .command('logout')
  .description('Clear authentication')
  .action(async () => {
    await authCommands.logout();
  });

// ============================================================================
// MARKET COMMANDS
// ============================================================================

const market = program
  .command('market')
  .description('Market data and coin information');

market
  .command('list')
  .description('List all available coins')
  .action(async () => {
    await marketCommands.list();
  });

market
  .command('details <coin-id>')
  .description('Show detailed information for a specific coin')
  .action(async (coinId) => {
    await marketCommands.details(coinId);
  });

market
  .command('history <coin-id>')
  .description('Show price history for a coin')
  .option('-p, --page <number>', 'Page number', '1')
  .option('-l, --limit <number>', 'Number of entries per page', '10')
  .option('-t, --timeRange <range>', 'Time range (10M, 30M, 1H, 2H, 12H, 24H, ALL)', '30M')
  .action(async (coinId, options) => {
    await marketCommands.history(coinId, {
      page: parseInt(options.page),
      limit: parseInt(options.limit),
      timeRange: options.timeRange
    });
  });

market
  .command('overview')
  .description('Show market overview and trends')
  .option('-t, --timeRange <range>', 'Time range (10M, 30M, 1H, 2H, 12H, 24H, ALL)', '30M')
  .action(async (options) => {
    await marketCommands.overview(options);
  });

market
  .command('stats')
  .description('Show market statistics')
  .action(async () => {
    await marketCommands.stats();
  });

market
  .command('search <query>')
  .description('Search coins by name or symbol')
  .action(async (query) => {
    await marketCommands.search(query);
  });

// ============================================================================
// PORTFOLIO COMMANDS
// ============================================================================

const portfolio = program
  .command('portfolio')
  .description('Portfolio management');

portfolio
  .command('view')
  .description('View your current portfolio')
  .action(async () => {
    await portfolioCommands.view();
  });

portfolio
  .command('summary')
  .description('Show portfolio summary and performance metrics')
  .action(async () => {
    await portfolioCommands.summary();
  });

portfolio
  .command('filter')
  .description('Filter and sort portfolio holdings')
  .option('-s, --symbol <symbol>', 'Filter by coin symbol')
  .option('--profitable', 'Show only profitable positions')
  .option('--losing', 'Show only losing positions')
  .option('--sort <field>', 'Sort by (value, profit, quantity)', 'value')
  .action(async (options) => {
    await portfolioCommands.filter(options);
  });

portfolio
  .command('export')
  .description('Export portfolio data')
  .option('-f, --format <format>', 'Export format (json, csv)', 'json')
  .option('-o, --filename <name>', 'Output filename (without extension)')
  .action(async (options) => {
    await portfolioCommands.export(options);
  });

// ============================================================================
// TRADING COMMANDS
// ============================================================================

program
  .command('buy <coin-id> <amount>')
  .description('Buy coins (use "market list" to see available coin IDs)')
  .action(async (coinId, amount) => {
    await transactionCommands.buy(coinId, amount);
  });

program
  .command('sell <coin-id> <amount>')
  .description('Sell coins (use "market list" to see available coin IDs)')
  .action(async (coinId, amount) => {
    await transactionCommands.sell(coinId, amount);
  });

// ============================================================================
// TRANSACTION COMMANDS
// ============================================================================

const transactions = program
  .command('transactions')
  .description('Transaction history and management');

transactions
  .command('history')
  .description('View transaction history')
  .option('-l, --limit <number>', 'Number of transactions to show', '10')
  .option('-t, --type <type>', 'Filter by transaction type (BUY, SELL)')
  .action(async (options) => {
    await transactionCommands.history(options);
  });

transactions
  .command('details <transaction-id>')
  .description('Show detailed transaction information')
  .action(async (transactionId) => {
    await transactionCommands.details(transactionId);
  });

transactions
  .command('export')
  .description('Export transaction history')
  .option('-f, --format <format>', 'Export format (json, csv)', 'json')
  .option('-l, --limit <number>', 'Number of transactions to export', '100')
  .option('-o, --filename <name>', 'Output filename (without extension)')
  .action(async (options) => {
    await transactionCommands.export(options);
  });

// ============================================================================
// INTERACTIVE MODE
// ============================================================================

program
  .command('interactive')
  .alias('i')
  .description('Start interactive mode with menu-driven interface')
  .action(async () => {
    await interactiveCommands.start();
  });

program
  .command('dashboard')
  .alias('d')
  .description('Start dashboard mode with user info display')
  .action(async () => {
    await interactiveCommands.start();
  });

// ============================================================================
// HELP COMMAND
// ============================================================================

program
  .command('help')
  .description('Show detailed help information')
  .action(() => {
    console.log(chalk.blue.bold('Coins CLI - Help'));
    console.log(chalk.gray('A command-line interface for managing cryptocurrency portfolios'));
    console.log('');
    
    console.log(chalk.yellow('Authentication:'));
    console.log('  login     - Authenticate with the API');
    console.log('  register  - Create a new account');
    console.log('  logout    - Clear authentication');
    console.log('');
    
    console.log(chalk.yellow('Market Data:'));
    console.log('  market list              - List all coins');
    console.log('  market details <coin-id> - Show coin details');
    console.log('  market history <coin-id> - Show price history (with --timeRange option)');
    console.log('  market overview          - Show market overview');
    console.log('  market stats             - Show market statistics');
    console.log('  market search <query>    - Search coins');
    console.log('');
    
    console.log(chalk.yellow('Portfolio:'));
    console.log('  portfolio view           - View your portfolio');
    console.log('  portfolio summary        - Show portfolio summary');
    console.log('  portfolio filter         - Filter portfolio holdings');
    console.log('  portfolio export         - Export portfolio data');
    console.log('');
    
    console.log(chalk.yellow('Trading:'));
    console.log('  buy <coin-id> <amount>   - Buy coins');
    console.log('  sell <coin-id> <amount>  - Sell coins');
    console.log('');
    
    console.log(chalk.yellow('Transactions:'));
    console.log('  transactions history     - View transaction history');
    console.log('  transactions details <id> - Show transaction details');
    console.log('  transactions export      - Export transaction history');
    console.log('');
    
    console.log(chalk.yellow('Interactive:'));
    console.log('  interactive              - Start interactive mode');
    console.log('  dashboard                - Start dashboard mode (same as interactive)');
    console.log('');
    
    console.log(chalk.yellow('Global options:'));
    console.log('  --debug   - Enable debug mode');
    console.log('  --verbose - Enable verbose output');
    console.log('  --help    - Show help information');
    console.log('  --version - Show version information');
  });

// Handle unknown commands
program.on('command:*', () => {
  console.error(chalk.red('Error: Unknown command'));
  console.log(chalk.gray('Run --help for available commands'));
  process.exit(1);
});

// Parse command line arguments
program.parse(process.argv);

// If no command is provided, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
} 