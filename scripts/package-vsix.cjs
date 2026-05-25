const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const pkg = require(path.join(rootDir, 'package.json'));

const outputDir = path.join(rootDir, 'artifacts', 'vsix');
fs.mkdirSync(outputDir, { recursive: true });

function readDefaultCatalog() {
    const workspaceYaml = fs.readFileSync(path.join(rootDir, 'pnpm-workspace.yaml'), 'utf8');
    const lines = workspaceYaml.split(/\r?\n/);
    const catalog = {};
    let inCatalog = false;

    for (const line of lines) {
        if (!inCatalog) {
            if (line.trim() === 'catalog:') {
                inCatalog = true;
            }
            continue;
        }

        if (!line.trim()) {
            continue;
        }

        if (!line.startsWith('  ')) {
            break;
        }

        const match = /^  (?:(?:'([^']+)')|([^:]+)):\s*(.+)$/.exec(line);
        if (!match) {
            continue;
        }

        const key = (match[1] || match[2]).trim();
        const value = match[3].trim();
        catalog[key] = value;
    }

    return catalog;
}

function materializeCatalogSpecifiers(manifest, catalog) {
    const fields = ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies'];

    for (const field of fields) {
        const section = manifest[field];
        if (!section) {
            continue;
        }

        for (const [name, specifier] of Object.entries(section)) {
            if (specifier === 'catalog:') {
                const resolved = catalog[name];
                if (!resolved) {
                    throw new Error(`Missing catalog version for ${name}`);
                }
                section[name] = resolved;
            }
        }
    }

    return manifest;
}

function alignTypesVersionForVsce(manifest) {
    const engineRange = manifest.engines?.vscode;
    const typesSection = manifest.devDependencies;
    if (!engineRange || !typesSection?.['@types/vscode']) {
        return manifest;
    }

    const match = /(\d+\.\d+\.\d+)/.exec(engineRange);
    if (match) {
        typesSection['@types/vscode'] = match[1];
    }

    return manifest;
}

function stagePackagingWorkspace() {
    const stageDir = fs.mkdtempSync(path.join(os.tmpdir(), `${pkg.name}-vsix-`));
    const catalog = readDefaultCatalog();
    const stagedManifest = alignTypesVersionForVsce(materializeCatalogSpecifiers(structuredClone(pkg), catalog));

    delete stagedManifest.scripts;

    fs.writeFileSync(path.join(stageDir, 'package.json'), JSON.stringify(stagedManifest, null, 2) + '\n');

    const entriesToCopy = ['dist', 'docs', 'l10n', 'README.md', 'LICENSE', 'package.nls.json'];

    for (const entry of entriesToCopy) {
        const sourcePath = path.join(rootDir, entry);
        if (!fs.existsSync(sourcePath)) {
            continue;
        }

        const targetPath = path.join(stageDir, entry);
        fs.cpSync(sourcePath, targetPath, { recursive: true });
    }

    return stageDir;
}

const command = process.platform === 'win32' ? 'vsce.cmd' : 'vsce';
const outputPath = path.join(outputDir, `${pkg.name}-${pkg.version}.vsix`);
const stageDir = stagePackagingWorkspace();
let exitCode = 1;

try {
    const result = spawnSync(command, ['package', '--no-dependencies', '--out', outputPath], {
        cwd: stageDir,
        stdio: 'inherit',
        shell: process.platform === 'win32'
    });

    if (result.error) {
        throw result.error;
    }

    exitCode = result.status ?? 1;
} finally {
    fs.rmSync(stageDir, { recursive: true, force: true });
}

process.exit(exitCode);
