import {Message} from "discord.js";
import {CustomClient} from "../../Client/CustomClient";

export interface IAutoReaction {
    readonly name: string;
    readonly description: string;
    readonly cooldown: number;
    aliases: string[];
    setup(client: CustomClient): Promise<IAutoReaction>;
    execute(message: Message): Promise<void>;
}