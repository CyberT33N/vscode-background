import { homedir } from 'os';
import path from 'path';

import pkg from '../../package.json';

/** 版本号 */
export const VERSION: string = pkg.version;

/** 版本标识 */
export const BACKGROUND_VER = 'background.ver';

/** 文件编码 */
export const ENCODING = 'utf-8';

/** 发布者 */
export const PUBLISHER: string = pkg.publisher;

/** 扩展名 */
export const EXTENSION_NAME: string = pkg.name;

/** 扩展ID */
export const EXTENSION_ID = `${PUBLISHER}.${EXTENSION_NAME}`;

/** first-load key stored in VS Code managed state */
export const FIRST_LOAD_STATE_KEY = `${EXTENSION_ID}.firstLoadCompleted`;

function getUserStateRoot() {
    if (process.platform === 'win32') {
        return process.env.LOCALAPPDATA || process.env.APPDATA || path.join(homedir(), 'AppData', 'Local');
    }
    if (process.platform === 'darwin') {
        return path.join(homedir(), 'Library', 'Application Support');
    }
    return process.env.XDG_STATE_HOME || path.join(homedir(), '.local', 'state');
}

/** 运行期状态目录，避免把可变状态写入扩展安装产物 */
export const STATE_DIR = path.join(getUserStateRoot(), EXTENSION_ID);

/** 卸载钩子读取的运行期元数据文件，仅用于无 vscode API 的外部 hook */
export const UNINSTALL_JS_PATH_FILE = path.join(STATE_DIR, `vscb.${VERSION}.js.touch`);
