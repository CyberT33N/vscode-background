import { randomUUID } from 'crypto';
import fs, { constants as fsConstants } from 'fs';
import { tmpdir } from 'os';
import path from 'path';

import { BACKGROUND_VER, ENCODING, VERSION } from '../../utils/constants';
import { vsc } from '../../utils/vsc';
import { replaceFileWithElevatedHelper } from './PatchFile.privilegedReplace';

export enum EFilePatchType {
    /**
     * 未修改的文件
     */
    None,
    /**
     * patch 过的旧版本文件
     */
    Legacy,
    /**
     * patch 过的新版本文件
     */
    Latest
}

/**
 * Base abstraction for patchable VS Code workbench files.
 *
 * The normal path remains an unprivileged write directly to the target file.
 * When that is not possible because the installation path is protected, the
 * class escalates only the final replace step through a short-lived external
 * helper process. This keeps the extension host itself unprivileged.
 *
 * @export
 * @abstract
 * @class AbsPatchFile
 */
export abstract class AbsPatchFile {
    constructor(private filePath: string) {}

    /**
     * 是否已经修改过
     *
     * @return {*}  {Promise<boolean>}
     * @memberof JsFile
     */
    public async hasPatched(): Promise<boolean> {
        const editType = await this.getPatchType();
        return editType !== EFilePatchType.None;
    }

    /**
     * 当前文件的修改状态
     *
     * @return {*}  {Promise<EPatchFileEditType>}
     * @memberof AbsPatchFile
     */
    public async getPatchType(): Promise<EFilePatchType> {
        const content = await this.getContent();

        // patch 过的新版本
        if (content.includes(`${BACKGROUND_VER}.${VERSION}`)) {
            return EFilePatchType.Latest;
        }

        // 包含 background.ver，patch 过的旧版本
        if (content.includes(BACKGROUND_VER)) {
            return EFilePatchType.Legacy;
        }

        return EFilePatchType.None;
    }

    protected getContent(): Promise<string> {
        return fs.promises.readFile(this.filePath, ENCODING);
    }

    /**
     * Persists patched workbench content.
     *
     * The method first attempts the smallest possible operation: a normal write
     * as the current user. If the file is not writable, it falls back to a
     * privileged replace helper that receives only the prepared temp file and is
     * limited to a single allowlisted destination file.
     */
    private async saveContentTo(filePath: string, content: string) {
        try {
            if (fs.existsSync(filePath)) {
                await fs.promises.access(filePath, fsConstants.W_OK);
            }
            await fs.promises.writeFile(filePath, content, ENCODING);
            return true;
        } catch (e: any) {
            if (!vsc) {
                return false;
            }
            // FIXME：
            // 一些系统会报错：Unable to find pkexec or kdesudo.
            // 相关 issue：https://github.com/jorangreef/sudo-prompt/pull/123
            // 测试环境： codercom/code-server:4.4.0
            // uname -a
            // Linux code-server-b6cc684df-sqx9h 5.4.0-77-generic #86-Ubuntu SMP Thu Jun 17 02:35:03 UTC 2021 x86_64 GNU/Linux
            const retry = 'Retry with Admin/Sudo';
            const result = await vsc.window.showErrorMessage(e.message, retry);
            if (result !== retry) {
                return false;
            }
            const tempFilePath = await this.writeContentToTempFile(content);
            try {
                await replaceFileWithElevatedHelper(tempFilePath, filePath, {
                    promptName: 'Background Extension'
                });
                return true;
            } catch (e: any) {
                vsc.window.showErrorMessage(e.message);
                return false;
            } finally {
                await fs.promises.rm(tempFilePath, { force: true });
            }
        }
    }

    /**
     * Writes the fully prepared target content to a temporary file before the
     * privileged replace helper is invoked.
     */
    private async writeContentToTempFile(content: string) {
        const tempFilePath = path.join(tmpdir(), `vscode-background-${VERSION}-${randomUUID()}.temp`);
        await fs.promises.writeFile(tempFilePath, content, ENCODING);
        return tempFilePath;
    }

    protected async write(content: string): Promise<boolean> {
        if (!content.trim().length) {
            return false;
        }
        return this.saveContentTo(this.filePath, content);
    }

    /**
     * 安装补丁到文件，需要包含 `${BACKGROUND_VER}.${VERSION}`
     *
     * @abstract
     * @param {string} patch
     * @return {Promise<boolean>} 是否成功修改
     * @memberof AbsPatchFile
     */
    public abstract applyPatches(patch: string): Promise<boolean>;

    /**
     * Get the clean content without patches.
     * 清理补丁，得到「干净」的源文件。
     *
     * @protected
     * @abstract
     * @param {string} content
     * @return {*}  {string}
     * @memberof AbsPatchFile
     */
    protected abstract cleanPatches(content: string): string;

    public async restore() {
        try {
            let content = await this.getContent();
            content = this.cleanPatches(content);
            return await this.write(content);
        } catch {
            return false;
        }
    }
}
