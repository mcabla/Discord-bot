import {DMChannel, Message} from "discord.js";
import {ACommand} from "../ACommand";

export default class Bot extends ACommand {
    name = 'bot';
    aliases = ['bots'];
    description = 'Print all bots';
    usage = '';
    guildOnly = true;
    execute(message: Message, args: string[]) {
        if (message.channel instanceof DMChannel){
            return;
        }

       const bots = message.channel.members
           .filter(member => member.user.bot)
           .map((v) => `🔹 <@${v.id}>`)
           .join('\n');
       message.reply(`The channel has the following bots:\n${bots}`).then();
    }
}