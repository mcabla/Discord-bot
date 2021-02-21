import { DMChannel, Message, MessageEmbed} from "discord.js";
import {ACommand} from "../ACommand";
import {CODEX, ISong} from "../../../Util/Codex";
import {LOG} from "../../../Util/Log";
import {IField, WEBHOOK} from "../../../Util/Webhook";
import {STRING} from "../../../Util/String";
import {CODEX_CHANNEL_ID} from "../../../Config/Config";

export default class Ping extends ACommand {
    name = 'codex';
    description = 'Get codex songs';
    usage = '';
    aliases = ['c'];
    guildOnly = true;
    bypassChannelId = CODEX_CHANNEL_ID;
    execute(message: Message, args: string[]) {
/*        if (args[0] === '.'){
            CODEX.getSongs().then(songs => {
                let s = songs.filter(s => s.text === '')
                    .map(s => {
                        return {
                            page: s.page,
                            title: s.title
                        }
                    });
                console.log(s.length, s);
            })
            return;
        }*/

        let songs: Promise<ISong[]>;
        const arg = args.join(' ');
        if (STRING.isNumber(arg)) {
            songs = CODEX.getSongByPage(arg);
        } else {
            songs = CODEX.getSongsByTitle(arg);
        }
        songs.then(songs => {
            if (songs.length === 0){
                return message.reply('No Songs found.');
            } else if (songs.length === 1){
                console.log('found one song, showing it');
                return this.sendSong(message,songs[0]);
            }
            return message.channel.send(this.makeSelectorEmbed(songs));
        }).catch(e => {
            LOG.sendToLogChannel(message.client,e.message,true)
                .then(() => message.reply('Songs not found.'));
        });
    }

    private makeSelectorEmbed(songs: ISong[]): MessageEmbed {
        const fields = songs.map<IField>(song => {
            return {
                name: `‎`,
                value: `${song.title} (pagina ${song.page})`
            };
        });
        if (fields.length > 25){
            fields.length = 25;
        }
        return new MessageEmbed({
            color: 0x0082bb,
            title: "Codex",
            /*description: `${PREFIX}${this.name} [paginanummer] om het bijhorende lied te verkrijgen.`,*/
            timestamp: new Date(),
            fields: fields,
        });
    }

    private sendSong(message: Message, song: ISong): Promise<Message> {
        return this.makeSongEmbed(song)
            .then(embed => {
                if (message.channel instanceof DMChannel){ //Not allowed by guildOnly = true
                    return message.reply(song.title);
                }
                return WEBHOOK.send(message.channel, '', embed);
            });
    }

    private makeSongEmbed(song: ISong): Promise<MessageEmbed> {
        return CODEX.getSongText(song)
            .then(text => new MessageEmbed({
                color: 0x0082bb,
                title: song.title,
                description: `Pagina ${song.page}`,
                fields: text,
                timestamp: new Date(),
            }));
    }
}