import { Message } from "discord.js";
import {ACommand} from "../ACommand";

export default class Activity extends ACommand {
    name = 'activity';
    description = 'Set the bot\'s activity!';
    usage = "";
    permissions = [""];
    execute(message: Message, args: string[]) {
        message.client?.user?.setActivity(args.join(' '));
    }
}