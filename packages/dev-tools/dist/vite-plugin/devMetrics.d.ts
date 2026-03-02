/**
 * Vite Development Metrics Plugin
 * Tracks and displays development server performance metrics
 */
import type { Plugin } from 'vite';
export interface DevMetricsOptions {
    enabled?: boolean;
    showStartupTime?: boolean;
    showBuildInfo?: boolean;
    trackHMR?: boolean;
    appName?: string;
}
export declare function devMetricsPlugin(options?: DevMetricsOptions): Plugin;
//# sourceMappingURL=devMetrics.d.ts.map