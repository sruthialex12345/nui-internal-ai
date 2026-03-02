#!/usr/bin/env node

import { DevMetrics } from '../metrics/devMetrics.js';
import { resolve } from 'path';

// Get app configuration from command line args or environment
const appName = process.argv[2] || process.env.APP_NAME || 'unknown-app';
const appPath = process.argv[3] || process.cwd();
const projectRoot = process.argv[4] || resolve(appPath, '../..');

const config = {
  appName,
  appPath: resolve(appPath),
  projectRoot: resolve(projectRoot)
};

const metrics = new DevMetrics(config);

metrics.runFullAnalysis()
  .then(run => {
    metrics.printReport(run);
  })
  .catch(error => {
    console.error('❌ Metrics analysis failed:', error.message);
    process.exit(1);
  });