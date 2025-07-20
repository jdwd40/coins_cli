const display = require('../utils/display');
const api = require('../services/api');
const config = require('../config');
const authMiddleware = require('../services/authMiddleware');

// Portfolio commands
const portfolioCommands = {
  // View portfolio
  async view() {
    const user = authMiddleware.requireAuth();

    display.header('Portfolio View');
    
    try {
      const spinner = display.spinner('Fetching portfolio data...');
      const response = await api.getPortfolio(user.userId);
      spinner.succeed('Portfolio data loaded');
      
      const portfolio = response.data.portfolio;
      const userFunds = response.data.user_funds || 0;
      
      if (!portfolio || portfolio.length === 0) {
        display.info('Your portfolio is empty');
        display.info(`Available funds: ${display.formatCurrency(userFunds)}`);
        return;
      }

      const table = display.createPortfolioTable();
      
      portfolio.forEach(holding => {
        const currentValue = parseFloat(holding.total_amount) * parseFloat(holding.current_price);
        const totalInvested = parseFloat(holding.total_invested);
        const profitLoss = currentValue - totalInvested;
        const profitLossPercent = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;
        
        table.push([
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
      
      // Portfolio summary
      const totalValue = portfolio.reduce((sum, h) => sum + (parseFloat(h.total_amount) * parseFloat(h.current_price)), 0);
      const totalInvested = portfolio.reduce((sum, h) => sum + parseFloat(h.total_invested), 0);
      const totalProfitLoss = totalValue - totalInvested;
      const totalProfitLossPercent = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;
      
      console.log('\n' + display.colors.bold('Portfolio Summary:'));
      console.log(`  Total Portfolio Value: ${display.formatCurrency(totalValue)}`);
      console.log(`  Total Invested: ${display.formatCurrency(totalInvested)}`);
      console.log(`  Total P&L: ${totalProfitLoss >= 0 
        ? display.profit(display.formatCurrency(totalProfitLoss))
        : display.loss(display.formatCurrency(Math.abs(totalProfitLoss)))}`);
      console.log(`  P&L %: ${display.formatPercentage(totalProfitLossPercent)}`);
      console.log(`  Available Funds: ${display.formatCurrency(userFunds)}`);
      
    } catch (error) {
      display.error('Failed to fetch portfolio data');
      if (process.argv.includes('--debug')) {
        console.error(error);
      }
    }
  },

  // Portfolio summary
  async summary() {
    const user = authMiddleware.requireAuth();

    display.header('Portfolio Summary');
    
    try {
      const spinner = display.spinner('Fetching portfolio summary...');
      const response = await api.getPortfolio(user.userId);
      spinner.succeed('Portfolio summary loaded');
      
      const portfolio = response.data.portfolio;
      const userFunds = response.data.user_funds || 0;
      
      const totalValue = portfolio ? 
        portfolio.reduce((sum, h) => sum + (parseFloat(h.total_amount) * parseFloat(h.current_price)), 0) : 0;
      const totalInvested = portfolio ? 
        portfolio.reduce((sum, h) => sum + parseFloat(h.total_invested), 0) : 0;
      const totalProfitLoss = totalValue - totalInvested;
      const totalProfitLossPercent = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;
      
      console.log(display.colors.bold('Portfolio Overview:'));
      console.log(`  Total Portfolio Value: ${display.formatCurrency(totalValue)}`);
      console.log(`  Total Invested: ${display.formatCurrency(totalInvested)}`);
      console.log(`  Total P&L: ${totalProfitLoss >= 0 
        ? display.profit(display.formatCurrency(totalProfitLoss))
        : display.loss(display.formatCurrency(Math.abs(totalProfitLoss)))}`);
      console.log(`  P&L %: ${display.formatPercentage(totalProfitLossPercent)}`);
      console.log(`  Available Funds: ${display.formatCurrency(userFunds)}`);
      console.log(`  Number of Holdings: ${portfolio ? portfolio.length : 0}`);
      
      // Performance metrics
      if (portfolio && portfolio.length > 0) {
        const profitableHoldings = portfolio.filter(h => {
          const currentValue = parseFloat(h.total_amount) * parseFloat(h.current_price);
          const totalInvested = parseFloat(h.total_invested);
          return (currentValue - totalInvested) > 0;
        }).length;
        
        console.log('\n' + display.colors.bold('Performance Metrics:'));
        console.log(`  Profitable Positions: ${profitableHoldings}/${portfolio.length}`);
        console.log(`  Success Rate: ${((profitableHoldings / portfolio.length) * 100).toFixed(1)}%`);
        
        // Top performers
        const sortedHoldings = [...portfolio].sort((a, b) => {
          const aValue = parseFloat(a.total_amount) * parseFloat(a.current_price);
          const bValue = parseFloat(b.total_amount) * parseFloat(b.current_price);
          const aPL = (aValue - parseFloat(a.total_invested)) / parseFloat(a.total_invested);
          const bPL = (bValue - parseFloat(b.total_invested)) / parseFloat(b.total_invested);
          return bPL - aPL;
        });
        
        if (sortedHoldings.length > 0) {
          console.log('\n' + display.colors.bold('Top Performers:'));
          sortedHoldings.slice(0, 3).forEach((holding, index) => {
            const currentValue = parseFloat(holding.total_amount) * parseFloat(holding.current_price);
            const totalInvested = parseFloat(holding.total_invested);
            const profitLoss = currentValue - totalInvested;
            const profitLossPercent = (profitLoss / totalInvested) * 100;
            console.log(`  ${index + 1}. ${holding.symbol}: ${display.formatPercentage(profitLossPercent)}`);
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
    const user = authMiddleware.requireAuth();

    display.header('Portfolio Filter');
    
    try {
      const spinner = display.spinner('Fetching portfolio data...');
      const response = await api.getPortfolio(user.userId);
      spinner.succeed('Portfolio data loaded');
      
      let holdings = response.data.portfolio || [];
      
      // Apply filters
      if (options.symbol) {
        const symbol = options.symbol.toLowerCase();
        holdings = holdings.filter(h => h.symbol.toLowerCase().includes(symbol));
      }
      
      if (options.profitable) {
        holdings = holdings.filter(h => {
          const currentValue = parseFloat(h.total_amount) * parseFloat(h.current_price);
          const totalInvested = parseFloat(h.total_invested);
          return (currentValue - totalInvested) > 0;
        });
      }
      
      if (options.losing) {
        holdings = holdings.filter(h => {
          const currentValue = parseFloat(h.total_amount) * parseFloat(h.current_price);
          const totalInvested = parseFloat(h.total_invested);
          return (currentValue - totalInvested) < 0;
        });
      }
      
      // Apply sorting
      if (options.sort) {
        switch (options.sort) {
          case 'value':
            holdings.sort((a, b) => {
              const aValue = parseFloat(a.total_amount) * parseFloat(a.current_price);
              const bValue = parseFloat(b.total_amount) * parseFloat(b.current_price);
              return bValue - aValue;
            });
            break;
          case 'profit':
            holdings.sort((a, b) => {
              const aValue = parseFloat(a.total_amount) * parseFloat(a.current_price);
              const bValue = parseFloat(b.total_amount) * parseFloat(b.current_price);
              const aPL = aValue - parseFloat(a.total_invested);
              const bPL = bValue - parseFloat(b.total_invested);
              return bPL - aPL;
            });
            break;
          case 'quantity':
            holdings.sort((a, b) => parseFloat(b.total_amount) - parseFloat(a.total_amount));
            break;
        }
      }
      
      if (holdings.length === 0) {
        display.info('No holdings match the specified filters');
        return;
      }

      const table = display.createPortfolioTable();
      
      holdings.forEach(holding => {
        const currentValue = parseFloat(holding.total_amount) * parseFloat(holding.current_price);
        const totalInvested = parseFloat(holding.total_invested);
        const profitLoss = currentValue - totalInvested;
        
        table.push([
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
    const user = authMiddleware.requireAuth();

    const format = options.format || 'json';
    const filename = options.filename || `portfolio-${new Date().toISOString().split('T')[0]}`;

    display.header('Portfolio Export');
    
    try {
      const spinner = display.spinner('Fetching portfolio data...');
      const response = await api.getPortfolio(user.userId);
      spinner.succeed('Portfolio data loaded');
      
      const portfolio = response.data.portfolio;
      const userFunds = response.data.user_funds || 0;
      
      if (format === 'csv') {
        // CSV export
        const csvContent = [
          'Coin Name,Coin Symbol,Quantity,Current Price,Current Value,Total Invested,P&L,P&L %',
          ...(portfolio || []).map(holding => {
            const currentValue = parseFloat(holding.total_amount) * parseFloat(holding.current_price);
            const totalInvested = parseFloat(holding.total_invested);
            const profitLoss = currentValue - totalInvested;
            const profitLossPercent = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;
            return `${holding.name},${holding.symbol},${holding.total_amount},${holding.current_price},${currentValue},${totalInvested},${profitLoss},${profitLossPercent.toFixed(2)}%`;
          })
        ].join('\n');
        
        const fs = require('fs');
        fs.writeFileSync(`${filename}.csv`, csvContent);
        display.success(`Portfolio exported to ${filename}.csv`);
        
      } else {
        // JSON export
        const exportData = {
          portfolio: portfolio,
          user_funds: userFunds,
          export_date: new Date().toISOString()
        };
        const fs = require('fs');
        fs.writeFileSync(`${filename}.json`, JSON.stringify(exportData, null, 2));
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