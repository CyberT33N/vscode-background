# Image Source Settings

## Scope

This convention defines the allowed image source types for all background-image settings in this workspace.

## Allowed Sources

Only the following source types are allowed:

- local image files
- local folders that expand to local image files
- `file://` URIs that point to local image files
- `data:image/...;base64,...` sources

## Forbidden Sources

Internet-backed image sources are forbidden in settings, including:

- `http://...`
- `https://...`
- any other remote URI scheme that resolves outside the local machine

## Security Rationale

Remote image URLs create an outbound network surface from configuration. That introduces avoidable security and operational risk:

- unwanted outbound requests
- privacy leakage through remote fetches
- content drift because remote files can change without a local code change
- availability coupling to external hosts
- inconsistent rendering behavior across environments

For this workspace, image settings must stay local-only so the extension never needs to fetch image content from the Internet.

## Configuration Rule

All documentation, examples, and runtime validation must treat local image sources and `data:image` base64 sources as the only supported image inputs.
