import {CustomClient} from "../Client/CustomClient";
import fs from "fs";
import {ICommand} from "./ICommand";
import {Collection, Message} from "discord.js";
import {LOG_CHANNEL_ID, PREFIX, STATUS_CHANNEL_ID} from "../Config/Config";
import {ACommand} from "./ACommand";

export class Commands {
    readonly client: CustomClient;
    readonly commands = new Collection<string, ACommand>();
    readonly cooldowns = new Collection<string, Collection<string, number>>();
    escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    constructor(client: CustomClient) {
        this.client = client;
        this.setup(client);
    }

    private setup(client: CustomClient){
        const commandFiles = fs.readdirSync('./src/Command/Commands').filter((file: string) => file.endsWith('.ts'));
        for (const file of commandFiles) {
            import(`./Commands/${file}`)
                .then(({default: command}) => {
                    const cmd: ICommand = new command();
                    cmd.setup(client);
                    this.commands.set(cmd.name, cmd);
                }).catch(console.log);
        }
    }

    private bypassChannelCommand(message: Message): string {
        let cmd: ICommand | undefined = this.commands.find(cmd => cmd.bypassChannelId != null && cmd.bypassChannelId === message.channel.id);
        return cmd?.name ?? "";
    }

    public executeCommand(message: Message){
        if (message.channel.id === LOG_CHANNEL_ID || message.channel.id == STATUS_CHANNEL_ID) return;
        const prefixRegex = new RegExp(`^(<@!?${this.client.user?.id}>|${this.escapeRegex(PREFIX)})\\s*`);
        const bypass = this.bypassChannelCommand(message);
        if (!(prefixRegex.test(message.content) || bypass.length > 0) || message.author.bot || message.webhookID) return;

        const matchedPrefix = message.content.match(prefixRegex);
        let length = (!matchedPrefix || matchedPrefix.length <= 1 )? 0 : matchedPrefix[1].length;
        const args = message.content.slice(length).trim().split(/ +/);
        const commandName = (bypass.length > 0)? bypass: args.shift()?.toLowerCase();
        if (commandName == undefined) return;
        const command = this.commands.get(commandName) || this.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
        if (!command) {
            return message.reply('I did not understand you. Please try again.\nContact your administrator if you think that this is an error.');
        }

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