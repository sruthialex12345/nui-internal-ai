/**
 * Quick Development Metrics - Lightweight version
 * Provides instant feedback on key performance indicators
 */
export interface QuickMetricsConfig {
    appName: string;
    appPath: string;
    typeCheckCommand?: string;
    lintCommand?: string;
}
export declare class QuickMetrics {
    private config;
    constructor(config: QuickMetricsConfig);
    runQuickCheck(): Promise<void>;
}
//# sourceMappingURL=quickMetrics.d.ts.map