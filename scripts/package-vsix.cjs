const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const pkg = require(path.join(rootDir, 'package.json'));

const outputDir = path.join(rootDir, 'artifacts', 'vsix');
fs.mkdirSync(outputDir, { recursive: true });

const command = process.platform === 'win32' ? 'vsce.cmd' : 'vsce';
const outputPath = path.join(outputDir, `${pkg.name}-${pkg.version}.vsix`);

const result = spawnSync(command, ['package', '--no-dependencies', '--out', outputPath], {
    cwd: rootDir,
    stdio: 'inherit',
    shell: process.platform === 'win32'
});

if (result.error) {
    throw result.error;
}

process.exit(result.status ?? 1);
