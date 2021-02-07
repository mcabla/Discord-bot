import {Message} from "discord.js";
import {CustomClient} from "../Client/CustomClient";

export interface IAutoReaction {
    readonly name: string;
    readonly description: string;
    aliases: string[];
    setup(client: CustomClient): Promise<IAutoReaction>;
    execute(message: Message): void;
}