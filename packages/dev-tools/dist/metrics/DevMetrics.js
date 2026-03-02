/**
 * Development Metrics & Benchmarks Tool
 * Tracks key performance indicators for developer experience
 */
import { execSync, spawn } from 'child_process';
import { readFileSync, writeFileSync, existsSync, statSync, readdirSync } from 'fs';
import { join } from 'path';
import { performance } from 'perf_hooks';
export class DevMetrics {
    metrics;
    config;
    thresholds;
    constructor(config) {
        this.config = {
            metricsFile: 'dev-metrics.json',
            devCommand: 'npm run dev',
            buildCommand: 'npm run build',
            typeCheckCommand: 'npx tsc --noEmit',
            lintCommand: 'npm run lint',
            ...config
        };
        this.metrics = this.loadMetrics();
        this.thresholds = {
            viteStartup: {
                excellent: 1000, // < 1s
                good: 3000, // 1-3s
                moderate: 5000 // 3-5s (> 5s = slow)
            },
            typescript: {
                excellent: 5000, // < 5s
                good: 15000, // 5-15s
                moderate: 30000 // 15-30s (> 30s = slow)
            },
            eslint: {
                excellent: 3000, // < 3s
                good: 10000, // 3-10s
                moderate: 20000 // 10-20s (> 20s = slow)
            },
            build: {
                excellent: 10000, // < 10s
                good: 30000, // 10-30s
                moderate: 60000 // 30-60s (> 60s = slow)
            }
        };
    }
    loadMetrics() {
        const metricsPath = join(this.config.projectRoot, this.config.metricsFile);
        if (existsSync(metricsPath)) {
            try {
                return JSON.parse(readFileSync(metricsPath, 'utf8'));
            }
            catch (error) {
                console.warn('⚠️  Could not parse existing metrics file, creating new one');
            }
        }
        return {
            runs: [],
            averages: {},
            trends: {},
            lastRun: null
        };
    }
    saveMetrics() {
        const metricsPath = join(this.config.projectRoot, this.config.metricsFile);
        try {
            writeFileSync(metricsPath, JSON.stringify(this.metrics, null, 2));
        }
        catch (error) {
            console.error('❌ Failed to save metrics:', error instanceof Error ? error.message : String(error));
        }
    }
    async measureViteStartup() {
        console.log('🚀 Measuring Vite startup time...');
        return new Promise((resolve) => {
            const start = performance.now();
            let resolved = false;
            const viteProcess = spawn('npm', ['run', 'dev'], {
                cwd: this.config.appPath,
                stdio: ['ignore', 'pipe', 'pipe'],
            });
            const timeout = setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    viteProcess.kill();
                    resolve(10000); // 10s timeout
                }
            }, 10000);
            viteProcess.stdout.on('data', (data) => {
                const output = data.toString();
                if (output.includes('Local:') && !resolved) {
                    resolved = true;
                    clearTimeout(timeout);
                    viteProcess.kill();
                    resolve(performance.now() - start);
                }
            });
            viteProcess.on('error', () => {
                if (!resolved) {
                    resolved = true;
                    clearTimeout(timeout);
                    resolve(10000);
                }
            });
        });
    }
    async measureTypeScript() {
        console.log('🔍 Measuring TypeScript compilation...');
        const start = performance.now();
        try {
            execSync(this.config.typeCheckCommand, {
                cwd: this.config.appPath,
                stdio: 'pipe'
            });
            return {
                time: performance.now() - start,
                success: true
            };
        }
        catch (error) {
            return {
                time: performance.now() - start,
                success: false
            };
        }
    }
    async measureESLint() {
        console.log('📋 Measuring ESLint performance...');
        const start = performance.now();
        try {
            execSync(`${this.config.lintCommand} --quiet`, {
                cwd: this.config.appPath,
                stdio: 'pipe'
            });
            return {
                time: performance.now() - start,
                success: true
            };
        }
        catch (error) {
            return {
                time: performance.now() - start,
                success: false
            };
        }
    }
    async measureBuild() {
        console.log('📦 Measuring build performance...');
        const start = performance.now();
        try {
            execSync(this.config.buildCommand, {
                cwd: this.config.appPath,
                stdio: 'pipe'
            });
            return {
                time: performance.now() - start,
                success: true
            };
        }
        catch (error) {
            return {
                time: performance.now() - start,
                success: false
            };
        }
    }
    gatherProjectStats() {
        console.log('📊 Gathering project statistics...');
        const srcPath = join(this.config.appPath, 'src');
        let tsFiles = 0;
        let totalFiles = 0;
        let linesOfCode = 0;
        let features = 0;
        const countFiles = (dir) => {
            try {
                const items = readdirSync(dir, { withFileTypes: true });
                items.forEach(item => {
                    if (item.isDirectory() && !item.name.startsWith('.')) {
                        if (item.name === 'features') {
                            const featuresPath = join(dir, item.name);
                            try {
                                features = readdirSync(featuresPath).filter(f => statSync(join(featuresPath, f)).isDirectory()).length;
                            }
                            catch (error) {
                                // Skip if can't read features directory
                            }
                        }
                        countFiles(join(dir, item.name));
                    }
                    else if (item.isFile()) {
                        totalFiles++;
                        if (item.name.endsWith('.tsx') || item.name.endsWith('.ts')) {
                            tsFiles++;
                            try {
                                const content = readFileSync(join(dir, item.name), 'utf8');
                                linesOfCode += content.split('\\n').length;
                            }
                            catch (error) {
                                // Skip files that can't be read
                            }
                        }
                    }
                });
            }
            catch (error) {
                // Skip directories that can't be read
            }
        };
        if (existsSync(srcPath)) {
            countFiles(srcPath);
        }
        // Count dependencies
        let dependencies = 0;
        try {
            const packageJsonPath = join(this.config.appPath, 'package.json');
            if (existsSync(packageJsonPath)) {
                const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
                dependencies = Object.keys(pkg.dependencies || {}).length +
                    Object.keys(pkg.devDependencies || {}).length;
            }
        }
        catch (error) {
            // Skip dependency count if package.json can't be read
        }
        return {
            totalFiles,
            tsFiles,
            linesOfCode,
            features,
            dependencies
        };
    }
    calculateAverages() {
        if (this.metrics.runs.length === 0)
            return {};
        const runs = this.metrics.runs.filter((run) => run.appName === this.config.appName);
        return {
            viteStartup: runs.reduce((sum, run) => sum + (run.viteStartup || 0), 0) / runs.length,
            typescript: runs.reduce((sum, run) => sum + (run.typescript?.time || 0), 0) / runs.length,
            eslint: runs.reduce((sum, run) => sum + (run.eslint?.time || 0), 0) / runs.length,
            build: runs.reduce((sum, run) => sum + (run.build?.time || 0), 0) / runs.length,
        };
    }
    assessPerformance(metric, value) {
        const threshold = this.thresholds[metric];
        if (value < threshold.excellent) {
            return {
                status: 'excellent',
                emoji: '🚀',
                message: 'Excellent',
                isWarning: false
            };
        }
        else if (value < threshold.good) {
            return {
                status: 'good',
                emoji: '✅',
                message: 'Good',
                isWarning: false
            };
        }
        else if (value < threshold.moderate) {
            return {
                status: 'moderate',
                emoji: '⚠️',
                message: 'Moderate - consider optimization',
                isWarning: true
            };
        }
        else {
            return {
                status: 'slow',
                emoji: '❌',
                message: 'Slow - optimization needed',
                isWarning: true
            };
        }
    }
    getRecommendations(run) {
        const recommendations = [];
        // Vite startup recommendations
        if (run.viteStartup && run.viteStartup > this.thresholds.viteStartup.moderate) {
            recommendations.push('⚡ Vite: Consider reducing dependency pre-bundling, check for large imports in entry files');
        }
        // TypeScript recommendations  
        if (run.typescript && run.typescript.time > this.thresholds.typescript.moderate) {
            recommendations.push('🔍 TypeScript: Enable incremental compilation, reduce strict checks in dev, split large files');
        }
        // ESLint recommendations
        if (run.eslint && run.eslint.time > this.thresholds.eslint.moderate) {
            recommendations.push('📋 ESLint: Reduce rules in dev, use eslint-disable for problematic areas, check for performance issues');
        }
        // Build recommendations
        if (run.build && run.build.time > this.thresholds.build.moderate) {
            recommendations.push('📦 Build: Enable code splitting, optimize bundle size, check for circular dependencies');
        }
        // Project size recommendations
        if (run.stats && run.stats.linesOfCode > 50000) {
            recommendations.push('📊 Project: Consider splitting into smaller modules, implement lazy loading');
        }
        if (run.stats && run.stats.dependencies > 100) {
            recommendations.push('📦 Dependencies: Audit unused dependencies, consider lighter alternatives');
        }
        return recommendations;
    }
    async runFullAnalysis() {
        console.log('🎯 Running Development Metrics Analysis...');
        console.log('');
        const [viteStartup, typescript, eslint, build] = await Promise.all([
            this.measureViteStartup(),
            this.measureTypeScript(),
            this.measureESLint(),
            this.measureBuild()
        ]);
        const stats = this.gatherProjectStats();
        const run = {
            timestamp: new Date().toISOString(),
            appName: this.config.appName,
            viteStartup,
            typescript,
            eslint,
            build,
            stats
        };
        // Add to metrics
        this.metrics.runs.push(run);
        this.metrics.lastRun = run;
        this.metrics.averages[this.config.appName] = this.calculateAverages();
        // Keep only last 10 runs per app
        const appRuns = this.metrics.runs.filter((r) => r.appName === this.config.appName);
        if (appRuns.length > 10) {
            this.metrics.runs = this.metrics.runs.filter((r) => r.appName !== this.config.appName).concat(appRuns.slice(-10));
        }
        this.saveMetrics();
        return run;
    }
    printReport(run) {
        const averages = this.metrics.averages[this.config.appName] || {};
        const recommendations = this.getRecommendations(run);
        let hasWarnings = false;
        console.log('');
        console.log('============================================================');
        console.log(`📊 ${this.config.appName.toUpperCase()} DEVELOPMENT METRICS REPORT`);
        console.log('============================================================');
        console.log('');
        // Vite Startup Performance
        const viteAssessment = this.assessPerformance('viteStartup', run.viteStartup || 0);
        console.log('🚀 VITE STARTUP PERFORMANCE');
        console.log(`   Startup Time: ${Math.round(run.viteStartup || 0)}ms`);
        console.log(`   Status: ${viteAssessment.emoji} ${viteAssessment.message}`);
        console.log(`   Average: ${Math.round(averages.viteStartup || 0)}ms`);
        console.log(`   Recommended: <${this.thresholds.viteStartup.excellent}ms (excellent), <${this.thresholds.viteStartup.good}ms (good)`);
        if (viteAssessment.isWarning)
            hasWarnings = true;
        console.log('');
        // TypeScript Compilation
        const tsAssessment = this.assessPerformance('typescript', run.typescript?.time || 0);
        console.log('🔍 TYPESCRIPT COMPILATION');
        console.log(`   Compilation Time: ${Math.round(run.typescript?.time || 0)}ms`);
        console.log(`   Status: ${tsAssessment.emoji} ${tsAssessment.message}`);
        console.log(`   Success: ${run.typescript?.success ? '✅' : '❌'}`);
        console.log(`   Average: ${Math.round(averages.typescript || 0)}ms`);
        console.log(`   Recommended: <${this.thresholds.typescript.excellent}ms (excellent), <${this.thresholds.typescript.good}ms (good)`);
        if (tsAssessment.isWarning)
            hasWarnings = true;
        console.log('');
        // ESLint Performance
        const eslintAssessment = this.assessPerformance('eslint', run.eslint?.time || 0);
        console.log('📋 ESLINT PERFORMANCE');
        console.log(`   Lint Time: ${Math.round(run.eslint?.time || 0)}ms`);
        console.log(`   Status: ${eslintAssessment.emoji} ${eslintAssessment.message}`);
        console.log(`   Average: ${Math.round(averages.eslint || 0)}ms`);
        console.log(`   Recommended: <${this.thresholds.eslint.excellent}ms (excellent), <${this.thresholds.eslint.good}ms (good)`);
        if (eslintAssessment.isWarning)
            hasWarnings = true;
        console.log('');
        // Build Performance  
        const buildAssessment = this.assessPerformance('build', run.build?.time || 0);
        console.log('📦 BUILD PERFORMANCE');
        console.log(`   Build Time: ${Math.round(run.build?.time || 0)}ms`);
        console.log(`   Status: ${buildAssessment.emoji} ${buildAssessment.message}`);
        console.log(`   Success: ${run.build?.success ? '✅' : '❌'}`);
        console.log(`   Recommended: <${this.thresholds.build.excellent}ms (excellent), <${this.thresholds.build.good}ms (good)`);
        if (buildAssessment.isWarning)
            hasWarnings = true;
        console.log('');
        // Project Statistics
        if (run.stats) {
            console.log('📊 PROJECT STATISTICS');
            console.log(`   Total Files: ${run.stats.totalFiles}`);
            console.log(`   TypeScript Files: ${run.stats.tsFiles}`);
            console.log(`   Lines of Code: ${run.stats.linesOfCode.toLocaleString()}`);
            console.log(`   Features: ${run.stats.features}`);
            console.log(`   Dependencies: ${run.stats.dependencies}`);
            // Project size warnings
            if (run.stats.linesOfCode > 50000) {
                console.log('   ⚠️  Large codebase detected');
            }
            if (run.stats.dependencies > 100) {
                console.log('   ⚠️  Many dependencies detected');
            }
            console.log('');
        }
        // Warnings Summary
        if (hasWarnings) {
            console.log('⚠️  PERFORMANCE WARNINGS DETECTED');
            console.log('   Consider optimization to improve development experience');
            console.log('');
        }
        // Recommendations
        if (recommendations.length > 0) {
            console.log('💡 OPTIMIZATION RECOMMENDATIONS');
            recommendations.forEach(rec => console.log(`   ${rec}`));
            console.log('');
        }
        console.log('============================================================');
        console.log(`📈 Metrics saved to ${this.config.metricsFile}`);
        console.log('============================================================');
    }
}
