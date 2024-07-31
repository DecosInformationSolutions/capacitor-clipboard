import { WebPlugin } from '@capacitor/core';
export class ClipboardWeb extends WebPlugin {
    async write(options) {
        if (typeof navigator === 'undefined' || !navigator.clipboard) {
            throw this.unavailable('Clipboard API not available in this browser');
        }
        if (options.string !== undefined) {
            await this.writeText(options.string);
        }
        else if (options.url) {
            await this.writeText(options.url);
        }
        else if (options.image) {
            if (typeof ClipboardItem !== 'undefined') {
                try {
                    const blob = await (await fetch(options.image)).blob();
                    const clipboardItemInput = new ClipboardItem({ [blob.type]: blob });
                    await navigator.clipboard.write([clipboardItemInput]);
                }
                catch (err) {
                    throw new Error('Failed to write image');
                }
            }
            else {
                throw this.unavailable('Writing images to the clipboard is not supported in this browser');
            }
        }
        else {
            throw new Error('Nothing to write');
        }
    }
    async read() {
        if (typeof navigator === 'undefined' || !navigator.clipboard) {
            throw this.unavailable('Clipboard API not available in this browser');
        }
        if (typeof ClipboardItem !== 'undefined') {
            try {
                const clipboardItems = await navigator.clipboard.read();
                const type = clipboardItems[0].types[0];
                const clipboardBlob = await clipboardItems[0].getType(type);
                const data = await this._getBlobData(clipboardBlob, type);
                return { value: data, type };
            }
            catch (err) {
                return this.readText();
            }
        }
        else {
            return this.readText();
        }
    }
    async readText() {
        if (typeof navigator === 'undefined' ||
            !navigator.clipboard ||
            !navigator.clipboard.readText) {
            throw this.unavailable('Reading from clipboard not supported in this browser');
        }
        const text = await navigator.clipboard.readText();
        return { value: text, type: 'text/plain' };
    }
    async writeText(text) {
        if (typeof navigator === 'undefined' ||
            !navigator.clipboard ||
            !navigator.clipboard.writeText) {
            throw this.unavailable('Writting to clipboard not supported in this browser');
        }
        await navigator.clipboard.writeText(text);
    }
    _getBlobData(clipboardBlob, type) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            if (type.includes('image')) {
                reader.readAsDataURL(clipboardBlob);
            }
            else {
                reader.readAsText(clipboardBlob);
            }
            reader.onloadend = () => {
                const r = reader.result;
                resolve(r);
            };
            reader.onerror = e => {
                reject(e);
            };
        });
    }
}
//# sourceMappingURL=web.js.map