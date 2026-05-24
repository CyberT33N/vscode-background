import { randomUUID } from 'crypto';
import fs from 'fs';
import { tmpdir } from 'os';
import path from 'path';

import { _ } from '../../utils';
import { ENCODING } from '../../utils/constants';

/**
 * Options for the short-lived privileged replace helper.
 *
 * The helper is intentionally modeled as a single-purpose infrastructure
 * adapter: it receives already prepared content through a temp file and is only
 * responsible for the final privileged file replacement step.
 */
type TPrivilegedReplaceOptions = {
    /**
     * Display name shown by the elevation prompt for the short-lived helper process.
     */
    promptName: string;
};

/**
 * Escapes a string for use inside a PowerShell single-quoted literal.
 */
function escapePowerShellLiteral(value: string) {
    return value.replace(/'/g, "''");
}

/**
 * Quotes a shell argument for POSIX shells.
 */
function quotePosixArgument(value: string) {
    return `'${value.replace(/'/g, `'\"'\"'`)}'`;
}

/**
 * Quotes a shell argument for PowerShell.
 */
function quotePowerShellArgument(value: string) {
    return `'${escapePowerShellLiteral(value)}'`;
}

/**
 * Builds the short-lived Windows helper script that performs the privileged
 * replace operation for exactly one allowlisted workbench target.
 *
 * The target path is embedded into the script so the elevated process cannot be
 * redirected to an arbitrary destination through command arguments.
 */
function createWindowsHelperScript(targetFilePath: string) {
    const escapedTargetFilePath = escapePowerShellLiteral(targetFilePath);

    return `
param(
    [Parameter(Mandatory = $true)]
    [string]$SourceFilePath
)

$ErrorActionPreference = 'Stop'
$targetFilePath = '${escapedTargetFilePath}'
$sourceFilePath = [System.IO.Path]::GetFullPath($SourceFilePath)
$targetFilePath = [System.IO.Path]::GetFullPath($targetFilePath)
$targetDirectoryPath = Split-Path -Parent $targetFilePath

if (-not (Test-Path -LiteralPath $sourceFilePath -PathType Leaf)) {
    throw 'Privileged replace source file does not exist.'
}

if (-not (Test-Path -LiteralPath $targetDirectoryPath -PathType Container)) {
    throw 'Privileged replace target directory does not exist.'
}

$token = [guid]::NewGuid().ToString('N')
$targetFileName = [System.IO.Path]::GetFileName($targetFilePath)
$stagingFilePath = Join-Path $targetDirectoryPath ($targetFileName + '.vscode-background.' + $token + '.staging')
$backupFilePath = Join-Path $targetDirectoryPath ($targetFileName + '.vscode-background.' + $token + '.backup')
$targetWasPresent = Test-Path -LiteralPath $targetFilePath -PathType Leaf

Copy-Item -LiteralPath $sourceFilePath -Destination $stagingFilePath -Force

try {
    if ($targetWasPresent) {
        Move-Item -LiteralPath $targetFilePath -Destination $backupFilePath -Force
    }

    Move-Item -LiteralPath $stagingFilePath -Destination $targetFilePath -Force

    if ($targetWasPresent -and (Test-Path -LiteralPath $backupFilePath -PathType Leaf)) {
        Remove-Item -LiteralPath $backupFilePath -Force
    }
} catch {
    if (Test-Path -LiteralPath $stagingFilePath -PathType Leaf) {
        Remove-Item -LiteralPath $stagingFilePath -Force
    }

    if ($targetWasPresent -and (Test-Path -LiteralPath $backupFilePath -PathType Leaf) -and -not (Test-Path -LiteralPath $targetFilePath -PathType Leaf)) {
        Move-Item -LiteralPath $backupFilePath -Destination $targetFilePath -Force
    }

    throw
}
`.trim();
}

/**
 * Builds the short-lived POSIX helper script that performs the privileged
 * replace operation for exactly one allowlisted workbench target.
 *
 * Like the Windows helper, the destination path is baked into the helper so the
 * elevated execution unit remains single-purpose.
 */
function createPosixHelperScript(targetFilePath: string) {
    const escapedTargetFilePath = targetFilePath.replace(/'/g, `'\"'\"'`);

    return `#!/bin/sh
set -eu

source_file_path="$1"
target_file_path='${escapedTargetFilePath}'
target_directory_path=$(dirname "$target_file_path")
target_file_name=$(basename "$target_file_path")
token="$(date +%s).$$"
staging_file_path="$target_directory_path/$target_file_name.vscode-background.$token.staging"
backup_file_path="$target_directory_path/$target_file_name.vscode-background.$token.backup"
target_was_present=0

if [ ! -f "$source_file_path" ]; then
    echo "Privileged replace source file does not exist." >&2
    exit 1
fi

if [ ! -d "$target_directory_path" ]; then
    echo "Privileged replace target directory does not exist." >&2
    exit 1
fi

cp "$source_file_path" "$staging_file_path"

cleanup_failed_replace() {
    rm -f "$staging_file_path"

    if [ "$target_was_present" -eq 1 ] && [ -f "$backup_file_path" ] && [ ! -f "$target_file_path" ]; then
        mv -f "$backup_file_path" "$target_file_path"
    fi
}

if [ -f "$target_file_path" ]; then
    mv -f "$target_file_path" "$backup_file_path"
    target_was_present=1
fi

if ! mv -f "$staging_file_path" "$target_file_path"; then
    cleanup_failed_replace
    exit 1
fi

if [ "$target_was_present" -eq 1 ] && [ -f "$backup_file_path" ]; then
    rm -f "$backup_file_path"
fi
`;
}

/**
 * Writes a short-lived helper script to the system temp directory.
 *
 * The helper contains the exact target path that may be replaced and is deleted
 * immediately after execution to minimize persistence of privileged tooling.
 */
async function writePrivilegedReplaceHelperScript(targetFilePath: string) {
    const fileExtension = process.platform === 'win32' ? 'ps1' : 'sh';
    const helperFilePath = path.join(tmpdir(), `vscode-background-replace-${randomUUID()}.${fileExtension}`);
    const scriptContent =
        process.platform === 'win32' ? createWindowsHelperScript(targetFilePath) : createPosixHelperScript(targetFilePath);

    await fs.promises.writeFile(helperFilePath, scriptContent, ENCODING);

    if (process.platform !== 'win32') {
        await fs.promises.chmod(helperFilePath, 0o700);
    }

    return helperFilePath;
}

/**
 * Builds the exact command that executes the short-lived helper in a separate,
 * elevated process.
 *
 * The elevated process receives only the helper path and the prepared temp file
 * path. The real destination file path is embedded into the helper itself so
 * the privileged surface stays single-purpose and tightly constrained.
 */
function buildPrivilegedReplaceCommand(helperFilePath: string, sourceFilePath: string) {
    if (process.platform === 'win32') {
        return [
            'powershell.exe',
            '-NoProfile',
            '-NonInteractive',
            '-ExecutionPolicy',
            'Bypass',
            '-File',
            quotePowerShellArgument(helperFilePath),
            quotePowerShellArgument(sourceFilePath)
        ].join(' ');
    }

    return ['/bin/sh', quotePosixArgument(helperFilePath), quotePosixArgument(sourceFilePath)].join(' ');
}

/**
 * Executes the privileged replace step as a short-lived external helper process.
 *
 * Architecturally this keeps the extension host unprivileged and narrows the
 * privileged responsibility to one replace operation against one allowlisted
 * workbench target file.
 */
export async function replaceFileWithElevatedHelper(
    sourceFilePath: string,
    targetFilePath: string,
    options: TPrivilegedReplaceOptions
) {
    const helperFilePath = await writePrivilegedReplaceHelperScript(targetFilePath);

    try {
        const command = buildPrivilegedReplaceCommand(helperFilePath, sourceFilePath);
        await _.sudoExec(command, { name: options.promptName });
    } finally {
        await fs.promises.rm(helperFilePath, { force: true });
    }
}
