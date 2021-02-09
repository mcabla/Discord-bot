import {Client, Emoji, Message, MessageEmbed, MessageReaction, NewsChannel, Snowflake, TextChannel} from "discord.js";
import {STRING} from "./String";
import {CustomClient} from "../Client/CustomClient";
import {GUILD_ID, MEME_CHANNEL_ID, RANDOM_MEME_URL} from "../Config/Config";
import {API} from "./Api";
import {WEBHOOK} from "./Webhook";

interface IMeme {
    readonly id: number;
    readonly name: string;
    readonly photo: string;
}

interface IMessageLocation {
    readonly guildID: Snowflake;
    readonly channelID: Snowflake;
    readonly messageID: Snowflake;
}

export class MESSAGE {
    public static getLocationFromUrl(url: string): Promise<IMessageLocation>{
        const groups = url.match(/(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li|com))\/([a-zA-z]*)\/(\d*)\/(\d*)\/(\d*)/);
        if (groups) {
            const location: IMessageLocation = {
                 guildID: groups[groups.length-3],
                 channelID: groups[groups.length-2],
                 messageID: groups[groups.length-1]
             };
             return Promise.resolve(location);
        }
        return Promise.reject('Url is incorrect.');
    }

    public static getFromUrl(client: Client, url: string)/*: Promise<Message>*/ {
        return MESSAGE.getLocationFromUrl(url)
            .then(location => client.guilds.fetch(location.guildID)
                    .then(guild => guild.channels.resolve(location.channelID))
                    .then(channel => {
                        if (channel?.isText()){
                            return channel;
                        }
                        throw Error("Channel not found or is not a text channel.");
                    }).then(channel => channel.messages.fetch(location.messageID))
            );
    }

    public static react(message: Message, emoji: string, originalMessage?: Message): Promise<MessageReaction> {
        console.log('react');
        if(!STRING.LETTERS.test(emoji)){
            console.log('emoji')
            return message.react(emoji);
        } else {
            console.log('searching');
            let emj = message?.client.emojis.cache.find((emj: Emoji) => emj.name === emoji);
            if (emj != undefined) {
                console.log('found');
                return message.react(emj);
            } else {
                originalMessage?.reply(`${emoji} does not exist.`).then();
            }
        }
        return Promise.reject();
    }

    public static parse(message: Message): Promise<string> {
        let messageContent = message.content;
        message.mentions.users.forEach((v,k)=> {
            let displayName;
            if (message.guild !== null){
                displayName = message.guild.member(v)?.displayName;
            }
            displayName = displayName || v.tag || v.username;
            messageContent = messageContent.replace('<@!' + k + '>',displayName);
        });
        messageContent = messageContent.toLocaleLowerCase();

        return Promise.resolve(messageContent);
    }

    public static meme(client: Client): Promise<Message> {
        return Promise.all([this.getMemeChannel(client), this.getMeme()])
            .then(values =>  WEBHOOK.send(values[0],'', values[1]));
    }

    private static getMeme(): Promise<MessageEmbed> {
        return API.get<IMeme>(RANDOM_MEME_URL)
            .then(meme => {
                const randomColor = Math.floor(Math.random()*0xffffff);
                return new MessageEmbed({
                    color: randomColor,
                    image: {
                        url: meme.photo.trim().replace(/\s/g, '%20')
                    },
                    timestamp: new Date(),
                });
            })
    }

    private static getMemeChannel(client: Client): Promise<TextChannel | NewsChannel>{
        return client.guilds.fetch(GUILD_ID)
            .then(guild => guild.channels.resolve(MEME_CHANNEL_ID))
            .then(channel => {
                if (channel) return channel;
                throw Error("Meme Channel not found.");
            })
            .then(guildChannel => {
                if (guildChannel.isText()) return guildChannel;
                throw Error("Meme Channel is not a text channel.");
            });
    }
}