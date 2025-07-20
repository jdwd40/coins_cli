const display = require('../utils/display');
const api = require('../services/api');

// Market commands
const marketCommands = {
  // List all coins
  async list() {
    display.header('Market - All Coins');
    
    try {
      const spinner = display.spinner('Fetching market data...');
      const response = await api.getCoins();
      spinner.succeed('Market data loaded');
      
      const table = display.createCoinTable();
      
      response.data.forEach(coin => {
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
      display.info(`Showing ${response.data.length} coins`);
      
    } catch (error) {
      display.error('Failed to fetch market data');
      if (process.argv.includes('--debug')) {
        console.error(error);
      }
    }
  },

  // Show coin details
  async details(coinId) {
    if (!coinId) {
      display.error('Coin ID is required');
      display.info('Usage: coins-cli market details <coin-id>');
      return;
    }

    display.header(`Market - Coin Details (${coinId})`);
    
    try {
      const spinner = display.spinner('Fetching coin details...');
      const response = await api.getCoin(coinId);
      spinner.succeed('Coin details loaded');
      
      const coin = response.data;
      
      console.log(display.colors.bold('Coin Information:'));
      console.log(`  ID: ${coin.coin_id}`);
      console.log(`  Name: ${coin.name}`);
      console.log(`  Symbol: ${coin.symbol}`);
      console.log(`  Current Price: ${display.formatCurrency(coin.current_price)}`);
      console.log(`  Market Cap: ${display.formatCurrency(coin.market_cap)}`);
      console.log(`  24h Change: ${display.formatPercentage(coin.price_change_24h)}`);
      console.log(`  Founder: ${coin.founder || 'Unknown'}`);
      console.log(`  Description: ${coin.description || 'No description available'}`);
      
    } catch (error) {
      display.error(`Failed to fetch details for coin ${coinId}`);
      if (process.argv.includes('--debug')) {
        console.error(error);
      }
    }
  },

  // Show coin price history
  async history(coinId, options = {}) {
    if (!coinId) {
      display.error('Coin ID is required');
      display.info('Usage: coins-cli market history <coin-id> [--page] [--limit]');
      return;
    }

    const page = options.page || 1;
    const limit = options.limit || 10;

    display.header(`Market - Price History (${coinId})`);
    
    try {
      const spinner = display.spinner('Fetching price history...');
      const response = await api.getCoinHistory(coinId, page, limit);
      spinner.succeed('Price history loaded');
      
      const history = response.data;
      
      if (history.length === 0) {
        display.info('No price history available for this coin');
        return;
      }

      const table = new display.Table({
        head: [
          display.colors.bold('Date'),
          display.colors.bold('Price'),
          display.colors.bold('Change')
        ],
        colWidths: [25, 15, 15]
      });

      history.forEach(entry => {
        table.push([
          new Date(entry.timestamp).toLocaleString(),
          display.formatCurrency(entry.price),
          display.formatPercentage(entry.price_change || 0)
        ]);
      });

      console.log(table.toString());
      display.info(`Showing page ${page} of price history (${history.length} entries)`);
      
    } catch (error) {
      display.error(`Failed to fetch price history for coin ${coinId}`);
      if (process.argv.includes('--debug')) {
        console.error(error);
      }
    }
  },

  // Show market overview
  async overview(options = {}) {
    const timeRange = options.timeRange || '30M';
    
    display.header('Market Overview');
    
    try {
      const spinner = display.spinner('Fetching market overview...');
      const response = await api.getMarketHistory(timeRange);
      spinner.succeed('Market overview loaded');
      
      const data = response.data;
      
      console.log(display.colors.bold('Market Trends:'));
      console.log(`  Time Range: ${timeRange}`);
      console.log(`  Total Market Value: ${display.formatCurrency(data.total_value || 0)}`);
      console.log(`  Total Volume: ${display.formatCurrency(data.total_volume || 0)}`);
      
      if (data.trends && data.trends.length > 0) {
        console.log('\n' + display.colors.bold('Recent Trends:'));
        data.trends.forEach(trend => {
          console.log(`  ${trend.timestamp}: ${display.formatCurrency(trend.value)}`);
        });
      }
      
    } catch (error) {
      display.error('Failed to fetch market overview');
      if (process.argv.includes('--debug')) {
        console.error(error);
      }
    }
  },

  // Show market statistics
  async stats() {
    display.header('Market Statistics');
    
    try {
      const spinner = display.spinner('Fetching market statistics...');
      const response = await api.getMarketStats();
      spinner.succeed('Market statistics loaded');
      
      const stats = response.data;
      
      console.log(display.colors.bold('Market Performance:'));
      console.log(`  Total Coins: ${stats.total_coins || 0}`);
      console.log(`  Total Market Cap: ${display.formatCurrency(stats.total_market_cap || 0)}`);
      console.log(`  Total Volume (24h): ${display.formatCurrency(stats.total_volume_24h || 0)}`);
      console.log(`  Market Change (24h): ${display.formatPercentage(stats.market_change_24h || 0)}`);
      
      if (stats.top_gainers && stats.top_gainers.length > 0) {
        console.log('\n' + display.colors.bold('Top Gainers (24h):'));
        stats.top_gainers.forEach(coin => {
          console.log(`  ${coin.symbol}: ${display.formatPercentage(coin.price_change_24h)}`);
        });
      }
      
      if (stats.top_losers && stats.top_losers.length > 0) {
        console.log('\n' + display.colors.bold('Top Losers (24h):'));
        stats.top_losers.forEach(coin => {
          console.log(`  ${coin.symbol}: ${display.formatPercentage(coin.price_change_24h)}`);
        });
      }
      
    } catch (error) {
      display.error('Failed to fetch market statistics');
      if (process.argv.includes('--debug')) {
        console.error(error);
      }
    }
  },

  // Search coins
  async search(query) {
    if (!query) {
      display.error('Search query is required');
      display.info('Usage: coins-cli market search <query>');
      return;
    }

    display.header(`Market Search - "${query}"`);
    
    try {
      const spinner = display.spinner('Searching coins...');
      const response = await api.getCoins();
      spinner.succeed('Search completed');
      
      // Filter coins based on search query
      const searchTerm = query.toLowerCase();
      const filteredCoins = response.data.filter(coin => 
        coin.name.toLowerCase().includes(searchTerm) ||
        coin.symbol.toLowerCase().includes(searchTerm)
      );
      
      if (filteredCoins.length === 0) {
        display.info(`No coins found matching "${query}"`);
        return;
      }

      const table = display.createCoinTable();
      
      filteredCoins.forEach(coin => {
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
      display.info(`Found ${filteredCoins.length} coins matching "${query}"`);
      
    } catch (error) {
      display.error('Failed to search coins');
      if (process.argv.includes('--debug')) {
        console.error(error);
      }
    }
  }
};

module.exports = marketCommands; 