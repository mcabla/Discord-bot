import {Message} from "discord.js";
import {AAutoReaction} from "../AAutoReaction";

export default class Bier extends AAutoReaction {
    name = 'bier';
    aliases = ['beer', 'gerstenat', 'pint'];
    description = 'reacts with beer emoji';
    execute(message: Message) {
        message?.react('🍻').then();
    }
}