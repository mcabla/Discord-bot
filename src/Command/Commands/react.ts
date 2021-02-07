import {Emoji, Message} from "discord.js";
import {ACommand} from "../ACommand";

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
        let letters = /[a-zA-Z]/g;

        let i = 0;
        args.forEach(arg => {
            if(!letters.test(arg)){
                message?.react(arg).then(() => i++).catch(console.log);
            } else {
                let emoji = message?.client.emojis.cache.find((emoji: Emoji) => emoji.name === arg);
                if (emoji != undefined) {
                    message.react(emoji).then(() => i++).catch(console.log);
                } else {
                    originalMessage.reply(`${arg} does not exist.`).then();
                }
            }
        });

        setTimeout(() => {
            if(i > 0) {
                originalMessage.reply(`${i} reaction(s) added.`).then();
            }
        }, 1000);

    }
}