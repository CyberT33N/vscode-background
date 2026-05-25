const esbuild = require('esbuild');

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

const esbuildProblemMatcherPlugin = {
    name: 'esbuild-problem-matcher',
    setup(build) {
        build.onStart(() => {
            if (watch) {
                console.log('[watch] build started');
            }
        });
        build.onEnd(result => {
            result.errors.forEach(({ text, location }) => {
                console.error(`✘ [ERROR] ${text}`);
                if (!location) {
                    return;
                }
                console.error(`    ${location.file}:${location.line}:${location.column}:`);
            });
            if (watch) {
                console.log('[watch] build finished');
            }
        });
    }
};

async function main() {
    const ctx = await esbuild.context({
        entryPoints: {
            extension: 'src/extension.ts',
            uninstall: 'src/uninstall.ts'
        },
        bundle: true,
        format: 'cjs',
        minify: production,
        sourcemap: !production,
        sourcesContent: false,
        platform: 'node',
        target: 'node20',
        outdir: 'dist',
        external: ['vscode'],
        logLevel: 'warning',
        plugins: [esbuildProblemMatcherPlugin]
    });

    if (watch) {
        await ctx.watch();
        return;
    }

    await ctx.rebuild();
    await ctx.dispose();
}

main().catch(error => {
    console.error(error);
    process.exit(1);
});
