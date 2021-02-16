import {API} from "./Api";
import {CODEX_SONGS_URL} from "../Config/Config";
import {IField} from "./Webhook";
import {STRING} from "./String";

export interface ISong {
    id: string;
    title: string;
    page: string;
    url: string;
    text: string;
}

export class CODEX {
    private static songs: ISong[] = [];

    public static getSongs(): Promise<ISong[]> {
        if (CODEX.songs.length > 0){
            return Promise.resolve(CODEX.songs);
        }
        return API.get<ISong[]>(CODEX_SONGS_URL)
            .then(songs => CODEX.songs = songs);
    }

    public static getSongByPage(page: string): Promise<ISong[]>{
        return CODEX.getSongs()
            .then(songs => songs.filter(song => song.page === page));
    }

    public static getSongsByTitle(title: string): Promise<ISong[]>{
        title = title.trim().toLocaleLowerCase();
        return CODEX.getSongs()
            .then(songs => {
                songs = songs.filter(song => song.title.toLocaleLowerCase().includes(title));
                const song = songs.find(song => song.title.toLocaleLowerCase() === title);
                if (song !== undefined){
                    return [song];
                }
                return songs;
            });
    }

    public static getSongText(song: ISong): Promise<IField[]> {
        if (song.text.length > 0){
            const fields = this.getSongFields(song.text);
            if ((fields.length >= 25 || fields.length === 0) && song.url !== ''){
                const url = `https://studentencodex.org/lied/${song.url}`;
                return Promise.resolve([{
                    name: `Link:`,
                    value: `[${url}](${url})`
                }]);
            }
            return Promise.resolve(fields);
        }
        const url = `https://www.google.com/search?&q=${STRING.htmlEncode(song.title)}`;
        return Promise.resolve([{
            name: `Link:`,
            value: `[${url}](${url})`
        }]);
    }

    private static getSongFields(text: string): IField[]{
        let fields: IField[] = [];

        if (!text.includes('<br>')){
            fields = this.getDefaultSongFields(text);
        }

        if (fields.length === 0){
            fields = this.getBrSongFields(text);
        }
        if (fields.length === 0){
            fields = this.getAlternativeSongFields(text);
        }
        if (fields.length === 0){
            fields = this.getChunkSongFields(text);
        }

        return fields;
    }

    private static getDefaultSongFields(text: string): IField[] {
        text = this.removeBackslashR(text);
        const parts = text.split('\n\n')
            .map(part => part.trim())
            .filter(part => part !== '');

        const fields: IField[] = [];
        let i = 0;
        parts.forEach(paragraph => {
            const lines = paragraph.split('\n');
            let header = lines.shift() || '';
            let value: string;
            let isRefrein = header.toLowerCase().startsWith('refrein') || header.toLowerCase().startsWith('keerzang');
            if (!isRefrein) {
                i++;
            }
            let headerIsValid = /^\d/.test(header) || isRefrein;
            if (!headerIsValid){
                header = (i> 0)? `${i}.`: `‎`;
                value = paragraph;
            } else {
                if (lines.length > 1) {
                    value = lines.join('\n');
                } else {
                    value = lines[0];
                }
            }

            fields.push({
                name: header,
                value: value
            });

        });
        return fields;
    }

    private static getBrSongFields(text: string): IField[] {
        const parts = text.split('<br>')
            .map(part => {
                const p = part.trim();
                if (p.startsWith('>')){
                    return p.replace('>','');
                }
                return p;
            }).filter(part => part !== '');

        const headers = parts.filter(part => /^\d/.test(part) || part.toLowerCase().startsWith('refrein') || part.toLowerCase().startsWith('keerzang'));

        const fields: IField[] = [];
        let i = -1;
        let nextHeader = headers.shift() || '';
        let invalid = false;
        parts.forEach(part => {
            if (part === nextHeader){
                fields.push({
                    name: part,
                    value: ''
                });
                nextHeader = headers.shift() || '';
                i++;
            } else if (i>= 0 && fields[i]){
                fields[i].value += part + '\n';
            } else if (i < 0){
                invalid = true;
            }
        });

        fields.forEach(field => {
            if (field.name.length > 256 || field.value.length > 1024){
                invalid = true;
            }
            if (field.value === '') {
                field.value = `‎`;
            }
        });

        if (invalid) return [];
        return fields;
    }

    private static getAlternativeSongFields(text: string): IField[] {
        const parts = text.split('<br><br>')
            .map(part => {
                const p = part.trim();
                if (p.startsWith('>')){
                    return p.replace('>','');
                }
                return p;
            }).filter(part => part !== '');

        const fields: IField[] = [];
        let i = 1;
        parts.forEach(part => {
            fields.push({
                name: `${i}.`,
                value: this.replaceHtml(part)
            });
            i++;
        });

        let invalid = false;
        fields.forEach(field => {
            if (field.name.length > 256 || field.value.length > 1024){
                invalid = true;
            }
            if (field.value === '') {
                field.value = `‎`;
            }
        });

        if (invalid) return [];
        return fields;
    }

    private static getChunkSongFields(text: string): IField[] {
        const parts = STRING.chunkSubstr(text, 1024)
            .map(part => {
                const p = part.trim();
                if (p.startsWith('>')){
                    return p.replace('>','');
                }
                return p;
            }).filter(part => part !== '');

        const fields: IField[] = [];
        let i = 1;
        parts.forEach(part => {
            fields.push({
                name: `${i}.`,
                value: this.replaceHtml(part)
            });
            i++;
        });

        return fields;
    }

    private static replaceHtml(text: string): string {
        text = text.replace('<br>', '\n');
        if (text.includes('<br>')) return this.replaceHtml(text);
        return text;
    }

    private static removeBackslashR(text: string, count?: number): string {
        if (count === undefined) count = 0;
        text = text.replace('\r', '');
        if (text.includes('\r') && count < 10) text = this.removeBackslashR(text, count + 1);
        if (text.includes('\r') && count < 10) text = this.removeBackslashR(text, count + 1);
        if (text.includes('\r') && count < 10) text = this.removeBackslashR(text, count + 1);
        return text;
    }

}