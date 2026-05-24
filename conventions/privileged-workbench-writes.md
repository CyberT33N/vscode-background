# Privileged Workbench Writes

## Scope

This convention defines how privileged file replacement is allowed when the target workbench file is not writable by the current user.

## Security Principle

The extension host must remain unprivileged. Elevation is only acceptable for a short-lived, one-shot write operation that replaces the already prepared workbench file on disk.

## Current Model

The current implementation writes the patched content to a temporary file without elevation and only uses elevation for the final file replacement step.

This is materially safer than running the entire extension host as administrator or root. Granting elevation for the replacement command does not mean the VS Code extension host continues to run permanently with elevated privileges.

## Remaining Risk

The remaining risk is not a permanently elevated extension host. The sensitive part is the privileged shell command that performs the final replacement.

## Hardening Direction

Future hardening should keep the same architectural boundary and narrow it further:

- keep privilege in a short-lived external helper or child process
- allowlist the exact target workbench file paths
- perform only an atomic replace operation
- exit immediately after the replace completes
- avoid broad, reusable elevated sessions

## Recommended Reference Model

The recommended model is:

1. The extension host stays unprivileged.
2. The extension prepares the full patched workbench content in a temporary file.
3. The extension launches a short-lived external replace helper process for the final privileged step only.
4. The helper validates:
   - the source temp file path
   - the destination workbench file path embedded into the helper
   - that the operation remains limited to one allowlisted workbench target for this product
5. The helper performs one replace operation and exits immediately.
6. The extension host never receives a reusable elevated session.

## Why This Model Is Preferred

This model minimizes blast radius because the privileged boundary is reduced to a single file-replacement responsibility. It also keeps the domain and application logic in the normal extension host while isolating the infrastructure concern of privileged file replacement into a narrowly scoped external execution unit.

## Child Process vs Visible Terminal

A child process or dedicated helper is the preferred architecture over a general visible terminal window. A visible terminal does not add security by itself; it mainly changes user experience. The security property that matters is that the privileged operation is:

- short-lived
- isolated from the extension host
- path-constrained
- single-purpose

If the platform requires a visible elevation prompt, that prompt should belong to the external helper execution, not to a permanently elevated editor process.

Opening a visible terminal window is not required for security. The important property is privilege separation and tight scoping of the elevated action, not whether a terminal is visible to the user.

## Implementation Reference

The privileged replace helper is implemented as a generated, short-lived helper script launched from the extension runtime. The current code path is centered around `src/background/PatchFile/PatchFile.privilegedReplace.ts` and reused by both the main workbench patch flow and the legacy CSS fallback path.

## Architectural Rule

Privileged writes must stay externalized, minimal, and tightly scoped to the workbench-file replacement operation only.
