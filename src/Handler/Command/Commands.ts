import {CustomClient} from "../../Client/CustomClient";
import fs from "fs";
import {ICommand} from "./ICommand";
import {Collection, Message} from "discord.js";
import {PREFIX} from "../../Data/Config/Config";
import {ACommand} from "./ACommand";
import {LOG} from "../../Util/Log";
import {IEventHandler} from "../IEventHandler";
import {GuildData} from "../../Data/GuildData";
import {Keys} from "../../Data/Keys";

export class Commands implements IEventHandler {
    readonly client: CustomClient;
    readonly commands = new Collection<string, ACommand>();
    readonly cooldowns = new Collection<string, Collection<string, number>>();
    static escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    constructor(client: CustomClient) {
        this.client = client;
        this.setup(client);
    }

    private setup(client: CustomClient){
        const commandFiles = fs.readdirSync('./src/Handler/Command/Commands').filter((file: string) => file.endsWith('.ts'));
        for (const file of commandFiles) {
            import(`./Commands/${file}`)
                .then(({default: command}) => {
                    const cmd: ACommand = new command();
                    cmd.setup(client).then(c => {
                        this.commands.set(cmd.name, cmd);
                    });
                }).catch(console.log);
        }
    }

    public static bypassChannelCommand(message: Message, commands: Collection<string, ACommand>): string {
        let cmd: ICommand | undefined = commands.find(cmd => cmd.bypassChannelIds.length > 0 && cmd.bypassChannelIds.some(bypassId =>  bypassId.length > 0 && bypassId === message.channel.id));
        return cmd?.name ?? "";
    }

    public handleMessage(message: Message): Promise<void> {
        if (message.guild){
            const guildData: GuildData = this.client.data.guilds.get(message.guild.id);
            const statusChannelId = this.client.data.settings.get(Keys.Settings.statusChannelId);
            if (message.channel.id === guildData.LOG_CHANNEL_ID || message.channel.id == statusChannelId) return Promise.resolve();
        }
        const prefixRegex = new RegExp(`^(<@!?${this.client.user?.id}>|${Commands.escapeRegex(PREFIX)})\\s*`);
        const bypass = Commands.bypassChannelCommand(message, this.commands);
        if (!(prefixRegex.test(message.content) || bypass.length > 0) || message.author.bot || message.webhookID) return Promise.resolve();

        message.channel.startTyping().then();
        return this.handleCommand(message, prefixRegex, bypass)
            .then(() => {
                if (!message.channel.deleted){
                    message.channel.stopTyping(true);
                }
            }).catch(error => {
                if (!message.channel.deleted){
                    message.channel.stopTyping(true);
                }
                console.log(error);
            });
    }

    private handleCommand(message: Message, prefixRegex: RegExp, bypass: string): Promise<Message> {
        const matchedPrefix = message.content.match(prefixRegex);
        let length = (!matchedPrefix || matchedPrefix.length <= 1 )? 0 : matchedPrefix[1].length;
        const args = message.content.slice(length).trim().split(/ +/);
        const commandName = (bypass.length > 0)? bypass: args.shift()?.toLowerCase();
        if (commandName == undefined) return Promise.reject('Command undefined.'); // Should not happen
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
                return LOG.sendToLogChannel(this.client,"user was null",true, message.channel)
                    .then(() => message.reply('An unknown error occurred! Please contact your administrator.'));
            }
            const authorPermissions = message.channel.permissionsFor(user);
            if (!authorPermissions){
                return message.reply('You are not allowed to execute this command here.');
            }
            if (command.permissions.some(permission => !authorPermissions.has(permission))){
                return message.reply('You are not allowed to execute this command here.');
            }
        }

        if (command.args.length > 0 && !args.length) {
            let reply = `You didn't provide any arguments, ${message.author}!`;
            if (command.usage) {
                reply += `\nThe proper usage would be: \`${PREFIX}${command.name} ${command.usage}\``;
            }
            return message.reply(reply);
        }

        if (!this.cooldowns.has(command.name)) {
            this.cooldowns.set(command.name, new Collection<string, number>());
        }

        const now = Date.now();
        const timestamps = this.cooldowns.get(command.name);
        const cooldownAmount = (command.cooldown || 3) * 1000;

        // @ts-ignore
        if (timestamps.has(message.author.id) && (bypass.length == 0)) {
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
            return Promise.resolve(message);
        } catch (error) {
            console.error(error);
            return message.reply('There was an error trying to execute that command!');
        }
    }

}