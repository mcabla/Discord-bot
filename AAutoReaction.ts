import {IAutoReaction} from "./IAutoReaction";
import {Message} from "discord.js";

export abstract class AAutoReaction implements IAutoReaction{
    readonly abstract aliases: string[];
    readonly abstract description: string;
    readonly abstract name: string;

    abstract execute(message: Message): void;
}