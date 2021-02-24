import { DMChannel, Message, MessageEmbed} from "discord.js";
import {ACommand} from "../ACommand";
import {CODEX, ISong} from "../../../Util/Codex";
import {LOG} from "../../../Util/Log";
import {IField, WEBHOOK} from "../../../Util/Webhook";
import {STRING} from "../../../Util/String";
import {CustomClient} from "../../../Client/CustomClient";
import {ICommand} from "../ICommand";
import {Keys} from "../../../Data/Keys";

export default class Codex extends ACommand {
    name = 'codex';
    description = 'Get codex songs';
    usage = '';
    aliases = ['c'];
    guildOnly = true;
    bypassChannelIdKey = Keys.Guild.codexChannelId;
    execute(message: Message, args: string[]) {
        if (!(message.client instanceof CustomClient)) return;
        let songs: Promise<ISong[]>;
        const arg = args.join(' ');
        if (STRING.isNumber(arg)) {
            songs = CODEX.getSongByPage(message.client, arg);
        } else {
            songs = CODEX.getSongsByTitle(message.client, arg);
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
                name: `${song.title} (pagina ${song.page})`,
                value: `‎`
            };
        });
        if (fields.length > 25){
            fields.length = 25;
        }
        return new MessageEmbed({
            color: 0x0082bb,
            title: "Codex",
            description: `‎`,
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

    setup(client: CustomClient): Promise<ICommand> {

        return super.setup(client);
    }
}