import { Message } from "discord.js";
import {ICommand} from "../ICommand";

export default class Reload implements ICommand {
    name = 'reload';
    description = 'Reloads a command';
    aliases = []; // Can be an array of strings with aliases for this command
    cooldown = 5;
    args = [];
    usage = ""; // Can be a string with an explanation of the required arguments
    guildOnly = false;
    execute(message: Message, args: string[]) {
        const commandName = args[0].toLowerCase();
        // @ts-ignore
        const command = message.client?.commands.get(commandName) || message.client?.commands
            .find((cmd: ICommand) => cmd.aliases && cmd.aliases.includes(commandName));

        if (!command) return message.channel.send(`There is no command with name or alias \`${commandName}\`, ${message.author}!`);

        delete require.cache[require.resolve(`./${command.name}.ts`)];

        try {
            const newCommand = require(`./${command.name}.ts`);
            // @ts-ignore
            message.client?.commands.set(newCommand.name, newCommand);
            message.channel.send(`Command \`${command.name}\` was reloaded!`).then();
        } catch (error) {
            console.error(error);
            message.channel.send(`There was an error while reloading a command \`${command.name}\`:\n\`${error.message}\``).then();
        }
    }
}