import {Collection, Message} from "discord.js";
import {AAutoReaction} from "../AAutoReaction";
import {CustomClient} from "../../../Client/CustomClient";
import {IAutoReaction} from "../IAutoReaction";
import {Messages} from "../../../Util/Messages";
import {API} from "../../../Util/Api";
import {Commands} from "../../Command/Commands";
import {Keys} from "../../../Data/Keys";
import {GuildData} from "../../../Data/GuildData";

interface ICommandTrigger {
    readonly id: number;
    readonly trigger: string;
    readonly command: string;
    readonly exact: boolean;
}

export default class Command extends AAutoReaction {
    name = 'commandAutoReaction';
    description = 'reacts with emojis';
    private commands = new Collection<string, ICommandTrigger>();
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
                                client.command.commands.get(v.command)?.execute(message, []);
                            }
                        } else if (parsedContent.includes(k)) {
                            client.command.commands.get(v.command)?.execute(message, []);
                        }
                    });
                });
        }
        return Promise.resolve();
    }
}