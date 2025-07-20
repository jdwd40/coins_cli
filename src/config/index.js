const Conf = require('conf');

// Create configuration instance
const config = new Conf({
  projectName: 'coins-cli'
});

// Set default values if they don't exist
if (!config.has('api.baseUrl')) {
  config.set('api.baseUrl', 'https://jdwd40.com/api-2');
} else {
  // Update existing config to use VPS URL
  config.set('api.baseUrl', 'https://jdwd40.com/api-2');
}
if (!config.has('api.timeout')) {
  config.set('api.timeout', 10000);
}
if (!config.has('user.token')) {
  config.set('user.token', null);
}
if (!config.has('user.userId')) {
  config.set('user.userId', null);
}
if (!config.has('user.username')) {
  config.set('user.username', null);
}
if (!config.has('preferences.currency')) {
  config.set('preferences.currency', 'GBP');
}
if (!config.has('preferences.theme')) {
  config.set('preferences.theme', 'default');
}
if (!config.has('preferences.autoRefresh')) {
  config.set('preferences.autoRefresh', false);
}

module.exports = config; 