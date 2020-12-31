import {callAssistant} from "../watson";
import { Message } from "discord.js";
import {ICommand} from "../ICommand";
export default class Watson implements ICommand {
    name = 'watson';
    aliases = []; // Can be an array of strings with aliases for this command
    description = 'AI assistant';
    cooldown = 1;
    args = [];
    usage = "[Tekst die je aan IBM's Watson Assistant wil meegeven.]"; // Can be a string with an explanation of the required arguments
    guildOnly = false;
    execute(message: Message, args: string[]) {
        let text = args.join(' ');
        const author = message.author.username;
        callAssistant(text).then((txt: string) => {
            txt = txt.replace('{user}', `${author}`);
            message.channel.send(txt);
        });
    }
}