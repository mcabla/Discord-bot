import {GUILD_ID, LOG_CHANNEL_ID, STATUS_CHANNEL_ID} from "../Config/Config";
import {Channel, Client, Message, PartialTextBasedChannelFields} from "discord.js";

export class LOG{
    public static sendToChannel(client: Client, channelId: string, str: string, currentChannel?: Channel, guildId?: string): Promise<Message> {
        if (currentChannel && currentChannel.id === LOG_CHANNEL_ID) return Promise.reject("Not allowed to log logging channel.");
        try {
            if (guildId == undefined) guildId = GUILD_ID;
            // @ts-ignore
            const guilds = client.guilds.cache.get(guildId);
            if (!guilds) throw new Error(`Guild (${guildId}) not found`);
            let channel = guilds.channels.cache.get(channelId);
            if (!channel || !channel.isText()) throw new Error(`Channel (${channelId}) not found`);
            const txtChannel: PartialTextBasedChannelFields = channel;
            return txtChannel.send(str);
        } catch (error) {
            console.log(error);
            return Promise.reject(error)
        }
    }

    public static sendToStatusChannel(client: Client, str: string, consoleLog?: boolean, currentChannel?: Channel): Promise<Message> {
        if (consoleLog == undefined || consoleLog) console.log(str);
        return LOG.sendToChannel(client, STATUS_CHANNEL_ID, str, currentChannel);
    }

    public static sendToLogChannel(client: Client, str: string, consoleLog?: boolean, currentChannel?: Channel): Promise<Message> {
        if (consoleLog == undefined || consoleLog) console.log(str);
        return LOG.sendToChannel(client, LOG_CHANNEL_ID, str, currentChannel);
    }
}