import {CustomClient} from "../Client/CustomClient";
import fs from "fs";
import {IAutoReaction} from "./IAutoReaction";
import {Collection, Message} from "discord.js";
import {LOG_CHANNEL_ID, STATUS_CHANNEL_ID} from "../Config/Config";
import {AAutoReaction} from "./AAutoReaction";

export class AutoReactions {
    readonly client: CustomClient;
    readonly autoReactions = new Collection<string, AAutoReaction>();


    constructor(client: CustomClient) {
        this.client = client;
        this.setup(client);
    }

    private setup(client: CustomClient){
        const autoReactionFiles = fs.readdirSync('./src/AutoReaction/AutoReactions').filter((file: string) => file.endsWith('.ts'));
        for (const file of autoReactionFiles) {
            import(`./AutoReactions/${file}`)
                .then(({default: autoReaction}) => {
                    const ar: IAutoReaction = new autoReaction();
                    ar.setup(client);
                    this.autoReactions.set(ar.name, ar)
                }).catch(console.log);

        }
    }

    public addReactions(message: Message) {
        if (message.channel.id === LOG_CHANNEL_ID || message.channel.id == STATUS_CHANNEL_ID) return;

        let messageContent = message.content;
        message.mentions.users.forEach((k,v)=> {
            let displayName;
            if (message.guild !== null){
                displayName = message.guild.member(k)?.displayName;
            }
            displayName = displayName || k.tag || k.username;
            messageContent = messageContent.replace('<@!' + v + '>',displayName);
        });

        let messageContentLowerCase = messageContent.toLocaleLowerCase();
        if (this.autoReactions.some(autoReaction => messageContentLowerCase.includes(autoReaction.name) || (autoReaction.aliases?.length > 0 && autoReaction.aliases.includes(messageContentLowerCase)))) {
            for(const autoReaction of this.autoReactions.values()){
                if ((messageContentLowerCase.includes(autoReaction.name) || (autoReaction.aliases?.length > 0 && autoReaction.aliases.includes(messageContentLowerCase))) && !message.content.includes(`:${autoReaction.name}:`)) {
                    try {
                        autoReaction.execute(message);
                        this.client.sendToLogChannel(`reaction added to: "${message}" (${message.id})`);
                    } catch (error) {
                        this.client.sendToLogChannel(error, false);
                        console.error(error);
                    }
                }
            }
        }
    }

}