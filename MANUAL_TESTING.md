# Manual Testing Guide for Coins CLI

This guide shows you how to manually test the CLI functionality we've built so far.

## 🚀 Quick Start Testing

### 1. Basic CLI Commands

```bash
# Test help command
node bin/coins-cli.js --help

# Test version command
node bin/coins-cli.js --version

# Test detailed help
node bin/coins-cli.js help
```

### 2. Test Configuration System

```bash
# Test configuration reading
node -e "
const config = require('./src/config');
console.log('API Base URL:', config.get('api.baseUrl'));
console.log('API Timeout:', config.get('api.timeout'));
console.log('User Token:', config.get('user.token'));
"

# Test configuration writing
node -e "
const config = require('./src/config');
config.set('test.key', 'test-value');
console.log('Set value:', config.get('test.key'));
config.delete('test.key');
console.log('Deleted value:', config.get('test.key'));
"
```

### 3. Test Display Utilities

```bash
# Test colored output and formatting
node -e "
const display = require('./src/utils/display');
display.success('This is a success message');
display.error('This is an error message');
display.warning('This is a warning message');
display.info('This is an info message');
console.log('Currency:', display.formatCurrency(1234.56));
console.log('Percentage:', display.formatPercentage(5.25));
console.log('Negative percentage:', display.formatPercentage(-3.75));
"
```

### 4. Test API Service Structure

```bash
# Test API service methods exist
node -e "
const api = require('./src/services/api');
const methods = ['register', 'login', 'getCoins', 'getCoin', 'getCoinHistory', 'getMarketHistory', 'getMarketStats', 'buyCoin', 'sellCoin', 'getUserTransactions', 'getPortfolio', 'setBaseUrl'];
methods.forEach(method => {
  console.log(\`\${method}: \${typeof api[method] === 'function' ? '✅' : '❌'}\`);
});
"
```

### 5. Test Authentication Commands Structure

```bash
# Test auth command methods exist
node -e "
const auth = require('./src/commands/auth');
const methods = ['register', 'login', 'logout', 'isAuthenticated', 'getCurrentUser'];
methods.forEach(method => {
  console.log(\`\${method}: \${typeof auth[method] === 'function' ? '✅' : '❌'}\`);
});
"
```

## 🔧 Interactive Testing

### Test Login Command (without API server)

```bash
# This will show the interactive prompts but fail due to no API server
# Press Ctrl+C to cancel after seeing the prompts
node bin/coins-cli.js login
```

### Test Register Command (without API server)

```bash
# This will show the interactive prompts but fail due to no API server
# Press Ctrl+C to cancel after seeing the prompts
node bin/coins-cli.js register
```

### Test Logout Command

```bash
# This will work even without API server
node bin/coins-cli.js logout
# Answer "Y" when prompted to confirm logout
```

## 🎨 Visual Testing

### Test Table Creation

```bash
# Test coin table creation
node -e "
const display = require('./src/utils/display');
const table = display.createCoinTable();
table.push([1, 'Bitcoin', 'BTC', '£45,000', '£850B', '+2.5%']);
table.push([2, 'Ethereum', 'ETH', '£3,200', '£380B', '-1.2%']);
console.log(table.toString());
"

# Test portfolio table creation
node -e "
const display = require('./src/utils/display');
const table = display.createPortfolioTable();
table.push(['Bitcoin', 'BTC', '0.5', '£45,000', '£22,500', '+£2,500']);
table.push(['Ethereum', 'ETH', '2.0', '£3,200', '£6,400', '-£800']);
console.log(table.toString());
"
```

## 🧪 Automated Testing

Run the comprehensive test suite:

```bash
node test-cli.js
```

This will test:
- ✅ Basic CLI functionality
- ✅ Version command
- ✅ Configuration system
- ✅ Display utilities
- ✅ API service structure
- ✅ Authentication commands structure
- ✅ Interactive mode simulation

## 🔍 What Each Test Verifies

### 1. Basic CLI Functionality
- Commander.js is working
- Help command displays correctly
- Command structure is in place

### 2. Version Command
- Version is displayed correctly (1.0.0)
- Global options work

### 3. Configuration System
- Default values are set correctly
- Configuration can be read/written
- Persistence works

### 4. Display Utilities
- Colors work (success, error, warning, info)
- Currency formatting works
- Percentage formatting works
- Tables can be created

### 5. API Service Structure
- All required API methods exist
- Service is properly structured
- Ready for API integration

### 6. Authentication Commands Structure
- All auth methods exist
- Commands are properly structured
- Ready for API integration

### 7. Interactive Mode Simulation
- CLI can handle user input
- Prompts work correctly
- Error handling works

## 🚀 Next Steps After Testing

Once all tests pass:

1. **Start your API server** (if you have one running)
2. **Test with real API endpoints** by running:
   ```bash
   node bin/coins-cli.js login
   ```
3. **Implement Phase 2** - Authentication System
4. **Add more commands** - Market data, portfolio, trading

## 🐛 Troubleshooting

If tests fail:

1. **Check dependencies**: `npm list`
2. **Reinstall dependencies**: `npm install`
3. **Check file permissions**: `ls -la bin/coins-cli.js`
4. **Check Node.js version**: `node --version` (should be >=16)

## 📝 Notes

- The CLI is designed to work without an API server for testing
- Authentication commands will fail gracefully when no API is available
- All configuration is stored locally and persists between sessions
- The test suite covers all major functionality without requiring external services 