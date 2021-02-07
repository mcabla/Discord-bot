import { Message } from "discord.js";
import {ACommand} from "../ACommand";
import {CustomClient} from "../../Client/CustomClient";

export default class Ping extends ACommand {
    name = 'reload';
    description = 'Reload the auto reactions aliases';
    usage = '';
    execute(message: Message, args: string[]) {
        let client = message.client;
        if (client instanceof CustomClient){
            client.autoReaction.reload();
            return message.reply('reloaded.');
        }
    }
}
