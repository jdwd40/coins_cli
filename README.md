# Coins CLI

A command-line interface for the Coins API that allows you to manage cryptocurrency portfolios, view market data, and execute trades.

## Installation

### Prerequisites
- Node.js (version 16 or higher)
- npm

### Local Development Setup
1. Clone the repository
2. Navigate to the CLI directory:
   ```bash
   cd cli
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Make the CLI executable:
   ```bash
   chmod +x bin/coins-cli.js
   ```

### Global Installation (Optional)
To install the CLI globally:
```bash
npm install -g .
```

## Usage

### Basic Commands
```bash
# Show help
coins-cli --help

# Show version
coins-cli --version

# Show detailed help
coins-cli help
```

### Available Commands
- `login` - Authenticate with the API
- `register` - Create a new account
- `logout` - Clear authentication
- `market` - View market data and coin information
- `portfolio` - Manage your portfolio
- `buy` - Buy coins
- `sell` - Sell coins
- `transactions` - View transaction history
- `interactive` - Start interactive mode

### Global Options
- `--debug` - Enable debug mode
- `--verbose` - Enable verbose output
- `--help` - Show help information
- `--version` - Show version information

## Development

### Project Structure
```
cli/
├── bin/
│   └── coins-cli.js          # Main executable entry point
├── src/
│   ├── commands/             # Command implementations
│   ├── services/             # API service layer
│   ├── utils/                # Utility functions
│   └── config/               # Configuration files
├── package.json
└── README.md
```

### Running in Development
```bash
# Run directly with Node
node bin/coins-cli.js

# Or use npm script
npm start
```

## Features (Coming Soon)

- [ ] User authentication (login/register/logout)
- [ ] Market data viewing
- [ ] Portfolio management
- [ ] Buy/sell transactions
- [ ] Transaction history
- [ ] Interactive mode
- [ ] Price alerts
- [ ] Data export

## Contributing

1. Follow the existing code structure
2. Add proper error handling
3. Include user-friendly messages
4. Test your changes thoroughly

## License

MIT # coins_cli
