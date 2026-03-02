/**
 * Development Metrics & Benchmarks Tool
 * Tracks key performance indicators for developer experience
 */
export interface MetricsConfig {
    appName: string;
    appPath: string;
    projectRoot: string;
    metricsFile?: string;
    devCommand?: string;
    buildCommand?: string;
    typeCheckCommand?: string;
    lintCommand?: string;
}
export interface PerformanceThresholds {
    viteStartup: {
        excellent: number;
        good: number;
        moderate: number;
    };
    typescript: {
        excellent: number;
        good: number;
        moderate: number;
    };
    eslint: {
        excellent: number;
        good: number;
        moderate: number;
    };
    build: {
        excellent: number;
        good: number;
        moderate: number;
    };
}
export interface MetricsRun {
    timestamp: string;
    appName: string;
    viteStartup?: number;
    typescript?: {
        time: number;
        success: boolean;
    };
    eslint?: {
        time: number;
        success: boolean;
    };
    build?: {
        time: number;
        success: boolean;
    };
    stats?: {
        totalFiles: number;
        tsFiles: number;
        linesOfCode: number;
        features: number;
        dependencies: number;
    };
}
export declare class DevMetrics {
    private metrics;
    private config;
    private thresholds;
    constructor(config: MetricsConfig);
    private loadMetrics;
    private saveMetrics;
    measureViteStartup(): Promise<number>;
    measureTypeScript(): Promise<{
        time: number;
        success: boolean;
    }>;
    measureESLint(): Promise<{
        time: number;
        success: boolean;
    }>;
    measureBuild(): Promise<{
        time: number;
        success: boolean;
    }>;
    gatherProjectStats(): {
        totalFiles: number;
        tsFiles: number;
        linesOfCode: number;
        features: number;
        dependencies: number;
    };
    calculateAverages(): {
        viteStartup?: undefined;
        typescript?: undefined;
        eslint?: undefined;
        build?: undefined;
    } | {
        viteStartup: number;
        typescript: number;
        eslint: number;
        build: number;
    };
    private assessPerformance;
    private getRecommendations;
    runFullAnalysis(): Promise<MetricsRun>;
    printReport(run: MetricsRun): void;
}
//# sourceMappingURL=devMetrics.d.ts.map