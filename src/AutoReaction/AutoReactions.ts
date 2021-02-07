import {CustomClient} from "../Client/CustomClient";
import fs from "fs";
import {IAutoReaction} from "./IAutoReaction";
import {Collection, Message} from "discord.js";
import {LOG_CHANNEL_ID, STATUS_CHANNEL_ID} from "../Config/Config";
import {AAutoReaction} from "./AAutoReaction";

export class AutoReactions {
    readonly client: CustomClient;
    readonly autoReactions = new Collection<string, AAutoReaction>();
    readonly triggerWords: string[] = [];


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
                    this.autoReactions.set(ar.name, ar);
                    this.triggerWords.push(ar.name);
                    ar.aliases.forEach(alias => this.triggerWords.push(alias));
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
        messageContent = messageContent.toLocaleLowerCase();

        this.triggerWords.forEach( triggerWord => {
           if (messageContent.includes(triggerWord)){
               console.log('message contains ' + triggerWord );
               this.autoReactions.forEach((v,k) => {
                   let found = false;
                   if (messageContent.includes(k)){
                       found = true;
                   } else {
                       for (const alias of v.aliases){
                           if (messageContent.includes(alias)){
                               found = true;
                               break;
                           }
                       }
                   }
                   if (found){
                       try {
                           v.execute(message);
                           this.client.sendToLogChannel(`reaction added to: "${message}" (${message.id})`);
                       } catch (error) {
                           this.client.sendToLogChannel(error, false);
                       }
                   }
               });
           }
        });
    }

}