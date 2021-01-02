import {callAssistant} from "../../Watson/Watson";
import { Message } from "discord.js";
import {ACommand} from "../ACommand";
export default class Watson extends ACommand  {
    name = 'watson';
    description = 'AI assistant';
    usage = '[Tekst die je aan IBM\'s Watson Assistant wil meegeven.]';
    aliases = ['w'];
    cooldown = 1;
    execute(message: Message, args: string[]) {
        let text = args.join(' ');
        const author = message.author.username;
        callAssistant(text).then((txt: string) => {
            txt = txt.replace('{user}', `${author}`);
            message.channel.send(txt);
        });
    }
}