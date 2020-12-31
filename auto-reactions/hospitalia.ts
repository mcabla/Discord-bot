import {Emoji, Message} from "discord.js";
import {AAutoReaction} from "../AAutoReaction";

export default class Hospitalia extends AAutoReaction {
    name = 'hospitalia';
    aliases = []; // Can be an array of strings with aliases for this auto reaction
    description = 'reacts with Hospitalia emoji';
    execute(message: Message) {
        const emoji = message?.client.emojis.cache.find((emoji: Emoji) => emoji.name === "hospitalia");
        if (emoji != undefined) {
            message.react(emoji).then();
        }
    }
}