import { Message } from "discord.js";
import {ACommand} from "../ACommand";

export default class Meme extends ACommand {
    name = 'meme';
    description = 'Meme!';
    usage = '';
    execute(message: Message, args: string[]) {
        message.channel.send(`Pong! (${message.client.ws.ping}ms)`).then(sent => {
            return sent.edit(`Pong! (${message.client.ws.ping}ms - ${sent.createdTimestamp - message.createdTimestamp}ms)`);
        });
    }
}