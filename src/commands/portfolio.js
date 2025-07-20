const display = require('../utils/display');
const api = require('../services/api');
const config = require('../config');

// Portfolio commands
const portfolioCommands = {
  // View portfolio
  async view() {
    const userId = config.get('user.userId');
    if (!userId) {
      display.error('You must be logged in to view your portfolio');
      display.info('Run: coins-cli login');
      return;
    }

    display.header('Portfolio View');
    
    try {
      const spinner = display.spinner('Fetching portfolio data...');
      const response = await api.getPortfolio(userId);
      spinner.succeed('Portfolio data loaded');
      
      const portfolio = response.data;
      
      if (!portfolio.holdings || portfolio.holdings.length === 0) {
        display.info('Your portfolio is empty');
        display.info(`Available funds: ${display.formatCurrency(portfolio.available_funds || 0)}`);
        return;
      }

      const table = display.createPortfolioTable();
      
      portfolio.holdings.forEach(holding => {
        const profitLoss = holding.current_value - holding.total_invested;
        const profitLossPercent = (profitLoss / holding.total_invested) * 100;
        
        table.push([
          holding.coin_name,
          holding.coin_symbol,
          holding.quantity,
          display.formatCurrency(holding.current_price),
          display.formatCurrency(holding.current_value),
          profitLoss >= 0 
            ? display.profit(display.formatCurrency(profitLoss))
            : display.loss(display.formatCurrency(Math.abs(profitLoss)))
        ]);
      });
      
      console.log(table.toString());
      
      // Portfolio summary
      const totalValue = portfolio.holdings.reduce((sum, h) => sum + h.current_value, 0);
      const totalInvested = portfolio.holdings.reduce((sum, h) => sum + h.total_invested, 0);
      const totalProfitLoss = totalValue - totalInvested;
      const totalProfitLossPercent = (totalProfitLoss / totalInvested) * 100;
      
      console.log('\n' + display.colors.bold('Portfolio Summary:'));
      console.log(`  Total Portfolio Value: ${display.formatCurrency(totalValue)}`);
      console.log(`  Total Invested: ${display.formatCurrency(totalInvested)}`);
      console.log(`  Total P&L: ${totalProfitLoss >= 0 
        ? display.profit(display.formatCurrency(totalProfitLoss))
        : display.loss(display.formatCurrency(Math.abs(totalProfitLoss)))}`);
      console.log(`  P&L %: ${display.formatPercentage(totalProfitLossPercent)}`);
      console.log(`  Available Funds: ${display.formatCurrency(portfolio.available_funds || 0)}`);
      
    } catch (error) {
      display.error('Failed to fetch portfolio data');
      if (process.argv.includes('--debug')) {
        console.error(error);
      }
    }
  },

  // Portfolio summary
  async summary() {
    const userId = config.get('user.userId');
    if (!userId) {
      display.error('You must be logged in to view your portfolio summary');
      display.info('Run: coins-cli login');
      return;
    }

    display.header('Portfolio Summary');
    
    try {
      const spinner = display.spinner('Fetching portfolio summary...');
      const response = await api.getPortfolio(userId);
      spinner.succeed('Portfolio summary loaded');
      
      const portfolio = response.data;
      
      const totalValue = portfolio.holdings ? 
        portfolio.holdings.reduce((sum, h) => sum + h.current_value, 0) : 0;
      const totalInvested = portfolio.holdings ? 
        portfolio.holdings.reduce((sum, h) => sum + h.total_invested, 0) : 0;
      const totalProfitLoss = totalValue - totalInvested;
      const totalProfitLossPercent = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;
      const availableFunds = portfolio.available_funds || 0;
      
      console.log(display.colors.bold('Portfolio Overview:'));
      console.log(`  Total Portfolio Value: ${display.formatCurrency(totalValue)}`);
      console.log(`  Total Invested: ${display.formatCurrency(totalInvested)}`);
      console.log(`  Total P&L: ${totalProfitLoss >= 0 
        ? display.profit(display.formatCurrency(totalProfitLoss))
        : display.loss(display.formatCurrency(Math.abs(totalProfitLoss)))}`);
      console.log(`  P&L %: ${display.formatPercentage(totalProfitLossPercent)}`);
      console.log(`  Available Funds: ${display.formatCurrency(availableFunds)}`);
      console.log(`  Number of Holdings: ${portfolio.holdings ? portfolio.holdings.length : 0}`);
      
      // Performance metrics
      if (portfolio.holdings && portfolio.holdings.length > 0) {
        const profitableHoldings = portfolio.holdings.filter(h => 
          (h.current_value - h.total_invested) > 0
        ).length;
        
        console.log('\n' + display.colors.bold('Performance Metrics:'));
        console.log(`  Profitable Positions: ${profitableHoldings}/${portfolio.holdings.length}`);
        console.log(`  Success Rate: ${((profitableHoldings / portfolio.holdings.length) * 100).toFixed(1)}%`);
        
        // Top performers
        const sortedHoldings = [...portfolio.holdings].sort((a, b) => {
          const aPL = (a.current_value - a.total_invested) / a.total_invested;
          const bPL = (b.current_value - b.total_invested) / b.total_invested;
          return bPL - aPL;
        });
        
        if (sortedHoldings.length > 0) {
          console.log('\n' + display.colors.bold('Top Performers:'));
          sortedHoldings.slice(0, 3).forEach((holding, index) => {
            const profitLoss = holding.current_value - holding.total_invested;
            const profitLossPercent = (profitLoss / holding.total_invested) * 100;
            console.log(`  ${index + 1}. ${holding.coin_symbol}: ${display.formatPercentage(profitLossPercent)}`);
          });
        }
      }
      
    } catch (error) {
      display.error('Failed to fetch portfolio summary');
      if (process.argv.includes('--debug')) {
        console.error(error);
      }
    }
  },

  // Filter portfolio
  async filter(options = {}) {
    const userId = config.get('user.userId');
    if (!userId) {
      display.error('You must be logged in to filter your portfolio');
      display.info('Run: coins-cli login');
      return;
    }

    display.header('Portfolio Filter');
    
    try {
      const spinner = display.spinner('Fetching portfolio data...');
      const response = await api.getPortfolio(userId);
      spinner.succeed('Portfolio data loaded');
      
      let holdings = response.data.holdings || [];
      
      // Apply filters
      if (options.symbol) {
        const symbol = options.symbol.toLowerCase();
        holdings = holdings.filter(h => h.coin_symbol.toLowerCase().includes(symbol));
      }
      
      if (options.profitable) {
        holdings = holdings.filter(h => (h.current_value - h.total_invested) > 0);
      }
      
      if (options.losing) {
        holdings = holdings.filter(h => (h.current_value - h.total_invested) < 0);
      }
      
      // Apply sorting
      if (options.sort) {
        switch (options.sort) {
          case 'value':
            holdings.sort((a, b) => b.current_value - a.current_value);
            break;
          case 'profit':
            holdings.sort((a, b) => {
              const aPL = a.current_value - a.total_invested;
              const bPL = b.current_value - b.total_invested;
              return bPL - aPL;
            });
            break;
          case 'quantity':
            holdings.sort((a, b) => b.quantity - a.quantity);
            break;
        }
      }
      
      if (holdings.length === 0) {
        display.info('No holdings match the specified filters');
        return;
      }

      const table = display.createPortfolioTable();
      
      holdings.forEach(holding => {
        const profitLoss = holding.current_value - holding.total_invested;
        
        table.push([
          holding.coin_name,
          holding.coin_symbol,
          holding.quantity,
          display.formatCurrency(holding.current_price),
          display.formatCurrency(holding.current_value),
          profitLoss >= 0 
            ? display.profit(display.formatCurrency(profitLoss))
            : display.loss(display.formatCurrency(Math.abs(profitLoss)))
        ]);
      });
      
      console.log(table.toString());
      display.info(`Showing ${holdings.length} holdings`);
      
    } catch (error) {
      display.error('Failed to filter portfolio');
      if (process.argv.includes('--debug')) {
        console.error(error);
      }
    }
  },

  // Export portfolio
  async export(options = {}) {
    const userId = config.get('user.userId');
    if (!userId) {
      display.error('You must be logged in to export your portfolio');
      display.info('Run: coins-cli login');
      return;
    }

    const format = options.format || 'json';
    const filename = options.filename || `portfolio-${new Date().toISOString().split('T')[0]}`;

    display.header('Portfolio Export');
    
    try {
      const spinner = display.spinner('Fetching portfolio data...');
      const response = await api.getPortfolio(userId);
      spinner.succeed('Portfolio data loaded');
      
      const portfolio = response.data;
      
      if (format === 'csv') {
        // CSV export
        const csvContent = [
          'Coin Name,Coin Symbol,Quantity,Current Price,Current Value,Total Invested,P&L,P&L %',
          ...(portfolio.holdings || []).map(holding => {
            const profitLoss = holding.current_value - holding.total_invested;
            const profitLossPercent = (profitLoss / holding.total_invested) * 100;
            return `${holding.coin_name},${holding.coin_symbol},${holding.quantity},${holding.current_price},${holding.current_value},${holding.total_invested},${profitLoss},${profitLossPercent.toFixed(2)}%`;
          })
        ].join('\n');
        
        const fs = require('fs');
        fs.writeFileSync(`${filename}.csv`, csvContent);
        display.success(`Portfolio exported to ${filename}.csv`);
        
      } else {
        // JSON export
        const fs = require('fs');
        fs.writeFileSync(`${filename}.json`, JSON.stringify(portfolio, null, 2));
        display.success(`Portfolio exported to ${filename}.json`);
      }
      
    } catch (error) {
      display.error('Failed to export portfolio');
      if (process.argv.includes('--debug')) {
        console.error(error);
      }
    }
  }
};

module.exports = portfolioCommands; 