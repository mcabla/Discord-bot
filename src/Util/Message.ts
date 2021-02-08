import {Client, Emoji, Message, MessageEmbed, MessageReaction, NewsChannel, TextChannel} from "discord.js";
import {STRING} from "./String";
import {CustomClient} from "../Client/CustomClient";
import {GUILD_ID, MEME_CHANNEL_ID, RANDOM_MEME_URL} from "../Config/Config";
import {API} from "./Api";

interface IMeme {
    readonly id: number;
    readonly name: string;
    readonly photo: string;
}

export class MESSAGE{
    public static react(message: Message, emoji: string, originalMessage?: Message): Promise<MessageReaction> {
        if(!STRING.LETTERS.test(emoji)){
            return message.react(emoji);
        } else {
            let emj = message?.client.emojis.cache.find((emj: Emoji) => emj.name === emoji);
            if (emj != undefined) {
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

    public static meme(client: CustomClient): Promise<Message> {
        return Promise.all([this.getMemeChannel(client), this.getMeme()])
            .then(values => {
                const memeChannel: TextChannel | NewsChannel = values[0];
                const embed: MessageEmbed = values[1];
                return memeChannel.send(embed);
            });
    }

    private static getMeme(): Promise<MessageEmbed> {
        return API.get<IMeme>(RANDOM_MEME_URL)
            .then(meme => {
                const randomColor = Math.floor(Math.random()*0xffffff);
                return new MessageEmbed({
                    color: randomColor,
                    image: {
                        url: meme.photo
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