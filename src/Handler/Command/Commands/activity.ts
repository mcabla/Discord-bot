import { Message } from "discord.js";
import {ACommand} from "../ACommand";
import {CustomClient} from "../../../Client/CustomClient";

export default class Activity extends ACommand {
    name = 'activity';
    description = 'Set the bot\'s activity!';
    usage = "";
    permissions = ['ADMINISTRATOR'];
    execute(message: Message, args: string[]) {
        if (message.client instanceof CustomClient){
            if (message.client.data.settings.OWNER === message.author.id) {
                message.client?.user?.setActivity(args.join(' '));
            } else {
                message.reply('Only the bot owner is allowed to change the activity.')
            }
        } else {
            message.reply('An unkown error occured.')
        }

    }
}