const inquirer = require('inquirer');
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
      const coin = coinResponse.data;
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
          user_id: user.userId,
          coin_id: coinId,
          quantity: numAmount,
          price_per_coin: coin.current_price
        });
        
        spinner.succeed('Transaction completed successfully!');
        
        const transaction = response.data;
        display.success(`Successfully bought ${numAmount} ${coin.symbol}`);
        display.info(`Transaction ID: ${transaction.transaction_id}`);
        display.info(`Total Cost: ${display.formatCurrency(transaction.total_cost)}`);
        
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
          if (data && data.msg) {
            display.info(`Server message: ${data.msg}`);
          }
        } else if (status === 404) {
          display.error('Coin not found');
        } else if (status === 409) {
          display.error('Insufficient funds for this transaction');
        } else {
          display.error(`Transaction failed (HTTP ${status})`);
          if (data && data.msg) {
            display.info(`Server message: ${data.msg}`);
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
      const coin = coinResponse.data;
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
          user_id: user.userId,
          coin_id: coinId,
          quantity: numAmount,
          price_per_coin: coin.current_price
        });
        
        spinner.succeed('Transaction completed successfully!');
        
        const transaction = response.data;
        display.success(`Successfully sold ${numAmount} ${coin.symbol}`);
        display.info(`Transaction ID: ${transaction.transaction_id}`);
        display.info(`Total Value: ${display.formatCurrency(transaction.total_value)}`);
        
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
          if (data && data.msg) {
            display.info(`Server message: ${data.msg}`);
          }
        } else if (status === 404) {
          display.error('Coin not found');
        } else if (status === 409) {
          display.error('Insufficient coins for this transaction');
        } else {
          display.error(`Transaction failed (HTTP ${status})`);
          if (data && data.msg) {
            display.info(`Server message: ${data.msg}`);
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
      
      let transactions = response.data;
      
      // Filter by type if specified
      if (type) {
        transactions = transactions.filter(t => t.transaction_type === type);
      }
      
      if (transactions.length === 0) {
        display.info('No transactions found');
        return;
      }

      const table = display.createTransactionTable();
      
      transactions.forEach(transaction => {
        const typeColor = transaction.transaction_type === 'BUY' ? 
          display.colors.green : display.colors.red;
        
        table.push([
          transaction.transaction_id,
          typeColor(transaction.transaction_type),
          transaction.coin_symbol,
          transaction.quantity,
          display.formatCurrency(transaction.price_per_coin),
          display.formatCurrency(transaction.total_cost || transaction.total_value),
          new Date(transaction.timestamp).toLocaleString()
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
      console.log(`  Type: ${transaction.transaction_type}`);
      console.log(`  User ID: ${transaction.user_id}`);
      console.log(`  Coin ID: ${transaction.coin_id}`);
      console.log(`  Coin Symbol: ${transaction.coin_symbol}`);
      console.log(`  Quantity: ${transaction.quantity}`);
      console.log(`  Price per Coin: ${display.formatCurrency(transaction.price_per_coin)}`);
      console.log(`  Total Cost: ${display.formatCurrency(transaction.total_cost || 0)}`);
      console.log(`  Total Value: ${display.formatCurrency(transaction.total_value || 0)}`);
      console.log(`  Timestamp: ${new Date(transaction.timestamp).toLocaleString()}`);
      
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
      
      const transactions = response.data;
      
      if (format === 'csv') {
        // CSV export
        const csvContent = [
          'Transaction ID,Type,Coin Symbol,Quantity,Price per Coin,Total Cost,Total Value,Timestamp',
          ...transactions.map(t => 
            `${t.transaction_id},${t.transaction_type},${t.coin_symbol},${t.quantity},${t.price_per_coin},${t.total_cost || 0},${t.total_value || 0},${new Date(t.timestamp).toISOString()}`
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