import {Emoji, Message} from "discord.js";
import {ACommand} from "../ACommand";
import {MESSAGE} from "../../Util/Message";

export default class React extends ACommand {
    name = 'react';
    description = 'React with a given emoji to a message!';
    usage = '';
    aliases = ['r'];
    permissions = ['ADMINISTRATOR'];
    guildOnly = true;
    execute(message: Message, args: string[]) {
        let channelId = args.shift() || "";
        let guildChannel = message.guild?.channels.resolve(channelId);
        if (guildChannel?.isText() && args.length > 0) {
            let messageId = args.shift() || "";
            guildChannel.messages.fetch(messageId)
                .then(m => {
                    this.reactWithEmoji(message, m, args);
                }).catch(e => {
                    console.log(e);
                    message.reply("The message ID is incorrect.").then();
                });
        } else {
            message.reply("The channel ID is incorrect.").then();
        }

    }

    private reactWithEmoji(originalMessage: Message,message: Message, args: string[]) {
        let i = 0;
        args.forEach(arg => {
            MESSAGE.react(message, arg, originalMessage).then(() => i++).catch(console.log);
        });

        setTimeout(() => {
            if(i > 0) {
                originalMessage.reply(`${i} reaction(s) added.`).then();
            }
        }, 1000);
    }
}