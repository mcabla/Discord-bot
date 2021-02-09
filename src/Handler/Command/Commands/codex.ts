import {DMChannel, Message, MessageEmbed} from "discord.js";
import {ACommand} from "../ACommand";
import {CODEX, ISong} from "../../../Util/Codex";
import {LOG} from "../../../Util/Log";
import {WEBHOOK} from "../../../Util/Webhook";
import {PREFIX} from "../../../Config/Config";

interface IField {
    name:string;
    value: string;
}

export default class Ping extends ACommand {
    name = 'codex';
    description = 'Get codex songs';
    usage = '';
    aliases = ['c'];
    guildOnly = true;
    execute(message: Message, args: string[]) {
        let action = args.shift() || "";
        if (this.contains(['page', 'p', 'pagina'], action)) {
            return this.page(message, args);
        } else if (this.contains(['song', 's', 'lied', 'l', 'title','t','titel'], action)) {
            return this.song(message, args);
        }
    }

    private contains = (actions: string[], action: string) => actions.some(a => a === action);

    private page(message: Message, args: string[]){
        CODEX.getSongByPage(args.join(' '))
            .then(song => this.sendSong(message, song))
            .catch(e => {
                LOG.sendToLogChannel(message.client,e.message,true)
                    .then(() => message.reply('Song not found.'));
            });
    }

    private song(message: Message, args: string[]){
        CODEX.getSongsByTitle(args.join(' '))
            .then(songs => {
                if (songs.length === 0){
                    return message.reply('No Songs found.');
                } else if (songs.length === 1){
                    return this.sendSong(message,songs[0]);
                }
                return message.channel.send(this.makeSelectorEmbed(songs));
            }).catch(e => {
                LOG.sendToLogChannel(message.client,e.message,true).then();
            });
    }

    private makeSelectorEmbed(songs: ISong[]): MessageEmbed {
        const fields = songs.map<IField>(song => {
            return {
                name: `‎`,
                value: `${song.title} (pagina ${song.page})`
            };
        });
        return new MessageEmbed({
            color: 0x0082bb,
            title: "Codex",
            /*description: "Reageer met de bijhorende emoji om het lied te selecteren.",*/
            description: `${PREFIX}${this.name} p [paginanummer] om het bijhorende lied te verkrijgen.`,
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
                description: text,
                timestamp: new Date(),
            }));
    }
}