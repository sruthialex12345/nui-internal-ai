/**
 * Vite Development Metrics Plugin
 * Tracks and displays development server performance metrics
 */

import type { Plugin } from 'vite';
import { performance } from 'perf_hooks';

export interface DevMetricsOptions {
  enabled?: boolean;
  showStartupTime?: boolean;
  showBuildInfo?: boolean;
  trackHMR?: boolean;
  appName?: string;
}

export function devMetricsPlugin(options: DevMetricsOptions = {}): Plugin {
  const {
    enabled = true,
    showStartupTime = true,
    showBuildInfo = true,
    trackHMR = true,
    appName = 'App'
  } = options;

  if (!enabled) return { name: 'dev-metrics', apply: 'serve' };

  let serverStartTime: number;
  let hmrCount = 0;
  let lastHMRTime = 0;

  return {
    name: 'dev-metrics',
    apply: 'serve',

    configureServer(server) {
      serverStartTime = performance.now();

      // Track server ready time
      server.httpServer?.once('listening', () => {
        const startupTime = performance.now() - serverStartTime;
        
        if (showStartupTime) {
          setTimeout(() => {
            console.log('');
            console.log(`📊 ${appName.toUpperCase()} DEV METRICS:`);
            console.log(`🚀 Startup Time: ${Math.round(startupTime)}ms`);
            
            // Performance assessment with thresholds
            if (startupTime < 1000) {
              console.log('⚡ Status: Excellent (<1s)');
            } else if (startupTime < 3000) {
              console.log('✅ Status: Good (1-3s)');
            } else if (startupTime < 5000) {
              console.log('⚠️  Status: Moderate (3-5s) - Consider optimization');
            } else {
              console.log('❌ Status: Slow (>5s) - Optimization needed');
              console.log('💡 Recommended: Reduce dependencies, check import sizes');
            }
            
            console.log('');
          }, 100);
        }
      });

      // Track HMR updates
      if (trackHMR) {
        server.ws.on('send', (data) => {
          if (data.type === 'update') {
            hmrCount++;
            const now = Date.now();
            
            if (now - lastHMRTime > 1000) { // Don't spam, show every second max
              console.log(`🔄 [${appName}] HMR Update #${hmrCount} - ${new Date().toLocaleTimeString()}`);
              lastHMRTime = now;
            }
          }
        });
      }
    },

    buildStart() {
      if (showBuildInfo) {
        console.log(`🏗️  [${appName}] Build started...`);
      }
    },

    buildEnd() {
      if (showBuildInfo) {
        console.log(`✅ [${appName}] Build completed`);
      }
    }
  };
}