import {Message} from "discord.js";

export interface IAutoReaction {
    readonly name: string;
    readonly aliases: string[];
    readonly description: string;
    execute(message: Message): void;
}