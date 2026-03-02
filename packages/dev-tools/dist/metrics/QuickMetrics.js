/**
 * Quick Development Metrics - Lightweight version
 * Provides instant feedback on key performance indicators
 */
import { execSync } from 'child_process';
import { performance } from 'perf_hooks';
import { existsSync, readdirSync } from 'fs';
import { join } from 'path';
export class QuickMetrics {
    config;
    constructor(config) {
        this.config = {
            typeCheckCommand: 'npx tsc --noEmit',
            lintCommand: 'npm run lint -- --quiet --format=json',
            ...config
        };
    }
    async runQuickCheck() {
        console.log(`⚡ Quick Dev Metrics Check for ${this.config.appName}...\\n`);
        const startTime = performance.now();
        // 1. TypeScript Check
        console.log('🔍 TypeScript compilation...');
        const tsStart = performance.now();
        try {
            execSync(this.config.typeCheckCommand, { cwd: this.config.appPath, stdio: 'pipe' });
            console.log(`   ✅ TypeScript: ${Math.round(performance.now() - tsStart)}ms (no errors)`);
        }
        catch (error) {
            console.log(`   ❌ TypeScript: ${Math.round(performance.now() - tsStart)}ms (has errors)`);
        }
        // 2. ESLint Check
        console.log('📋 ESLint check...');
        const eslintStart = performance.now();
        try {
            const output = execSync(this.config.lintCommand, {
                cwd: this.config.appPath,
                stdio: 'pipe'
            }).toString();
            const results = JSON.parse(output || '[]');
            const issues = results.reduce((sum, file) => sum + file.errorCount + file.warningCount, 0);
            console.log(`   ✅ ESLint: ${Math.round(performance.now() - eslintStart)}ms (${issues} issues)`);
        }
        catch (error) {
            console.log(`   ❌ ESLint: ${Math.round(performance.now() - eslintStart)}ms (check failed)`);
        }
        // 3. File Count
        const srcPath = join(this.config.appPath, 'src');
        let fileCount = 0;
        const countFiles = (dir) => {
            try {
                const items = readdirSync(dir, { withFileTypes: true });
                items.forEach(item => {
                    if (item.isDirectory() && !item.name.startsWith('.')) {
                        countFiles(join(dir, item.name));
                    }
                    else if (item.isFile() && (item.name.endsWith('.tsx') || item.name.endsWith('.ts'))) {
                        fileCount++;
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
        console.log(`📊 Project: ${fileCount} TypeScript files`);
        // 4. Dependencies
        try {
            const output = execSync('npm list --depth=0 --json', {
                cwd: this.config.appPath,
                stdio: 'pipe'
            }).toString();
            const deps = JSON.parse(output);
            const depCount = Object.keys(deps.dependencies || {}).length;
            console.log(`📦 Dependencies: ${depCount} packages`);
        }
        catch (error) {
            console.log('📦 Dependencies: Unable to count');
        }
        const totalTime = Math.round(performance.now() - startTime);
        console.log(`\\n⏱️  Total check time: ${totalTime}ms\\n`);
        // Performance thresholds and recommendations
        console.log('🎯 Performance Status:');
        if (totalTime < 5000) {
            console.log('   ✅ Excellent performance (<5s)');
        }
        else if (totalTime < 10000) {
            console.log('   ⚠️  Good performance (5-10s)');
        }
        else if (totalTime < 20000) {
            console.log('   ⚠️  Moderate performance (10-20s) - consider optimization');
        }
        else {
            console.log('   ❌ Slow performance (>20s) - optimization recommended');
        }
        console.log('\\n📊 Recommended Thresholds:');
        console.log('   • TypeScript: <5s (excellent), <15s (good), <30s (moderate)');
        console.log('   • ESLint: <3s (excellent), <10s (good), <20s (moderate)');
        console.log('   • Vite Startup: <1s (excellent), <3s (good), <5s (moderate)');
        console.log('   • Build: <10s (excellent), <30s (good), <60s (moderate)');
        console.log('\\n💡 Tips:');
        console.log('   • Run `npm run metrics` for detailed analysis with recommendations');
        console.log('   • Check startup times with dev server metrics');
        console.log('   • Monitor bundle size with build analysis\\n');
    }
}
