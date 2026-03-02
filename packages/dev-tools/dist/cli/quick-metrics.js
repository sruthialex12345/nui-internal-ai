#!/usr/bin/env node
import { QuickMetrics } from '../metrics/QuickMetrics.js';
import { resolve } from 'path';
// Get app configuration from command line args or environment
const appName = process.argv[2] || process.env.APP_NAME || 'unknown-app';
const appPath = process.argv[3] || process.cwd();
const config = {
    appName,
    appPath: resolve(appPath)
};
const quickMetrics = new QuickMetrics(config);
quickMetrics.runQuickCheck()
    .catch(error => {
    console.error('❌ Quick metrics check failed:', error.message);
    process.exit(1);
});
