import {Emoji, Message} from "discord.js";
import {IAutoReaction} from "../IAutoReaction";

export default class Ideefix implements IAutoReaction {
    name = 'ideefix';
    aliases = ['club'];
    description = 'reacts with Ideefix emoji';
    execute(message: Message) {
        const emoji = message?.client.emojis.cache.find((emoji: Emoji) => emoji.name === "ideefix");
        if (emoji != undefined) {
            message.react(emoji).then();
        }
    }
}