import {Message} from "discord.js";
import {AAutoReaction} from "../AAutoReaction";

export default class Kaas extends AAutoReaction {
    name = 'kaas';
    aliases = ['cheese', 'eten', 'food']; // Can be an array of strings with aliases for this auto reaction
    description = 'reacts with Cheese emoji';
    execute(message: Message) {
        message?.react('🧀').then();
    }
}