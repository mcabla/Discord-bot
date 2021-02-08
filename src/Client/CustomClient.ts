import {
    Client,
    GuildMember,
    Message,
    PartialGuildMember,
} from "discord.js";

import {AutoReactions} from "../Handler/AutoReaction/AutoReactions";
import {Commands} from "../Handler/Command/Commands";
import {PREFIX} from "../Config/Config";
import {LOG} from "../Util/Log";
import {Music} from "../Handler/Music/Music";

export class CustomClient extends Client {
    readonly music: Music;
    readonly autoReaction: AutoReactions;
    readonly command: Commands;

    constructor() {
        super();
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
        this.on('message', this.messageListener);
    }

    private readyListener = () => {
        LOG.sendToStatusChannel(this, `Logged in as ${this.user?.tag}!`)
            .then(() => {
                this.user?.setActivity(`${PREFIX}help`, {type: "LISTENING"});
            }).catch(console.log);
    };

    private warnListener = (error: string) => {
        LOG.sendToLogChannel(this, error, true).then();
    };

    private errorListener = (error: Error) => {
        LOG.sendToLogChannel(this, error.message, true).then();
    };

    private guildMemberUpdateListener = (oldMember: GuildMember | PartialGuildMember, newMember: GuildMember | PartialGuildMember) => {
        // If the role(s) are present on the old member object but no longer on the new one (i.e role(s) were removed)
        const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));
        if (removedRoles.size > 0) LOG.sendToLogChannel(this,`The roles ${removedRoles.map(r => r.name)} were removed from ${oldMember.displayName}.`).then();
        // If the role(s) are present on the new member object but are not on the old one (i.e role(s) were added)
        const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
        if (addedRoles.size > 0) LOG.sendToLogChannel(this,`The roles ${addedRoles.map(r => r.name)} were added to ${oldMember.displayName}.`).then();
    };

    private messageListener = (message: Message) => {
        this.command.handleMessage(message)
            .then(() => this.autoReaction.handleMessage(message))
            .then(() => this.music.handleMessage(message));
    };

}