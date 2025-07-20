const display = require('../utils/display');
const api = require('../services/api');
const Table = require('cli-table3');

// Helper function to highlight matching terms in search results
function highlightMatch(text, searchTerm) {
  if (!searchTerm) return text;
  
  const searchWords = searchTerm.toLowerCase().split(/\s+/);
  let highlightedText = text;
  
  searchWords.forEach(word => {
    if (word.length >= 2) {
      const regex = new RegExp(`(${word})`, 'gi');
      highlightedText = highlightedText.replace(regex, display.colors.bold.yellow('$1'));
    }
  });
  
  return highlightedText;
}

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
      
      // Handle the coin wrapper object in the response
      const coin = response.data.coin || response.data;
      
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
      display.info('Usage: coins-cli market history <coin-id> [--page] [--limit] [--timeRange]');
      return;
    }

    const page = options.page || 1;
    const limit = options.limit || 10;
    const timeRange = options.timeRange || '30M'; // Default to 30 minutes as requested

    display.header(`Market - Price History (${coinId}) - Last ${timeRange}`);
    
    try {
      const spinner = display.spinner('Fetching price history...');
      
      // Try to use timeRange parameter first, fallback to regular endpoint
      let response;
      try {
        response = await api.getCoinHistoryWithTimeRange(coinId, timeRange, page, limit);
      } catch (error) {
        // If timeRange parameter is not supported, fallback to regular endpoint
        // and filter client-side for the last 30 minutes
        response = await api.getCoinHistory(coinId, page, limit * 2); // Get more data to filter
      }
      
      spinner.succeed('Price history loaded');
      
      // Handle the correct response structure: {data: [...], pagination: {...}}
      let history = response.data.data || [];
      const pagination = response.data.pagination;
      
      // If timeRange parameter is not supported by API, filter client-side
      if (!response.data.timeRange && timeRange !== 'ALL') {
        const now = new Date();
        const timeRangeMs = {
          '10M': 10 * 60 * 1000,
          '30M': 30 * 60 * 1000,
          '1H': 60 * 60 * 1000,
          '2H': 2 * 60 * 60 * 1000,
          '12H': 12 * 60 * 60 * 1000,
          '24H': 24 * 60 * 60 * 1000
        };
        
        const cutoffTime = now.getTime() - (timeRangeMs[timeRange] || timeRangeMs['30M']);
        
        history = history.filter(entry => {
          const entryTime = new Date(entry.created_at).getTime();
          return entryTime >= cutoffTime;
        });
        
        // Limit the results to the requested limit
        history = history.slice(0, limit);
      }
      
      if (history.length === 0) {
        display.info(`No price history available for this coin in the last ${timeRange}`);
        return;
      }

      const table = new Table({
        head: [
          display.colors.bold('Date'),
          display.colors.bold('Price'),
          display.colors.bold('Change %')
        ],
        colWidths: [25, 15, 15]
      });

      // Calculate price changes between consecutive entries
      history.forEach((entry, index) => {
        let priceChange = 0;
        if (index > 0) {
          const previousPrice = history[index - 1].price;
          priceChange = ((entry.price - previousPrice) / previousPrice) * 100;
        }
        
        const formattedChange = priceChange >= 0 ? 
          `+${priceChange.toFixed(2)}%` : `${priceChange.toFixed(2)}%`;
        
        table.push([
          new Date(entry.created_at).toLocaleString(),
          display.formatCurrency(entry.price),
          formattedChange
        ]);
      });

      console.log(table.toString());
      
      // Show pagination info if available
      if (pagination) {
        display.info(`Showing page ${pagination.currentPage} of ${pagination.totalPages} (${pagination.totalItems} total entries)`);
      } else {
        display.info(`Showing ${history.length} entries from the last ${timeRange}`);
      }
      
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
      const history = data.history || [];
      
      if (history.length === 0) {
        display.info(`No market data available for the last ${timeRange}`);
        return;
      }
      
      // Get the latest and earliest entries for trend analysis
      const latest = history[history.length - 1];
      const earliest = history[0];
      
      // Calculate market trend
      const latestValue = parseFloat(latest.total_value);
      const earliestValue = parseFloat(earliest.total_value);
      const valueChange = latestValue - earliestValue;
      const percentageChange = earliestValue > 0 ? (valueChange / earliestValue) * 100 : 0;
      
      console.log(display.colors.bold('Market Overview:'));
      console.log(`  Time Range: ${data.timeRange || timeRange}`);
      console.log(`  Data Points: ${data.count || history.length}`);
      console.log(`  Current Market Value: ${display.formatCurrency(latestValue)}`);
      console.log(`  Market Trend: ${display.formatMarketTrend(latest.market_trend)}`);
      
      if (history.length > 1) {
        console.log(`  Value Change: ${valueChange >= 0 ? display.profit(display.formatCurrency(valueChange)) : display.loss(display.formatCurrency(Math.abs(valueChange)))}`);
        console.log(`  Percentage Change: ${display.formatPercentage(percentageChange)}`);
      }
      
      // Show recent market history in a table
      if (history.length > 1) {
        console.log('\n' + display.colors.bold('Recent Market History:'));
        
        const table = new Table({
          head: [
            display.colors.bold('Time'),
            display.colors.bold('Total Value'),
            display.colors.bold('Market Trend'),
            display.colors.bold('Change')
          ],
          colWidths: [20, 15, 15, 15]
        });
        
        // Show last 10 entries (or all if less than 10)
        const recentHistory = history.slice(-10);
        
        recentHistory.forEach((entry, index) => {
          let change = '';
          if (index > 0) {
            const currentValue = parseFloat(entry.total_value);
            const previousValue = parseFloat(recentHistory[index - 1].total_value);
            const entryChange = currentValue - previousValue;
            const entryPercentage = previousValue > 0 ? (entryChange / previousValue) * 100 : 0;
            
            change = entryPercentage >= 0 ? 
              display.profit(`+${entryPercentage.toFixed(2)}%`) : 
              display.loss(`${entryPercentage.toFixed(2)}%`);
          }
          
          table.push([
            new Date(entry.created_at).toLocaleTimeString(),
            display.formatCurrency(parseFloat(entry.total_value)),
            display.formatMarketTrend(entry.market_trend),
            change
          ]);
        });
        
        console.log(table.toString());
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
      console.log(`  Current Value: ${display.formatCurrency(stats.currentValue)}`);
      console.log(`  Latest Value: ${display.formatCurrency(stats.latestValue)}`);
      console.log(`  All Time High: ${display.formatCurrency(stats.allTimeHigh)}`);
      console.log(`  All Time Low: ${display.formatCurrency(stats.allTimeLow)}`);
      console.log(`  Period High: ${display.formatCurrency(stats.periodHigh)}`);
      console.log(`  Status: ${display.colors.bold(stats.status)}`);
      
      // Display current cycle information
      if (stats.currentCycle) {
        console.log('\n' + display.colors.bold('Current Market Cycle:'));
        console.log(`  Type: ${display.formatMarketTrend(stats.currentCycle.type)}`);
        console.log(`  Time Remaining: ${stats.currentCycle.timeRemaining}`);
      }
      
      // Display active events
      if (stats.events && stats.events.length > 0) {
        console.log('\n' + display.colors.bold('Active Market Events:'));
        
        const table = new Table({
          head: [
            display.colors.bold('Coin ID'),
            display.colors.bold('Event Type'),
            display.colors.bold('Effect'),
            display.colors.bold('Time Remaining')
          ],
          colWidths: [10, 25, 12, 15]
        });
        
        stats.events.forEach(event => {
          const effectColor = event.effect === 'POSITIVE' ? display.colors.profit : display.colors.loss;
          const effectIcon = event.effect === 'POSITIVE' ? '📈' : '📉';
          
          table.push([
            event.coinId,
            event.type.replace(/_/g, ' '),
            effectColor(`${effectIcon} ${event.effect}`),
            event.timeRemaining
          ]);
        });
        
        console.log(table.toString());
        display.info(`Showing ${stats.events.length} active events`);
      }
      
      // Display timestamp
      if (stats.timestamp) {
        console.log('\n' + display.colors.gray(`Last Updated: ${new Date(stats.timestamp).toLocaleString()}`));
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
      
      // Handle the coins wrapper object in the response
      const coins = response.data.coins || response.data;
      
      // Enhanced search with fuzzy matching
      const searchTerm = query.toLowerCase().trim();
      const searchWords = searchTerm.split(/\s+/);
      
      const filteredCoins = coins.filter(coin => {
        const coinName = coin.name.toLowerCase();
        const coinSymbol = coin.symbol.toLowerCase();
        
        // Exact match check
        if (coinName === searchTerm || coinSymbol === searchTerm) {
          return true;
        }
        
        // Partial match check
        if (coinName.includes(searchTerm) || coinSymbol.includes(searchTerm)) {
          return true;
        }
        
        // Multi-word search (all words must be found in name or symbol)
        if (searchWords.length > 1) {
          return searchWords.every(word => 
            coinName.includes(word) || coinSymbol.includes(word)
          );
        }
        
        // Fuzzy matching for single words
        if (searchWords.length === 1) {
          const word = searchWords[0];
          
          // Check if word is contained in name or symbol
          if (coinName.includes(word) || coinSymbol.includes(word)) {
            return true;
          }
          
          // Check for similar patterns (e.g., "bit" matches "Bitcoin")
          if (word.length >= 3) {
            return coinName.includes(word) || coinSymbol.includes(word);
          }
        }
        
        return false;
      });
      
      if (filteredCoins.length === 0) {
        display.info(`No coins found matching "${query}"`);
        display.info('Try searching with a different term or check the spelling');
        return;
      }

      // Sort results by relevance (exact matches first, then by name similarity)
      const sortedCoins = filteredCoins.sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        const aSymbol = a.symbol.toLowerCase();
        const bSymbol = b.symbol.toLowerCase();
        
        // Exact matches first
        if (aName === searchTerm || aSymbol === searchTerm) return -1;
        if (bName === searchTerm || bSymbol === searchTerm) return 1;
        
        // Then by name similarity
        const aNameScore = aName.includes(searchTerm) ? 1 : 0;
        const bNameScore = bName.includes(searchTerm) ? 1 : 0;
        
        if (aNameScore !== bNameScore) return bNameScore - aNameScore;
        
        // Finally by alphabetical order
        return aName.localeCompare(bName);
      });

      const table = display.createCoinTable();
      
      sortedCoins.forEach(coin => {
        // Highlight matching terms in the output
        const highlightedName = highlightMatch(coin.name, searchTerm);
        const highlightedSymbol = highlightMatch(coin.symbol, searchTerm);
        
        table.push([
          coin.coin_id,
          highlightedName,
          highlightedSymbol,
          display.formatCurrency(coin.current_price),
          display.formatCurrency(coin.market_cap),
          display.formatPercentage(coin.price_change_24h)
        ]);
      });
      
      console.log(table.toString());
      display.info(`Found ${sortedCoins.length} coins matching "${query}"`);
      
      // Show quick access tips
      if (sortedCoins.length > 1) {
        console.log('\n' + display.colors.gray('💡 Quick access: Use "coins-cli market details <coin-id>" to see detailed information'));
      }
      
    } catch (error) {
      display.error('Failed to search coins');
      if (process.argv.includes('--debug')) {
        console.error(error);
      }
    }
  }
};

module.exports = marketCommands; 