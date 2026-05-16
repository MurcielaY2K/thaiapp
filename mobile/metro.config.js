const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const engineRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// Watch the parent engine directory
config.watchFolders = [engineRoot];

// Resolve modules from both mobile and engine node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(engineRoot, 'node_modules'),
];

module.exports = config;
