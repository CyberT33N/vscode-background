# Common Issues

[English](./common-issues.md)

## How it works

**This extension works by editting the vscode's js file.**

## How to get local images' address

Local images can be dragged into the browser to quickly get the file protocol address from the address bar.

## Warn `Your Code installation appears to be corrupt`

Starting from v2.0, this issue should not occur again. Regardless, you can refer to `How to uninstall` section.

## Disable/Uninstall doesn't remove background images

Refer to `How to uninstall` section.

## How to uninstall

three ways:

1. Recommended way:

   - Click the 「Background」 button on the right-bottom of statusbar, choose `Uninstall the extension`, automatically complete uninstall.

2. Disable and then uninstall:

   - Set the config `{"background.enabled": false}` in settings.json
   - Then uninstall the extension.

3. Not recommended:

   - If you uninstall this extension directly, don't worry.
   - Exit vscode `completely`, then `open` vscode.
   - `Reload` again, now it's clean.
   - ... It's a strange limit of vscode.

## read-only file system

`vscode` needs to be located in a location with write permission.

- windows:
  - Right click on `vscode` icon, choose `Run as administrator`.
- mac:
  - Move `Visual Studio Code.app` from `Download` to the `Application` directory.
  - Run `sudo chmod -R a+rw '/Applications/Visual Studio Code.app'` to grant write permissions.
- linux:
  - Run `sudo chmod -R a+rw /usr/share/code`
  - Some Arch Linux: `sudo chmod -R a+rw /opt/visual-studio-code`
  - Code Server (docker): `sudo chmod -R a+rw '/usr/lib/code-server'`
    - code-server needs to force browser refresh (avoid caching) for configuration to take effect.

## Unsupported environment

- `Installed by snap` is not supported. [#382](https://github.com/shalldie/vscode-background/issues/382)
  - Error: (Linux) snap: read-only file system
  - Snap use SquashFS to storage packages, which is a compressed readonly file system.
- `vscodium` is not fully supported.
  - It works fine in most cases. But I don't use it that much, pr welcome.

## VSCode crashes [#306](https://github.com/shalldie/vscode-background/issues/306)

Whenever there is an extreme situation where vscode crashes, you can manually fix it as follows:

1. Open the directory:
   - windows: `%LocalAppData%\Programs\Microsoft VS Code\resources\app\out\vs\workbench`
   - mac: `/Applications/Visual Studio Code.app/Contents/Resources/app/out/vs/workbench`
   - linux: `/usr/share/code/resources/app/out/vs/workbench`
     - Some Arch Linux: `/opt/visual-studio-code/resources/app/out/vs/workbench`
2. Edit `workbench.desktop.main.js`, remove the content at the end: `// vscode-background-start...// vscode-background-end`.

## Prefer v1 default images?

If you want to keep using the default images from v1, download them locally first and reference them from your machine or convert them into `data:image` sources.

```json
{
  "background.editor": {
    "images": [
      "C:/Users/name/Pictures/v1-background-1.png",
      "C:/Users/name/Pictures/v1-background-2.png",
      "data:image/png;base64,<base64-data>"
    ]
  }
}
```
