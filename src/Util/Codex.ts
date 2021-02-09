import {API} from "./Api";
import {CODEX_SONGS_URL} from "../Config/Config";

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

    public static getSongText(song: ISong): Promise<string> {
        if (song.text.length > 0){
            return Promise.resolve(song.text);
        }
        return Promise.resolve(song.page); //TODO
    }

}