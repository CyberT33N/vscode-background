# Integrity Warning Suppression

## Scope

This convention defines the workspace policy for the VS Code integrity warning that appears after the generated workbench file is intentionally modified by this extension.

## Decision

For this workspace, the integrity warning must be suppressed after the workbench patch is applied.

## Rationale

This extension deliberately modifies a checksummed VS Code workbench file in order to add functionality that is not available through the supported VS Code extension API. Because the modification is intentional and feature-critical, the resulting integrity warning becomes expected operational noise for this product.

In this workspace, the warning is therefore treated as a deterministic side effect of an approved patching strategy, not as a useful signal for the extension's normal happy path.

## Architectural Position

Suppressing the warning does not restore file integrity and does not make the installation pristine again. It is a UX policy that prevents a known and repeated checksum-mismatch notification from distracting the user once the patch has been intentionally accepted.

The architectural justification for suppression is:

- the workbench modification is intentional
- the feature depends on that modification
- the resulting warning is expected by design once the patch is present
- the warning does not distinguish between an intentional patch and an accidental checksum drift in a way that is useful for this extension's accepted operating mode

## Implementation Rule

- Keep the actual patch surface minimal and reversible.
- Keep explicit patch markers in the generated code.
- Treat warning suppression as coupled to the approved workbench patch only.
- Do not expand warning suppression into a general claim that the VS Code installation is unmodified.
