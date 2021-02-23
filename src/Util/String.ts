export class STRING{

    public static readonly LETTERS = /^[a-zA-Z]+$/;

    public static isNumber(value: string | number): boolean {
        return ((value != null) &&
            (value !== '') &&
            /^\d+$/.test(value.toString()));
    }

    public static htmlEncode(text: string, stack?: number): string {
        if (stack === undefined) stack = 0;
        text = text.replace(' ', '+');
        text = text.replace('\'', '%27');
        if ((text.includes(' ') || text.includes('\'')) && stack < 10) return this.htmlEncode(text, stack + 1);
        if ((text.includes(' ') || text.includes('\'')) && stack < 10) return this.htmlEncode(text, stack + 1);
        return text;
    }

    public static chunkSubstr(str: string, size: number): string[] {
        const numChunks = Math.ceil(str.length / size);
        const chunks = new Array<string>(numChunks);

        for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
            chunks[i] = str.substr(o, size);
        }

        return chunks;
    }
}