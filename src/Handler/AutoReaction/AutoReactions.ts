import {CustomClient} from "../../Client/CustomClient";
import fs from "fs";
import {IAutoReaction} from "./IAutoReaction";
import {Collection, Message} from "discord.js";
import {AAutoReaction} from "./AAutoReaction";
import {MESSAGE} from "../../Util/Message";
import {LOG} from "../../Util/Log";
import {IEventHandler} from "../IEventHandler";
import {Keys} from "../../Data/Keys";

export class AutoReactions implements IEventHandler {
    readonly client: CustomClient;
    readonly autoReactions = new Collection<string, AAutoReaction>();
    readonly triggerWords: string[] = [];


    constructor(client: CustomClient) {
        this.client = client;
        this.setup(client);
    }

    private setup(client: CustomClient){
        const autoReactionFiles = fs.readdirSync('./src/Handler/AutoReaction/AutoReactions').filter((file: string) => file.endsWith('.ts'));
        for (const file of autoReactionFiles) {
            import(`./AutoReactions/${file}`)
                .then(({default: autoReaction}) => {
                    const ar: IAutoReaction = new autoReaction();
                    ar.setup(client).then((reaction) => {
                        this.autoReactions.set(reaction.name, reaction);

                        if (!this.triggerWords.some(v => v.includes(reaction.name))){
                            this.triggerWords.push(reaction.name);
                        }
                        reaction.aliases
                            .filter(alias => !this.triggerWords.some(v => v.includes(alias)))
                            .forEach(alias => this.triggerWords.push(alias));
                    });
                }).catch(console.log);

        }
    }

    public reload(){
        this.triggerWords.length = 0;
        this.autoReactions.forEach((autoReaction,k) => {
            autoReaction.setup(this.client).then((reaction) => {
                if (!this.triggerWords.some(v => v.includes(reaction.name))){
                    this.triggerWords.push(reaction.name);
                }
                reaction.aliases.forEach(alias => {
                    if (!this.triggerWords.some(v => v.includes(alias))) {
                        this.triggerWords.push(alias);
                    }
                });
            });
        })
    }

    public handleMessage(message: Message): Promise<void> {
        if (message.guild){
            if (message.client instanceof CustomClient) {
                const guildData = message.client.data.guilds.get(message.guild.id);
                const statusChannelId = message.client.data.settings.get(Keys.Settings.statusChannelId);
                if (message.channel.id === guildData.LOG_CHANNEL_ID || message.channel.id == statusChannelId) return Promise.resolve();
            } else {
                return Promise.resolve();
            }
        }

        return MESSAGE.parse(message)
            .then(parsedContent => {
                if (this.triggerWords.some(triggerWord => parsedContent.includes(triggerWord))){
                    return this.autoReactions
                        .filter((v,k) => parsedContent.includes(k) || v.aliases.some(alias => parsedContent.includes(alias)))
                        .array();
                }
                return [];
            }).then(triggered => {
                triggered.map((reaction: IAutoReaction) => {
                    reaction.execute(message)
                        .then(() => LOG.sendToLogChannel(this.client,`Ran ${reaction.name} for: ${message.url}`, false))
                        .catch(error => LOG.sendToLogChannel(this.client, error, false));
                })
            });
    }

}