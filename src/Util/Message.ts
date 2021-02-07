import {Emoji, Message} from "discord.js";
import {STRING} from "./String";

export class MESSAGE{
    public static react(message: Message, emoji: string, originalMessage?: Message) {
        if(!STRING.LETTERS.test(emoji)){
            message?.react(emoji).then().catch(console.log);
        } else {
            let emj = message?.client.emojis.cache.find((emj: Emoji) => emj.name === emoji);
            if (emj != undefined) {
                message.react(emj).then().catch(console.log);
            } else {
                originalMessage?.reply(`${emoji} does not exist.`).then();
            }
        }
    }
}