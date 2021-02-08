import {CustomClient} from "../../Client/CustomClient";
import {Collection, Message} from "discord.js";
import {LOG_CHANNEL_ID, STATUS_CHANNEL_ID} from "../../Config/Config";
import {MESSAGE} from "../../Util/Message";
import {LOG} from "../../Util/Log";
import {IEventHandler} from "../IEventHandler";

export class Music implements IEventHandler {
    readonly client: CustomClient;
    private readonly musicQueue = new Collection<string, string>();


    constructor(client: CustomClient) {
        this.client = client;
        this.setup(client);
    }

    private setup(client: CustomClient){

    }

    handleMessage(message: Message): Promise<void> {
        return Promise.resolve();
    }
}