/* eslint-disable @typescript-eslint/no-var-requires */
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

// Create the default Expo Metro config
const config = getDefaultConfig(projectRoot);

// Watch all files within the monorepo to support @bukoo/* packages
config.watchFolders = [workspaceRoot];

// Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Allow .txt files to be bundled as raw assets (used for epub.min.txt)
config.resolver.assetExts = [...(config.resolver.assetExts || []), 'txt'];

module.exports = config;
