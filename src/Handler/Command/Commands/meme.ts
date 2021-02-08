import { Message } from "discord.js";
import {ACommand} from "../ACommand";
import {MESSAGE} from "../../../Util/Message";

export default class Meme extends ACommand {
    name = 'meme';
    description = 'Meme!';
    usage = '';
    guildOnly = true;
    execute(message: Message, args: string[]) {
        MESSAGE.meme(message.client)
            .then(m => message.reply(`I've sent a meme in ${m.channel}!`))
            .catch(console.log);
    }
}