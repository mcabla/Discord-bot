import { Message } from "discord.js";
import {ACommand} from "../ACommand";
import {Messages} from "../../../Util/Messages";
import {CustomClient} from "../../../Client/CustomClient";
import {Keys} from "../../../Data/Keys";

export default class Meme extends ACommand {
    name = 'meme';
    description = 'Meme!';
    usage = '';
    guildOnly = true;
    execute(message: Message, args: string[]) {
        if (message.client instanceof CustomClient && message.guild !== null){
            if (message.client.data.guilds.has(message.guild.id)) {
                if (message.client.data.getGuildValue(message.guild.id, Keys.Guild.memeChannelId).length > 0) {
                    Messages.meme(message.client, message.guild.id)
                        .then(m => message.reply(`I've sent a meme in ${m.channel}!`))
                        .catch(console.log);
                } else {
                    message.reply('Ask your administrator to setup a meme channel first');
                }
            } else {
                message.reply('Please ask your administrator to complete this bot setup.');
            }
        }
    }
}