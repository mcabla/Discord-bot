import {Message} from "discord.js";
import {ICommand} from "./ICommand";

export abstract class ACommand implements ICommand {
    readonly abstract name: string;
    readonly abstract description: string;
    readonly abstract usage: string; // Can be a string with an explanation of the required arguments
    readonly aliases: string[] = []; // Can be an array of strings with aliases for this command
    readonly args: string[] = [];
    readonly cooldown: number = 5;
    readonly guildOnly: boolean = false;
    readonly permissions: any[] = [];
    readonly bypassChannelId: string | undefined;
    abstract execute(message: Message, args: string[]): void;
}