import { Message } from "discord.js";
import {ICommand} from "../ICommand";

export default class Ping implements ICommand {
    name = 'ping';
    aliases = []; // Can be an array of strings with aliases for this command
    description = 'Ping!';
    cooldown = 5;
    args = [];
    usage = ""; // Can be a string with an explanation of the required arguments
    guildOnly = false;
    execute(message: Message, args: string[]) {
        message.channel.send(`Pong! (${message.client.ws.ping}ms)`).then(sent => {
            sent.edit(`Pong! (${message.client.ws.ping}ms - ${sent.createdTimestamp - message.createdTimestamp}ms)`).then();
        });
    }
}