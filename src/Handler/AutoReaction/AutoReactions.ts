import {CustomClient} from "../../Client/CustomClient";
import fs from "fs";
import {IAutoReaction} from "./IAutoReaction";
import {Collection, Message} from "discord.js";
import {LOG_CHANNEL_ID, STATUS_CHANNEL_ID} from "../../Config/Config";
import {AAutoReaction} from "./AAutoReaction";
import {MESSAGE} from "../../Util/Message";
import {LOG} from "../../Util/Log";
import {IEventHandler} from "../IEventHandler";

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
                        reaction.aliases.forEach(alias => {
                            if (!this.triggerWords.some(v => v.includes(alias))) {
                                this.triggerWords.push(alias);
                            }
                        });
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
        if (message.channel.id === LOG_CHANNEL_ID || message.channel.id == STATUS_CHANNEL_ID) return Promise.resolve();

        return MESSAGE.parse(message)
            .then(parsedContent => {
                let triggered: IAutoReaction[] = [];
                this.triggerWords.forEach( triggerWord => {
                    if (parsedContent.includes(triggerWord)){
                        this.autoReactions.forEach((v,k) => {
                            if (parsedContent.includes(k)){
                                triggered.push(v);
                            } else {
                                for (const alias of v.aliases){
                                    if (parsedContent.includes(alias)){
                                        triggered.push(v);
                                        break;
                                    }
                                }
                            }
                        });
                    }
                });
                return triggered;
            }).then(triggered => {
                triggered.map((reaction: IAutoReaction) => {
                    reaction.execute(message)
                        .then(() => LOG.sendToLogChannel(this.client,`Auto reacted to: "${message}" (${message.id})`))
                        .catch(error => LOG.sendToLogChannel(this.client, error, false));
                })
            });
    }

}