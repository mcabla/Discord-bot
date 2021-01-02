import {Message, PermissionResolvable} from "discord.js";

export interface ICommand {
    readonly name: string;
    readonly aliases: string[];
    readonly description: string;
    readonly cooldown: number;
    readonly args: string[];
    readonly usage: string;
    readonly guildOnly: boolean;
    readonly permissions: PermissionResolvable[];
    readonly bypassChannelId: string | undefined;
    execute(message: Message, args: string[]): void;
}