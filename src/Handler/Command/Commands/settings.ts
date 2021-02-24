import { Message } from "discord.js";
import {ACommand} from "../ACommand";
import {CustomClient} from "../../../Client/CustomClient";

export default class Settings extends ACommand {
    name = 'settings';
    description = 'Customise the bot';
    aliases = ['set'];
    args = ['key', 'value'];
    usage = "";
    permissions = ['ADMINISTRATOR'];
    execute(message: Message, args: string[]) {
        const client = message.client;
        if (client instanceof CustomClient){
            const key = args.shift() || '';
            if (message.guild) {
                if (args.length > 0){
                    client.data.updateGuildValue(message.guild?.id, key, args.shift() || '');
                } else {
                    const value = client.data.getGuildValue(message.guild?.id, key)
                    message.reply((value.length > 0)? value : 'EMPTY').then();
                }
            }

        }
    }
}