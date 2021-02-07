import {Emoji, Message, MessageReaction} from "discord.js";
import {STRING} from "./String";

export class MESSAGE{
    public static react(message: Message, emoji: string, originalMessage?: Message): Promise<MessageReaction> {
        if(!STRING.LETTERS.test(emoji)){
            return message.react(emoji);
        } else {
            let emj = message?.client.emojis.cache.find((emj: Emoji) => emj.name === emoji);
            if (emj != undefined) {
                return message.react(emj);
            } else {
                originalMessage?.reply(`${emoji} does not exist.`).then();
            }
        }
        return Promise.reject();
    }
}