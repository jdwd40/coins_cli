const inquirer = require('inquirer');
const chalk = require('chalk');
const display = require('../utils/display');
const api = require('../services/api');
const config = require('../config');
const authMiddleware = require('../services/authMiddleware');

// Transaction commands
const transactionCommands = {
  // Buy coin
  async buy(coinId, amount) {
    const user = authMiddleware.requireAuth();

    if (!coinId || !amount) {
      display.error('Coin ID and amount are required');
      display.info('Usage: coins-cli buy <coin-id> <amount>');
      display.info('Use "coins-cli market list" to see available coin IDs');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      display.error('Amount must be a positive number');
      return;
    }

    display.header(`Buy ${coinId}`);
    
    try {
      // Get current coin price
      const coinResponse = await api.getCoin(coinId);
      const coin = coinResponse.data.coin;
      const totalCost = numAmount * coin.current_price;
      
      console.log(display.colors.bold('Transaction Details:'));
      console.log(`  Coin: ${coin.name} (${coin.symbol})`);
      console.log(`  Current Price: ${display.formatCurrency(coin.current_price)}`);
      console.log(`  Amount: ${numAmount}`);
      console.log(`  Total Cost: ${display.formatCurrency(totalCost)}`);
      
      // Confirmation prompt
      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: 'Do you want to proceed with this transaction?',
          default: false
        }
      ]);
      
      if (!confirm) {
        display.info('Transaction cancelled');
        return;
      }
      
      const spinner = display.spinner('Processing transaction...');
      
      try {
        const response = await api.buyCoin({
          user_id: parseInt(user.userId),
          coin_id: coinId,
          amount: numAmount
        });
        
        spinner.succeed('Transaction completed successfully!');
        
        const transaction = response.data.data;
        display.success(`Successfully bought ${numAmount} ${coin.symbol}`);
        display.info(`Transaction ID: ${transaction.transaction_id}`);
        display.info(`Total Cost: ${display.formatCurrency(transaction.total_amount)}`);
        
      } catch (apiError) {
        spinner.fail('Transaction failed');
        throw apiError;
      }
      
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 400) {
          display.error('Invalid transaction request');
          if (data && data.message) {
            display.info(`Server message: ${data.message}`);
          }
        } else if (status === 401) {
          display.error('Unauthorized - please login again');
          if (data && data.message) {
            display.info(`Server message: ${data.message}`);
          }
        } else if (status === 404) {
          display.error('Coin not found');
          if (data && data.message) {
            display.info(`Server message: ${data.message}`);
          }
        } else {
          display.error(`Transaction failed (HTTP ${status})`);
          if (data && data.message) {
            display.info(`Server message: ${data.message}`);
          }
        }
      } else {
        display.error('Transaction failed');
      }
      
      if (process.argv.includes('--debug')) {
        console.error(error);
      }
    }
  },

  // Sell coin
  async sell(coinId, amount) {
    const user = authMiddleware.requireAuth();

    if (!coinId || !amount) {
      display.error('Coin ID and amount are required');
      display.info('Usage: coins-cli sell <coin-id> <amount>');
      display.info('Use "coins-cli market list" to see available coin IDs');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      display.error('Amount must be a positive number');
      return;
    }

    display.header(`Sell ${coinId}`);
    
    try {
      // Get current coin price
      const coinResponse = await api.getCoin(coinId);
      const coin = coinResponse.data.coin;
      const totalValue = numAmount * coin.current_price;
      
      console.log(display.colors.bold('Transaction Details:'));
      console.log(`  Coin: ${coin.name} (${coin.symbol})`);
      console.log(`  Current Price: ${display.formatCurrency(coin.current_price)}`);
      console.log(`  Amount: ${numAmount}`);
      console.log(`  Total Value: ${display.formatCurrency(totalValue)}`);
      
      // Confirmation prompt
      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: 'Do you want to proceed with this transaction?',
          default: false
        }
      ]);
      
      if (!confirm) {
        display.info('Transaction cancelled');
        return;
      }
      
      const spinner = display.spinner('Processing transaction...');
      
      try {
        const response = await api.sellCoin({
          user_id: parseInt(user.userId),
          coin_id: coinId,
          amount: numAmount
        });
        
        spinner.succeed('Transaction completed successfully!');
        
        const transaction = response.data.data;
        display.success(`Successfully sold ${numAmount} ${coin.symbol}`);
        display.info(`Transaction ID: ${transaction.transaction_id}`);
        display.info(`Total Value: ${display.formatCurrency(transaction.total_amount)}`);
        
      } catch (apiError) {
        spinner.fail('Transaction failed');
        throw apiError;
      }
      
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 400) {
          display.error('Invalid transaction request');
          if (data && data.message) {
            display.info(`Server message: ${data.message}`);
          }
        } else if (status === 401) {
          display.error('Unauthorized - please login again');
          if (data && data.message) {
            display.info(`Server message: ${data.message}`);
          }
        } else if (status === 404) {
          display.error('Coin not found');
          if (data && data.message) {
            display.info(`Server message: ${data.message}`);
          }
        } else {
          display.error(`Transaction failed (HTTP ${status})`);
          if (data && data.message) {
            display.info(`Server message: ${data.message}`);
          }
        }
      } else {
        display.error('Transaction failed');
      }
      
      if (process.argv.includes('--debug')) {
        console.error(error);
      }
    }
  },

  // View transaction history
  async history(options = {}) {
    const user = authMiddleware.requireAuth();

    const limit = options.limit || 10;
    const type = options.type; // 'BUY' or 'SELL'

    display.header('Transaction History');
    
    try {
      const spinner = display.spinner('Fetching transaction history...');
      const response = await api.getUserTransactions(user.userId, limit);
      spinner.succeed('Transaction history loaded');
      
      let transactions = response.data.transactions;
      
      // Filter by type if specified
      if (type) {
        transactions = transactions.filter(t => t.type === type);
      }
      
      if (transactions.length === 0) {
        display.info('No transactions found');
        return;
      }

      const table = display.createTransactionTable();
      
      transactions.forEach(transaction => {
        const typeColor = transaction.type === 'BUY' ? 
          chalk.green : chalk.red;
        
        table.push([
          transaction.transaction_id,
          typeColor(transaction.type),
          transaction.symbol,
          transaction.quantity,
          display.formatCurrency(transaction.price),
          display.formatCurrency(transaction.total_amount),
          new Date(transaction.created_at).toLocaleString()
        ]);
      });
      
      console.log(table.toString());
      display.info(`Showing ${transactions.length} transactions`);
      
    } catch (error) {
      display.error('Failed to fetch transaction history');
      if (process.argv.includes('--debug')) {
        console.error(error);
      }
    }
  },

  // View transaction details
  async details(transactionId) {
    if (!transactionId) {
      display.error('Transaction ID is required');
      display.info('Usage: coins-cli transactions details <transaction-id>');
      return;
    }

    display.header(`Transaction Details (${transactionId})`);
    
    try {
      const spinner = display.spinner('Fetching transaction details...');
      const response = await api.getTransaction(transactionId);
      spinner.succeed('Transaction details loaded');
      
      const transaction = response.data;
      
      console.log(display.colors.bold('Transaction Information:'));
      console.log(`  ID: ${transaction.transaction_id}`);
      console.log(`  Type: ${transaction.type}`);
      console.log(`  User ID: ${transaction.user_id}`);
      console.log(`  Coin ID: ${transaction.coin_id}`);
      console.log(`  Coin Name: ${transaction.coin_name}`);
      console.log(`  Coin Symbol: ${transaction.symbol}`);
      console.log(`  Quantity: ${transaction.quantity}`);
      console.log(`  Price per Coin: ${display.formatCurrency(transaction.price)}`);
      console.log(`  Total Amount: ${display.formatCurrency(transaction.total_amount)}`);
      console.log(`  Timestamp: ${new Date(transaction.created_at).toLocaleString()}`);
      
      if (transaction.status) {
        console.log(`  Status: ${transaction.status}`);
      }
      
    } catch (error) {
      display.error(`Failed to fetch transaction details for ${transactionId}`);
      if (process.argv.includes('--debug')) {
        console.error(error);
      }
    }
  },

  // Export transaction history
  async export(options = {}) {
    const user = authMiddleware.requireAuth();

    const format = options.format || 'json';
    const filename = options.filename || `transactions-${new Date().toISOString().split('T')[0]}`;
    const limit = options.limit || 100;

    display.header('Transaction History Export');
    
    try {
      const spinner = display.spinner('Fetching transaction history...');
      const response = await api.getUserTransactions(user.userId, limit);
      spinner.succeed('Transaction history loaded');
      
      const transactions = response.data.transactions;
      
      if (format === 'csv') {
        // CSV export
        const csvContent = [
          'Transaction ID,Type,Coin Name,Coin Symbol,Quantity,Price per Coin,Total Amount,Timestamp',
          ...transactions.map(t => 
            `${t.transaction_id},${t.type},${t.coin_name},${t.symbol},${t.quantity},${t.price},${t.total_amount},${new Date(t.created_at).toISOString()}`
          )
        ].join('\n');
        
        const fs = require('fs');
        fs.writeFileSync(`${filename}.csv`, csvContent);
        display.success(`Transaction history exported to ${filename}.csv`);
        
      } else {
        // JSON export
        const fs = require('fs');
        fs.writeFileSync(`${filename}.json`, JSON.stringify(transactions, null, 2));
        display.success(`Transaction history exported to ${filename}.json`);
      }
      
    } catch (error) {
      display.error('Failed to export transaction history');
      if (process.argv.includes('--debug')) {
        console.error(error);
      }
    }
  }
};

module.exports = transactionCommands; 