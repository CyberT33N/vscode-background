# VSCode Workbench Patching

## Scope

This convention defines the architectural rule for how this extension applies background images to native VS Code workbench surfaces.

## Decision

This extension is allowed to patch the generated VS Code workbench file because the supported VS Code extension API does not provide a native way to set arbitrary background images on built-in workbench surfaces such as the editor, side bar, auxiliary bar, panel, or integrated terminal area.

## What the VS Code Extension API supports

The supported API surface allows:

- theme colors through `workbench.colorCustomizations`
- custom tree views and activity bar contributions
- status bar contributions
- webviews for custom HTML/CSS/JS user interfaces

These supported APIs are sufficient for color theming and custom extension-owned surfaces, but not for arbitrary background images on built-in VS Code workbench DOM surfaces.

## What the VS Code Extension API does not support

The supported API does not provide:

- direct DOM access to the VS Code workbench
- extension-provided custom stylesheets for built-in workbench DOM
- a stable API to inject arbitrary background-image CSS into native side bar, editor, auxiliary bar, panel, or terminal surfaces

Because of this limitation, retaining the current product behavior requires modifying the generated workbench bundle.

## Integrity Warning Implication

VS Code checks the integrity of shipped application files by comparing expected checksums with the files that exist on disk. When a checksummed workbench file is modified, an integrity warning is an expected by-design consequence of the checksum mismatch.

This warning is not, by itself, evidence that the patch was syntactically wrong. A correctly applied patch still changes the bytes of the shipped file and can therefore trigger the same warning.

## Architectural Consequence

There is no supported path that keeps all current native background-image functionality and simultaneously guarantees a pristine integrity result while modifying a checksummed workbench file. For this extension, workbench patching is therefore a deliberate compatibility strategy rather than a supported VS Code theming API.

## Implementation Rules

- Patch only the minimum required workbench target file.
- Keep the patch idempotent and reversible.
- Delimit generated code with explicit patch markers.
- Treat any integrity-warning suppression strictly as a UX mitigation, not as proof that the installation is unmodified.
- Do not expand the patch surface beyond the files that are required for the feature.
