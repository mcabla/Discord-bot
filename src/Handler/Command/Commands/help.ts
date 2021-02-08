import { Message } from "discord.js";
import {ICommand} from "../ICommand";
import {PREFIX} from "../../../Config/Config";
import {ACommand} from "../ACommand";

export default class Help extends ACommand {
    name = 'help';
    description = 'List all of my commands or info about a specific command.';
    usage = '[command name]';
    aliases = ['commands', 'h'];
    execute(message: Message, args: string[]) {
        const data = [];
        // @ts-ignore
        const commands = message.client.command.commands;

        if (!args.length) {
            data.push('Here\'s a list of all my commands:');
            data.push(commands?.map((command: any) => command.name).join(', '));
            data.push(`\nYou can send \`${PREFIX}help [command name]\` to get info on a specific command!`);

            return message.author.send(data, { split: true })
                .then(() => {
                    if (message.channel.type === 'dm') return;
                    message.reply('I\'ve sent you a DM with all my commands!');
                })
                .catch(error => {
                    console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
                    message.reply('it seems like I can\'t DM you! Do you have DMs disabled?').then();
                });
        }

        const name = args[0].toLowerCase();
        const command = commands.get(name) || commands.find((c: ICommand) => c.aliases && c.aliases.includes(name));

        if (!command) {
            return message.reply('that\'s not a valid command!');
        }

        data.push(`**Name:** ${command.name}`);

        if (command.aliases) data.push(`**Aliases:** ${command.aliases.join(', ')}`);
        if (command.description) data.push(`**Description:** ${command.description}`);
        if (command.usage) data.push(`**Usage:** ${PREFIX}${command.name} ${command.usage}`);

        data.push(`**Cooldown:** ${command.cooldown || 3} second(s)`);

        message.channel.send(data, { split: true }).then();
    }
}