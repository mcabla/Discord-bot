import { Message } from "discord.js";
import {ACommand} from "../ACommand";
import {MESSAGE} from "../../../Util/Message";
import {CustomClient} from "../../../Client/CustomClient";

export default class Meme extends ACommand {
    name = 'meme';
    description = 'Meme!';
    usage = '';
    guildOnly = true;
    execute(message: Message, args: string[]) {
        if (message.client instanceof CustomClient && message.guild !== null){
            MESSAGE.meme(message.client, message.guild.id)
                .then(m => message.reply(`I've sent a meme in ${m.channel}!`))
                .catch(console.log);

        }
    }
}