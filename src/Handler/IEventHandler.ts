import {CustomClient} from "../Client/CustomClient";
import {Message} from "discord.js";

export interface IEventHandler {
    readonly client: CustomClient;
    handleMessage(message: Message): Promise<void>;
}