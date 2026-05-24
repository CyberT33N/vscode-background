<div align="center">

<h1><b>vscode-background</b></h1>

### Bring background images to your [Visual Studio Code](https://code.visualstudio.com)

`fullscreen`、`editor`、`sidebar`、`auxiliarybar`、`panel`、`carousel`、`custom images/styles`...

[GitHub](https://github.com/shalldie/vscode-background) | [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=shalldie.background)

[![Version](https://img.shields.io/visual-studio-marketplace/v/shalldie.background?logo=visualstudiocode&style=flat-square)](https://marketplace.visualstudio.com/items?itemName=shalldie.background)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/shalldie.background?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=shalldie.background)
[![Ratings](https://img.shields.io/visual-studio-marketplace/r/shalldie.background?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=shalldie.background)
[![Stars](https://img.shields.io/github/stars/shalldie/vscode-background?logo=github&style=flat-square)](https://github.com/shalldie/vscode-background)
[![Build Status](https://img.shields.io/github/actions/workflow/status/shalldie/vscode-background/ci.yml?branch=master&label=build&style=flat-square)](https://github.com/shalldie/vscode-background/actions)
[![License](https://img.shields.io/github/license/shalldie/vscode-background?style=flat-square)](https://github.com/shalldie/vscode-background)

</div>

## Installation

There are 2 ways to install this extension:

1. Install from [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=shalldie.background).
2. Search `shalldie.background` from vscode.

## Custom

User defined requirements can be met by changing the configuration(`settings.json`).

[what's `settings.json`](https://code.visualstudio.com/docs/getstarted/settings#_settingsjson) | [where?](https://github.com/shalldie/vscode-background/issues/274)

## Config

### Global Config

| Name                 |   Type    | Default | Description                             |
| :------------------- | :-------: | :-----: | :-------------------------------------- |
| `background.enabled` | `Boolean` | `true`  | Whether to enable background extension. |

### Editor Section Config

Edit `background.editor` to config editor section.

| Name       |    Type    |   Default    | Description                                                          |
| :--------- | :--------: | :----------: | :------------------------------------------------------------------- |
| `useFront` | `boolean`  |    `true`    | Place the image above or below the code.                             |
| `style`    |  `object`  |     `{}`     | Custom style for images. [MDN Reference][mdn-css]                    |
| `styles`   | `object[]` | `[{},{},{}]` | Each style of editor section image.                                  |
| `images`   | `string[]` |     `[]`     | Custom images, supports local images, local folders, and `data:image` sources. |
| `interval` |  `number`  |     `0`      | Seconds of interval for carousel, default `0` to disabled.           |
| `random`   | `boolean`  |   `false`    | Whether to randomly display images.                                  |

[mdn-css]: https://developer.mozilla.org/docs/Web/CSS

example:

```json
{
  "background.editor": {
    "useFront": true,
    "style": {
      "background-position": "100% 100%",
      "background-size": "auto",
      "opacity": 0.6
    },
    "styles": [{}, {}, {}],
    // `images` supports local images, local folders, and data URLs.
    "images": [
      // local images
      "file:///local/path/img.jpeg",
      "/home/xie/downloads/img.gif",
      "C:/Users/xie/img.bmp",
      "D:\\downloads\\images\\img.webp",
      // local folders
      "/home/xie/images",
      // data URL (image only)
      "data:image/png;base64,<base64-data>"
    ],
    "interval": 0,
    "random": false
  }
}
```

### Fullscreen、Sidebar、Auxiliarybar、Panel Section Config

Edit `background.fullscreen`、`background.sidebar`、`background.auxiliarybar`、`background.panel` to config these sections.

| Name       |    Type    | Default  | Description                                                                              |
| :--------- | :--------: | :------: | :--------------------------------------------------------------------------------------- |
| `images`   | `string[]` |   `[]`   | Custom images, supports local images, local folders, and `data:image` sources.           |
| `opacity`  |  `number`  |  `0.1`   | Opacity of the images, alias to [opacity][mdn-opacity], `0.1 ~ 0.3` recommended.         |
| `size`     |  `string`  | `cover`  | Alias to [background-size][mdn-background-size], `cover` to self-adaption (recommended). |
| `position` |  `string`  | `center` | Alias to [background-position][mdn-background-position], default `center`.               |
| `interval` |  `number`  |   `0`    | Seconds of interval for carousel, default `0` to disabled.                               |
| `random`   | `boolean`  | `false`  | Whether to randomly display images.                                                      |

[mdn-opacity]: https://developer.mozilla.org/docs/Web/CSS/opacity
[mdn-background-size]: https://developer.mozilla.org/docs/Web/CSS/background-size
[mdn-background-position]: https://developer.mozilla.org/docs/Web/CSS/background-position

example：

```json
{
  "background.fullscreen": {
    // `images` supports local images, local folders, and data URLs.
    "images": [
      // local images
      "file:///local/path/img.jpeg",
      "/home/xie/downloads/img.gif",
      "C:/Users/xie/img.bmp",
      "D:\\downloads\\images\\img.webp",
      // local folders
      "/home/xie/images",
      // data URL (image only)
      "data:image/png;base64,<base64-data>"
    ],
    "opacity": 0.1,
    "size": "cover",
    "position": "center",
    "interval": 0,
    "random": false
  },
  // `sidebar` and `panel` have the same config as `fullscreen`
  "background.sidebar": {},
  "background.panel": {}
}
```

## Quick Command

Click the 「Background」 button on the right-bottom of statusbar, all commands of `background` will appear:

## Common Issues

> **This extension works by editting the vscode's js file.**

Please refer to the [Common Issues](docs/common-issues.md) if you met some problems.

## Uninstall

Please refer to [Common Issues#how-to-uninstall](docs/common-issues.md#how-to-uninstall).

## Contributing Guide

Contributing guide content is not included in this workspace snapshot.

## Change Log

You can checkout all our changes in our [CHANGELOG](https://github.com/shalldie/vscode-background/blob/master/CHANGELOG.md).

## Share Your Images

Keep shared images as local files or convert them into `data:image` sources before using them in settings.

## Migration from v1

The configuration of v1 is outdated and currently maintains a certain level of compatibility. Please refer to [migration-from-v1.md](docs/migration-from-v1.md) for migration.

## LICENSE

MIT
