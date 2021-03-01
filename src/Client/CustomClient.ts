import {
    Client, Guild,
    GuildMember,
    Message,
    PartialGuildMember,
} from "discord.js";

import {AutoReactions} from "../Handler/AutoReaction/AutoReactions";
import {Commands} from "../Handler/Command/Commands";
import {LOG} from "../Util/Log";
import {Music} from "../Handler/Music/Music";
import {Messages} from "../Util/Messages";
import {Data} from "../Data/Data";
import {Keys} from "../Data/Keys";

export class CustomClient extends Client {
    readonly music: Music;
    readonly autoReaction: AutoReactions;
    readonly command: Commands;
    readonly data: Data;

    constructor() {
        super();
        this.data = new Data(this);
        this.music = new Music(this);
        this.autoReaction = new AutoReactions(this);
        this.command = new Commands(this);
        this.setup();
    }

    private setup() {
        this.on('ready', this.readyListener);
        this.on("warn", this.warnListener);
        this.on("error", this.errorListener);
        this.on('guildMemberUpdate', this.guildMemberUpdateListener);
        this.on('guildCreate', this.guildCreateListener);
        this.on('guildDelete', this.guildRemoveListener);
        this.on('message', this.messageListener);
    }

    private readyListener = () => {
        LOG.sendToStatusChannel(this, `Logged in as ${this.user?.tag}!`)
            .then(() => {
                this.user?.setActivity(`${this.data.settings.get(Keys.Guild.prefix)}codex`, {type: "LISTENING"});

            }).then(() => {
                const guilds = this.guilds.cache.map(guild => guild);
                guilds.forEach(guild => {
                    if (!this.data.guilds.has(guild.id)){
                        LOG.sendToLogChannel(this,`Guild <${guild.name}> (${guild.id}) does not yes exist in the datastore.`, true).then();
                        this.data.addGuild(guild);
                    }
                })
            }).then(() => {
                this.setIntervals();
            }).catch(console.log);
    };

    private warnListener = (error: string) => {
        LOG.sendToLogChannel(this, error, true).then();
    };

    private errorListener = (error: Error) => {
        LOG.sendToLogChannel(this, error.message, true).then();
    };

    private guildMemberUpdateListener = (oldMember: GuildMember | PartialGuildMember, newMember: GuildMember | PartialGuildMember) => {
        const firstGuildChannel = oldMember.guild.channels.valueOf().first(); // Hopefully this isn't the logging channel.
        // If the role(s) are present on the old member object but no longer on the new one (i.e role(s) were removed)
        const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));
        if (removedRoles.size > 0) LOG.sendToLogChannel(this,`The roles ${removedRoles.map(r => r.name)} were removed from ${oldMember.displayName}.`, false, firstGuildChannel).then();
        // If the role(s) are present on the new member object but are not on the old one (i.e role(s) were added)
        const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
        if (addedRoles.size > 0) LOG.sendToLogChannel(this,`The roles ${addedRoles.map(r => r.name)} were added to ${oldMember.displayName}.`, false, firstGuildChannel).then();
    };

    private guildCreateListener = (guild: Guild) => {
        LOG.sendToStatusChannel(this,`Joined a new guild: ${guild.name}`).then();
        this.data.addGuild(guild);
    };

    private guildRemoveListener = (guild: Guild) => {
        LOG.sendToStatusChannel(this,`Left a guild: ${guild.name}`).then();
        this.data.removeGuild(guild);
    };

    private messageListener = (message: Message) => {
        this.command.handleMessage(message)
            .then(() => this.autoReaction.handleMessage(message))
            .then(() => this.music.handleMessage(message))
            .catch(console.log);
    };

    private setIntervals() {
        this.setInterval(this.meme, 2*60*60*1000);
    }

    private meme = () => {
        const guilds = this.guilds.cache.map(guild => guild);
        guilds.forEach(guild => {
            if (this.data.guilds.has(guild.id) && this.data.guilds.get(guild.id).TRIGGERS === 'true' && this.data.guilds.get(guild.id).MEME_CHANNEL_ID.length > 0) {
                this.guilds.fetch(guild.id)
                    .then(guild => guild.channels.cache
                        .filter((channel) => channel.type === 'voice')
                        .some((channel) => channel.members.size > 1))
                    .then((shouldMeme) => {
                        if (shouldMeme && this.data.guilds.has(guild.id)) {
                            return Messages.meme(this, guild.id);
                        } else {
                            return;
                        }
                    })
                    .catch(console.log);
            }
        });
    }
}