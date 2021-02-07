import {DMChannel, Message} from "discord.js";
import {ACommand} from "../ACommand";
import {STRING} from "../../Util/String";
import {CustomClient} from "../../Client/CustomClient";

export default class Purge extends ACommand {
    name = 'purge';
    description = 'Remove the bot\'s activity!';
    usage = "[number of messages to be deleted]";
    args = [' n number of messages to be deleted with 0 < n <= 100'];
    permissions = ["ADMINISTRATOR"];
    guildOnly = true;
    cooldown = 5;
    execute(message: Message, args: string[]) {
        if (! (message.channel instanceof DMChannel) && STRING.isNumber(args[0])) {
            let n: number = +args[0];
            if (n < 0) {
                message.reply('The given argument is too small.').then();
                return;
            } else if (n > 100){
                message.reply('The given argument is too big.').then();
                return;
            }
            message.channel.bulkDelete(n)
                .then(messages => message.channel.send(`Bulk deleted ${messages.size} messages`))
                .then(() => {
                    if (message.client instanceof CustomClient) {
                        message.client?.sendToLogChannel(`${message.author} purged ${n} messages from channel ${message.channel.id}`);
                    }
                })
                .catch(e => {
                    console.log(e);
                    message.reply(e.message).then();
                });
        } else {
            message.reply('The given argument is not a number.').then();
        }
    }
}