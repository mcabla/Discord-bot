import {API} from "./Api";
import {CODEX_SONGS_URL} from "../Config/Config";
import cheerioModule from "cheerio";
import {IField} from "./Webhook";

interface ISongs {
    value: ISongServer[]
}

interface ISongServer {
    Id: string;
    Title: string;
    Page: string;
    FriendlyUrl: string;
}

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
        return API.get<ISongs>(CODEX_SONGS_URL)
            .then(songs => songs.value.map<ISong>(song => new class implements ISong {
                id = song.Id;
                page = song.Page;
                text = '';
                title = song.Title;
                url = song.FriendlyUrl;
            }))
            .then(songs => CODEX.songs = songs);
    }

    public static getSongByPage(page: string): Promise<ISong>{
        return CODEX.getSongs()
            .then(songs => songs.find(song => song.page === page))
            .then(song => {
               if (song !== undefined){
                   return song;
               }
               throw Error("Song not found");
            });
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
            return Promise.resolve(this.getSongFields(song.text));
        }
        const url = `https://studentencodex.org/lied/${song.url}`;
        return API.getResponse(url)
            .then(html => cheerioModule.load(html))
            .then($ => $('body div.lied').children('p'))
            .then(cheerio => cheerio.next())
            .then(cheerio => cheerio.next())
            .then(cheerio => cheerio.next())
            .then(cheerio => cheerio.next())
            .then(cheerio => cheerio.next())
            .then(cheerio => cheerio.next())
            .then(cheerio => cheerio.next())
            .then(cheerio => cheerio.html())
            .then(html => song.text = html || '')
            .then(this.getSongFields)
            .then(fields => {
                if (fields.length === 0){
                    return [{
                        name: `Link:`,
                        value: `[${url}](url)`
                    }];
                }
                return fields;
            })
    }

    private static getSongFields(text: string): IField[]{
        const parts = text.split('<br')
            .map(part => {
                const p = part.trim();
                if (p.startsWith('>')){
                    return p.replace('>','');
                }
                return p;
            }).filter(part => part !== '');

        const headers = parts.filter(part => /[0-9]/g.test(part) || part.toLowerCase().startsWith('refrein'));

        const fields: IField[] = [];
        let i = -1;
        let nextHeader = headers.shift() || '';
        parts.forEach(part => {
            if (part === nextHeader){
                fields.push({
                   name: part,
                   value: ''
                });
                nextHeader = headers.shift() || '';
                i++;
            } else if (fields[i]){
                fields[i].value += part + '\n';
            }
        })
        return fields;
    }

}