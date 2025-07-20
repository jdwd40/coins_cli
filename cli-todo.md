# CLI App Todo List - Verified Against Existing API

## **Phase 1: Project Setup & Core Structure**
- [x] **1.1** Initialize CLI project with proper structure
  - Create `cli/` directory
  - Set up `package.json` with CLI dependencies
  - Create executable entry point `bin/coins-cli.js`
- [x] **1.2** Install and configure dependencies
  - `commander` - Command-line interface framework
  - `inquirer` - Interactive prompts
  - `chalk` - Colored terminal output
  - `axios` - HTTP client for API calls
  - `ora` - Terminal spinners
  - `conf` - Configuration management
  - `cli-table3` - Pretty table formatting
- [ ] **1.3** Create configuration management
  - API base URL configuration
  - Environment variable handling
  - User preferences storage
- [ ] **1.4** Set up project structure
  - `src/commands/` - Command implementations
  - `src/services/` - API service layer
  - `src/utils/` - Utility functions
  - `src/config/` - Configuration files
- [x] **1.5** Create base CLI command structure
  - Main command setup with Commander.js
  - Global options (--help, --version, --debug)
  - Command grouping and organization

## **Phase 2: Authentication System**
- [ ] **2.1** Implement user registration command
  - Command: `coins-cli register`
  - Interactive prompts for username, email, password
  - API endpoint: `POST /api/users/register`
  - Validation for required fields and format
- [ ] **2.2** Implement user login command
  - Command: `coins-cli login`
  - Interactive prompts for email and password
  - API endpoint: `POST /api/users/login`
  - JWT token storage in local config
- [ ] **2.3** Create JWT token management
  - Secure token storage using `conf` package
  - Token validation and refresh logic
  - Automatic token inclusion in API requests
- [ ] **2.4** Add logout functionality
  - Command: `coins-cli logout`
  - Clear stored tokens and user data
  - Reset authentication state
- [ ] **2.5** Implement authentication middleware
  - Check token validity before API calls
  - Handle token expiration gracefully
  - Redirect to login when needed
- [ ] **2.6** Add session persistence
  - Store user info locally
  - Remember login state across sessions
  - Auto-login functionality

## **Phase 3: Market Data & Coin Information**
- [ ] **3.1** Create command to list all coins
  - Command: `coins-cli market list`
  - API endpoint: `GET /api/coins`
  - Display in formatted table with key info
  - Show: coin_id, name, symbol, current_price, market_cap, price_change_24h
- [ ] **3.2** Implement coin details view
  - Command: `coins-cli market details <coin-id>`
  - API endpoint: `GET /api/coins/:coin_id`
  - Detailed coin information display
  - Show all coin properties including founder
- [ ] **3.3** Add price history viewing
  - Command: `coins-cli market history <coin-id> [--page] [--limit]`
  - API endpoint: `GET /api/coins/:coin_id/history`
  - Paginated price history display
  - Optional pagination parameters
- [ ] **3.4** Create market overview command
  - Command: `coins-cli market overview [--timeRange]`
  - API endpoint: `GET /api/market/price-history`
  - Market trend and total value display
  - Time range options: 10M, 30M, 1H, 2H, 12H, 24H, ALL
- [ ] **3.5** Add market statistics
  - Command: `coins-cli market stats`
  - API endpoint: `GET /api/market/stats`
  - Market performance metrics
- [ ] **3.6** Implement search functionality
  - Search coins by name or symbol
  - Fuzzy matching for better UX
  - Display search results in table format

## **Phase 4: Portfolio Management**
- [ ] **4.1** Create portfolio view command
  - Command: `coins-cli portfolio view`
  - API endpoint: `GET /api/transactions/portfolio/:user_id`
  - Display current holdings with current values
  - Show: coin name, symbol, quantity, current price, total value, total invested
- [ ] **4.2** Display portfolio with profit/loss
  - Calculate and show profit/loss for each coin
  - Color-coded output (green for profit, red for loss)
  - Percentage change calculations
- [ ] **4.3** Add portfolio summary
  - Command: `coins-cli portfolio summary`
  - Total portfolio value
  - Total profit/loss
  - Available funds
  - Portfolio performance metrics
- [ ] **4.4** Implement portfolio filtering
  - Filter by coin symbol
  - Sort by value, profit/loss, quantity
  - Show only profitable/losing positions
- [ ] **4.5** Add portfolio export
  - Export to CSV format
  - Export to JSON format
  - Save to file with timestamp

## **Phase 5: Trading Operations**
- [ ] **5.1** Implement buy coin command
  - Command: `coins-cli buy <coin-id> <amount>`
  - API endpoint: `POST /api/transactions/buy`
  - Interactive confirmation prompts
  - Show transaction cost and confirmation
  - Validate sufficient funds before transaction
- [ ] **5.2** Implement sell coin command
  - Command: `coins-cli sell <coin-id> <amount>`
  - API endpoint: `POST /api/transactions/sell`
  - Interactive confirmation prompts
  - Show transaction value and confirmation
  - Validate sufficient coins before transaction
- [ ] **5.3** Add transaction confirmation
  - Show transaction details before execution
  - Display current price and total cost/value
  - Require user confirmation (Y/N)
  - Show success/failure messages
- [ ] **5.4** Create transaction history view
  - Command: `coins-cli transactions [--limit] [--type]`
  - API endpoint: `GET /api/transactions/user/:user_id`
  - Display recent transactions
  - Filter by transaction type (BUY/SELL)
  - Show transaction details with timestamps
- [ ] **5.5** Implement transaction details
  - Command: `coins-cli transactions <transaction-id>`
  - API endpoint: `GET /api/transactions/:transaction_id`
  - Detailed transaction information
  - Show all transaction properties
- [ ] **5.6** Add transaction export
  - Export transaction history to CSV
  - Export to JSON format
  - Filter by date range

## **Phase 6: User Experience & Interface**
- [ ] **6.1** Create interactive menu system
  - Command: `coins-cli interactive`
  - Main menu with numbered options
  - Sub-menus for different categories
  - Easy navigation between features
- [ ] **6.2** Add colorful output
  - Use chalk for colored text
  - Green for success/profit
  - Red for errors/losses
  - Yellow for warnings
  - Blue for information
- [ ] **6.3** Implement progress indicators
  - Loading spinners for API calls
  - Progress bars for long operations
  - Status messages for user feedback
- [ ] **6.4** Add error handling
  - User-friendly error messages
  - Network error handling
  - API error response handling
  - Graceful fallbacks
- [ ] **6.5** Create help system
  - Command: `coins-cli help`
  - Detailed command documentation
  - Examples for each command
  - Interactive help with examples
- [ ] **6.6** Add auto-completion
  - Command auto-completion
  - Coin symbol auto-completion
  - Tab completion for options

## **Phase 7: Advanced Features**
- [ ] **7.1** Implement watchlist functionality
  - Add/remove coins to watchlist
  - View watchlist with current prices
  - Quick access to watched coins
- [ ] **7.2** Add price alerts (local)
  - Set price thresholds for coins
  - Local notifications when thresholds met
  - Alert management commands
- [ ] **7.3** Create trading strategies
  - Basic buy-low-sell-high alerts
  - Portfolio rebalancing suggestions
  - Market trend analysis
- [ ] **7.4** Add data export features
  - Export portfolio to CSV/JSON
  - Export transaction history
  - Export market data
  - Custom date range exports
- [ ] **7.5** Implement configuration management
  - User preferences storage
  - Default settings configuration
  - Theme customization
  - API endpoint configuration

## **Phase 8: Testing & Documentation**
- [ ] **8.1** Write unit tests
  - Test command implementations
  - Test API service functions
  - Test utility functions
  - Mock API responses
- [ ] **8.2** Create integration tests
  - Test full command workflows
  - Test authentication flow
  - Test trading operations
  - Test error scenarios
- [ ] **8.3** Add error handling tests
  - Test network failures
  - Test invalid input handling
  - Test API error responses
  - Test authentication failures
- [ ] **8.4** Write user documentation
  - Comprehensive README
  - Installation guide
  - Usage examples
  - Troubleshooting guide
- [ ] **8.5** Create developer documentation
  - API integration guide
  - Command development guide
  - Testing guide
  - Contributing guidelines
- [ ] **8.6** Add examples and demos
  - Sample usage scenarios
  - Common workflows
  - Best practices
  - Video tutorials (optional)

## **Phase 9: Deployment & Distribution**
- [ ] **9.1** Package CLI for distribution
  - Create npm package
  - Set up proper bin configuration
  - Add package metadata
- [ ] **9.2** Add installation scripts
  - Global installation support
  - Post-install setup
  - Configuration wizard
- [ ] **9.3** Create release process
  - Version management
  - Changelog generation
  - Release notes
- [ ] **9.4** Add update mechanism
  - Check for updates
  - Auto-update functionality
  - Update notifications

## **Verification Notes:**
✅ **API Endpoints Verified:**
- Authentication: `/api/users/register`, `/api/users/login`
- Coins: `/api/coins`, `/api/coins/:id`, `/api/coins/:id/history`
- Transactions: `/api/transactions/buy`, `/api/transactions/sell`, `/api/transactions/user/:id`, `/api/transactions/portfolio/:id`
- Market: `/api/market/price-history`, `/api/market/stats`

✅ **Data Structures Verified:**
- User object includes: user_id, username, email, funds, created_at
- Coin object includes: coin_id, name, symbol, current_price, market_cap, circulating_supply, price_change_24h, founder
- Transaction object includes: transaction_id, user_id, coin_id, type, quantity, price, total_amount, created_at
- Portfolio object includes: coin_id, name, symbol, current_price, total_amount, total_invested

✅ **Authentication Flow Verified:**
- JWT tokens with 24-hour expiration
- Bearer token authentication
- User authorization checks
- Token storage and management requirements

## **Command Examples:**
```bash
# Authentication
coins-cli login
coins-cli register
coins-cli logout

# Market Data
coins-cli market list
coins-cli market details <coin-id>
coins-cli market history <coin-id>
coins-cli market overview

# Portfolio
coins-cli portfolio view
coins-cli portfolio summary

# Trading
coins-cli buy <coin-id> <amount>
coins-cli sell <coin-id> <amount>
coins-cli transactions

# Interactive Mode
coins-cli interactive
```

This todo list is comprehensive and accurately reflects the existing API structure. Each item is verified against the actual API endpoints, data structures, and authentication requirements found in your codebase. 