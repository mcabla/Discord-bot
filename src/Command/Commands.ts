import {CustomClient} from "../Client/CustomClient";
import fs from "fs";
import {ICommand} from "./ICommand";
import {Collection, Message} from "discord.js";
import {PREFIX} from "../Config/Config";

export class Commands {
    readonly client: CustomClient;
    readonly cooldowns = new Collection<string, Collection<string, number>>();
    escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    constructor(client: CustomClient) {
        this.client = client;
        this.setup();
    }

    private setup(){
        const commandFiles = fs.readdirSync('./src/Command/Commands').filter((file: string) => file.endsWith('.ts'));
        for (const file of commandFiles) {
            import(`./Commands/${file}`)
                .then(({default: command}) => {
                    const cmd: ICommand = new command();
                    this.client.commands.set(cmd.name, cmd);
                }).catch(console.log);
        }
    }

    public executeCommand(message: Message){
        const prefixRegex = new RegExp(`^(<@!?${this.client.user?.id}>|${this.escapeRegex(PREFIX)})\\s*`);
        if (!prefixRegex.test(message.content) || message.author.bot) return;

        const matchedPrefix = message.content.match(prefixRegex);
        if (!matchedPrefix || matchedPrefix.length <= 1) return;
        const args = message.content.slice(matchedPrefix[1].length).trim().split(/ +/);
        const commandName = args.shift()?.toLowerCase();
        if (commandName == undefined) return;
        const command = this.client.commands.get(commandName) || this.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
        if (!command) return;

        if (command.guildOnly && message.channel.type === 'dm') {
            return message.reply('I can\'t execute that command inside DMs!');
        }

        if (command.permissions.length > 0 && message.guild != null && message.channel.type !== 'dm') {
            let user = message.client.user;
            if (!user){
                this.client.sendToLogChannel("user was null",true, message.channel);
                return message.reply('An unknown error occurred! Please contact your administrator.')
            }
            const authorPermissions = message.channel.permissionsFor(user);
            if (!authorPermissions){
                return message.reply('You are not allowed to execute this command here.');
            }
            for (const permission of command.permissions){
                if (!authorPermissions.has(permission)){
                    return message.reply('You are not allowed to execute this command here.');

                }
            }
        }

        if (command.args.length > 0 && !args.length) {
            let reply = `You didn't provide any arguments, ${message.author}!`;
            if (command.usage) {
                reply += `\nThe proper usage would be: \`${PREFIX}${command.name} ${command.usage}\``;
            }
            return message.channel.send(reply);
        }

        if (!this.cooldowns.has(command.name)) {
            this.cooldowns.set(command.name, new Collection<string, number>());
        }

        const now = Date.now();
        const timestamps = this.cooldowns.get(command.name);
        const cooldownAmount = (command.cooldown || 3) * 1000;

        // @ts-ignore
        if (timestamps.has(message.author.id)) {
            // @ts-ignore
            const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                return message.reply(`Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
            }
        } else {
            // @ts-ignore
            timestamps.set(message.author.id, now);
            // @ts-ignore
            setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
        }

        try {
            command.execute(message, args);
        } catch (error) {
            console.error(error);
            message.reply('There was an error trying to execute that command!').then();
        }
    }

}