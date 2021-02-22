import {Message, PermissionResolvable} from "discord.js";
import {CustomClient} from "../../Client/CustomClient";
import {Keys} from "../../Data/Keys";

export interface ICommand {
    readonly name: string;
    readonly aliases: string[];
    readonly description: string;
    readonly cooldown: number;
    readonly args: string[];
    readonly usage: string;
    readonly guildOnly: boolean;
    readonly permissions: PermissionResolvable[];
    readonly bypassChannelIds: string[];
    readonly bypassChannelIdKey: Keys.Guild;
    setup(client: CustomClient): Promise<ICommand>;
    execute(message: Message, args: string[]): void;
}