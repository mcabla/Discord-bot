import {LOG_CHANNEL_ID, OWNER_GUILD, STATUS_CHANNEL_ID} from "../Data/Config/Config";
import {Channel, Client, GuildChannel, Message, PartialTextBasedChannelFields} from "discord.js";
import {CustomClient} from "../Client/CustomClient";
import {Keys} from "../Data/Keys";

export class LOG{
    public static sendToChannel(client: Client, channelId: string, str: string, currentChannel?: Channel, guildId?: string): Promise<Message> {
        if (currentChannel && currentChannel.id === channelId) return Promise.reject("Not allowed to log logging channel.");
        try {
            if (guildId == undefined) guildId = OWNER_GUILD;
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
        if (client instanceof CustomClient && currentChannel instanceof GuildChannel){
            const guildId = currentChannel.guild.id;
            const channelId = client.data.getGuildValue(guildId, Keys.Guild.logChannelId);
            if (channelId !== ''){
                return LOG.sendToChannel(client, channelId, str, currentChannel, guildId);
            }
        }
        return LOG.sendToChannel(client, LOG_CHANNEL_ID, str, currentChannel);
    }
}