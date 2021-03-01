import { Message } from "discord.js";
import {ACommand} from "../ACommand";
import {CustomClient} from "../../../Client/CustomClient";

export default class Settings extends ACommand {
    name = 'settings';
    description = 'Customise the bot';
    aliases = ['set'];
    args = [];
    usage = "";
    permissions = ['ADMINISTRATOR'];
    execute(message: Message, args: string[]) {
        const client = message.client;
        if (client instanceof CustomClient){
            let key = args.shift() || '';
            key = key.trim();
            if (message.guild) {
                if (key !== '') {
                    if (args.length > 0) {
                        const value = (args.shift() || '').trim();
                        client.data.updateGuildValue(message.guild.id, key, value);
                    } else {
                        const value = client.data.getGuildValue(message.guild?.id, key)
                        message.reply((value.length > 0) ? value : 'EMPTY').then();
                    }
                } else {
                    let data: string = JSON.stringify(client.data.guilds.get(message.guild.id));
                    data = data.replace(/","/gi, '",\n\t"');
                    data = data.replace(/{"/gi, '{\n\t"');
                    data = data.replace(/"}/gi, '"\n}');
                    message.reply(`\n${data}`);
                }
            }

        }
    }
}