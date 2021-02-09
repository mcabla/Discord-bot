import {Message} from "discord.js";
import {ACommand} from "../ACommand";
import {MESSAGE} from "../../../Util/Message";

export default class React extends ACommand {
    name = 'react';
    description = 'React with a given emoji to a message!';
    usage = '';
    aliases = ['r'];
    permissions = ['ADMINISTRATOR'];
    guildOnly = true;
    execute(message: Message, args: string[]) {
        let url = args.shift() || "";
        MESSAGE.getFromUrl(message.client, url)
            .then(m => {
                if (m){
                    if (m.guild?.id === message.guild?.id) {
                        this.reactWithEmoji(message, m, args);
                    } else {
                        message.reply("The message is not in this guild.").then();
                    }
                }
            }).catch(e => {
                console.log(e);
                message.reply("Error: Check the message url.").then();
            });

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