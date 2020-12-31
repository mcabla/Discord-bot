import {Emoji, Message} from "discord.js";
import {AAutoReaction} from "../AAutoReaction";

export default class Regent extends AAutoReaction {
    name = 'regent';
    aliases = []; // Can be an array of strings with aliases for this auto reaction
    description = 'reacts with reGent emoji';
    execute(message: Message) {
        const emoji = message?.client.emojis.cache.find((emoji: Emoji) => emoji.name === "regent");
        if (emoji != undefined) {
            message.react(emoji).then();
        }
    }
}