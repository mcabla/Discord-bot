import {Collection, Message} from "discord.js";
import {AAutoReaction} from "../AAutoReaction";
import {CustomClient} from "../../../Client/CustomClient";
import {IAutoReaction} from "../IAutoReaction";
import {Messages} from "../../../Util/Messages";
import {API} from "../../../Util/Api";
import {Commands} from "../../Command/Commands";
import {Keys} from "../../../Data/Keys";
import {GuildData} from "../../../Data/GuildData";
import {ICommand} from "../../Command/ICommand";
import {LOG} from "../../../Util/Log";

interface ICommandTrigger {
    readonly id: number;
    readonly trigger: string;
    readonly command: string;
    readonly exact: boolean;
    readonly cooldown: number;
}

export default class Command extends AAutoReaction {
    name = 'commandAutoReaction';
    description = 'reacts with a command';
    cooldown = 0;
    private commands = new Collection<string, ICommandTrigger>();
    readonly cooldowns = new Collection<string, Collection<string, number>>();
    setup(client: CustomClient): Promise<IAutoReaction> {
        const url = client.data.settings.get(Keys.Settings.autoReactionsCommandsUrl) || '';
        return super.setup(client)
            .then(() => API.get<ICommandTrigger[]>(url))
            .then(res => {
                this.commands.clear();
                for (const trigger of res){
                    this.commands.set(trigger.trigger, trigger);
                }
            }).then(()=>{
                this.aliases.length = 0;
                this.aliases = this.commands.keyArray();
                return this;
            });

    }

    execute(message: Message): Promise<void> {
        if (message.guild === null) return Promise.resolve();

        const client = message.client;
        if (client instanceof CustomClient) {
            const guildData: GuildData = client.data.guilds.get(message.guild.id);
            const statusChannelId = client.data.settings.get(Keys.Settings.statusChannelId);
            if (message.channel.id === guildData.LOG_CHANNEL_ID || message.channel.id == statusChannelId || message.author.bot || message.webhookID ) return Promise.resolve();

            const prefixRegex = new RegExp(`^(<@!?${client.user?.id}>|${Commands.escapeRegex(guildData.PREFIX)})\\s*`);
            const bypass = Commands.bypassChannelCommand(message, client.command.commands);
            if (prefixRegex.test(message.content) || bypass.length > 0) return Promise.resolve();

            return Messages.parse(message)
                .then(parsedContent => {
                    this.commands.forEach((v, k) => {
                        if (v.exact){
                            const words = message.content.trim().split(/ +/);
                            if (words.some(word => word === k)){
                                this.executeCommand(message,v, client.command.commands.get(v.command));
                            }
                        } else if (parsedContent.includes(k)) {
                            this.executeCommand(message,v, client.command.commands.get(v.command));
                        }
                    });
                });
        }
        return Promise.resolve();
    }

    private executeCommand(message: Message, trigger: ICommandTrigger, command?: ICommand){
        if (command === undefined) {
            return;
        }

        if (trigger.cooldown > 0) {
            if (!this.cooldowns.has(trigger.id.toString())) {
                this.cooldowns.set(trigger.id.toString(), new Collection<string, number>());
            }

            const now = Date.now();
            const timestamps = this.cooldowns.get(trigger.id.toString());
            const cooldownAmount = (trigger.cooldown || 3) * 1000;

            // @ts-ignore
            if (timestamps.has(message.author.id)) {
                // @ts-ignore
                const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

                if (now < expirationTime) {
                    const timeLeft = (expirationTime - now) / 1000;
                    //return message.reply(`Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${reaction.name}\` trigger.`);
                    return LOG.sendToLogChannel(message.client,`Due to a cooldown \'${trigger.id.toString()}\' did not run for: ${message.url}`, false, message.channel)
                }
            } else {
                // @ts-ignore
                timestamps.set(message.author.id, now);
                // @ts-ignore
                setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
            }
        }

        command.execute(message, []);
    }
}