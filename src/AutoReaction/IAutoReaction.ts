import {Message} from "discord.js";
import {CustomClient} from "../Client/CustomClient";

export interface IAutoReaction {
    readonly name: string;
    readonly description: string;
    aliases: string[];
    setup(client: CustomClient): void;
    execute(message: Message): void;
}