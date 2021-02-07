import {Channel, Client, Collection, PartialTextBasedChannelFields} from "discord.js";
import {AAutoReaction} from "../AutoReaction/AAutoReaction";
import {ACommand} from "../Command/ACommand";
import {AutoReactions} from "../AutoReaction/AutoReactions";
import {Commands} from "../Command/Commands";
import {GUILD_ID, LOG_CHANNEL_ID, PREFIX, STATUS_CHANNEL_ID} from "../Config/Config";

export class CustomClient extends Client {
    readonly musicQueue = new Collection();
    readonly autoReaction: AutoReactions;
    readonly command: Commands;

    constructor() {
        super();
        this.autoReaction = new AutoReactions(this);
        this.command = new Commands(this);
        this.setup();
    }

    private setup() {
        this.on('ready', () => {
            this.sendToStatusChannel(`Logged in as ${this.user?.tag}!`);
            this.user?.setActivity(`${PREFIX}help`, { type: "LISTENING" });
        });
        this.on("warn", error => {
            this.sendToLogChannel(error, false);
            console.log(error);
        });
        this.on("error", error => {
            this.sendToLogChannel(error.message, false);
            console.log(error);
        });
        this.on('guildMemberUpdate', (oldMember, newMember) => {
            // If the role(s) are present on the old member object but no longer on the new one (i.e role(s) were removed)
            const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));
            if (removedRoles.size > 0) this.sendToLogChannel(`The roles ${removedRoles.map(r => r.name)} were removed from ${oldMember.displayName}.`);
            // If the role(s) are present on the new member object but are not on the old one (i.e role(s) were added)
            const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
            if (addedRoles.size > 0) this.sendToLogChannel(`The roles ${addedRoles.map(r => r.name)} were added to ${oldMember.displayName}.`);
        });
        this.on('message', (message) => {
            this.autoReaction.addReactions(message);
            this.command.executeCommand(message);
        });
    }

    public sendToStatusChannel(str: string, consoleLog?: boolean, currentChannel?: Channel){
        if (consoleLog == undefined || consoleLog) console.log(str);
        this.sendToChannel(STATUS_CHANNEL_ID, str, currentChannel);
    }

    public sendToLogChannel(str: string, consoleLog?: boolean, currentChannel?: Channel){
        if (consoleLog == undefined || consoleLog) console.log(str);
        this.sendToChannel(LOG_CHANNEL_ID, str, currentChannel);
    }

    public sendToChannel(channelId: string, str: string, currentChannel?: Channel, guildId?: string){
        if (currentChannel && currentChannel.id === LOG_CHANNEL_ID) return;
        try {
            if (guildId == undefined) guildId = GUILD_ID;
            // @ts-ignore
            const guilds = this.guilds.cache.get(guildId);
            if (!guilds) throw new Error(`Guild (${guildId}) not found`);
            let channel = guilds.channels.cache.get(channelId);
            if (!channel || !channel.isText()) throw new Error(`Channel (${channelId}) not found`);
            const txtChannel: PartialTextBasedChannelFields = channel;
            txtChannel.send(str).then();
        } catch (error) {
            console.log(error);
        }
    }

}