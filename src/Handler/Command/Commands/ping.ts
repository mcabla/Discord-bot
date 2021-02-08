import { Message } from "discord.js";
import {ACommand} from "../ACommand";

export default class Ping extends ACommand {
    name = 'ping';
    description = 'Ping!';
    usage = '';
    execute(message: Message, args: string[]) {
        message.channel.send(`Pong! (${message.client.ws.ping}ms)`).then(sent => {
            sent.edit(`Pong! (${message.client.ws.ping}ms - ${sent.createdTimestamp - message.createdTimestamp}ms)`).then();
        });
    }
}