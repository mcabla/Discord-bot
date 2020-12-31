import { Message } from "discord.js";
import {ICommand} from "../ICommand";

export default class Activity implements ICommand {
    name = 'activity';
    aliases = []; // Can be an array of strings with aliases for this command
    description = 'Set the bot\'s activity!';
    cooldown = 5;
    args = [];
    usage = ""; // Can be a string with an explanation of the required arguments
    guildOnly = false;
    execute(message: Message, args: string[]) {
        message.client?.user?.setActivity(args.join(' '));
    }
}