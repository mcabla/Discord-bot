import {Message, PermissionResolvable} from "discord.js";
import {CustomClient} from "../../Client/CustomClient";

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
    setup(client: CustomClient): Promise<ICommand>;
    execute(message: Message, args: string[]): void;
}