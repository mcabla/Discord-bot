import {Emoji, Message} from "discord.js";
import {AAutoReaction} from "../AAutoReaction";

export default class Acantha extends AAutoReaction {
    name = 'acantha';
    aliases = []; // Can be an array of strings with aliases for this auto reaction
    description = 'reacts with Acantha emoji';
    execute(message: Message) {
        let emoji = message?.client.emojis.cache.find((emoji: Emoji) => emoji.name === 'acantha');
        if (emoji != undefined) {
            message.react(emoji).then();
        }
    }
}