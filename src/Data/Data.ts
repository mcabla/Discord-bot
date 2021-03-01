import {CustomClient} from "../Client/CustomClient";
import {Keys} from "./Keys";
import * as Config from "./Config/Config";
import {Guild, Snowflake} from "discord.js";
import {GuildData} from "./GuildData";
import EventEmitter from "events";
const Enmap = require("enmap");

const dataDir = "./src/Data/Store"
export class Data{
    private readonly client: CustomClient;
    public changes = new EventEmitter();

    constructor(client: CustomClient) {
        this.client = client;
        this.setupSettings();
        this.guilds = new Enmap({
            name: "guilds",
            autoFetch: true,
            fetchAll: true,
            cloneLevel: 'deep',
            dataDir: dataDir,
            autoEnsure: {
                NAME: '',
                ID: '',
                PREFIX: this.settings.get(Keys.Guild.prefix),
                LOG_CHANNEL_ID: '',
                ANNOUNCEMENT_CHANNEL_ID: '',
                CODEX_CHANNEL_ID: '',
                ASSISTANT_CHANNEL_ID: '',
                MEME_CHANNEL_ID: '',
                TRIGGERS: false,
                RANDOM_PERSON_URL: this.settings.get(Keys.Guild.randomPersonUrl),
                RANDOM_MEME_URL: this.settings.get(Keys.Guild.randomMemeUrl),
            }
        });
        this.guilds.changed(this.guildDataChangeListener);
    }

    readonly settings = new Enmap({
        name: "settings",
        autoFetch: true,
        fetchAll: true,
        cloneLevel: 'deep',
        dataDir: dataDir
    });

    readonly guilds;

    private guildDataChangeListener = (keyName: string, oldValue: GuildData, newValue: GuildData) => {
        this.changes.emit('changed', keyName, oldValue, newValue);
    };

    private setupSettings(){
        this.setSettingIfUndefined(Keys.Settings.owner, Config.OWNER, true);
        this.setSettingIfUndefined(Keys.Settings.ownerGuild, Config.OWNER_GUILD, true);
        this.setSettingIfUndefined(Keys.Settings.statusChannelId, Config.STATUS_CHANNEL_ID, true);
        this.setSettingIfUndefined(Keys.Guild.prefix, Config.PREFIX, true);
        this.setSettingIfUndefined(Keys.Guild.logChannelId, Config.LOG_CHANNEL_ID, true);
        this.setSettingIfUndefined(Keys.Guild.randomPersonUrl, Config.RANDOM_PERSON_URL, false);
        this.setSettingIfUndefined(Keys.Guild.randomMemeUrl, Config.RANDOM_MEME_URL, true);
        this.setSettingIfUndefined(Keys.Settings.codexSongsUrl, Config.CODEX_SONGS_URL, true);
        this.setSettingIfUndefined(Keys.Settings.autoReactionsEmojisUrl, Config.AUTO_REACTIONS_EMOJIS_URL, true);
        this.setSettingIfUndefined(Keys.Settings.autoReactionsCommandsUrl, Config.AUTO_REACTIONS_COMMANDS_URL, true);
    }

    private setSettingIfUndefined(key: string, value: string | number | boolean | undefined, required: boolean) {
        if (!this.settings.has(key)){
            if (required && (value === undefined || value === '')){
                throw new Error(`Value of ${key} is empty in config.`);
            }
            this.settings.set(key, value);
        }
    }

    public updateGuildValue(guildId: Snowflake, key: string, value: string){
        if (this.guilds.has(guildId)) {
            const newData: GuildData = this.guilds.get(guildId);
            // @ts-ignore
            newData[key] =  value.trim();

            this.guilds.set(guildId, newData);
        }
    }

    public getGuildValue(guildId: Snowflake, key: string): string {
        if (this.guilds.has(guildId)) {
            const newData: GuildData = this.guilds.get(guildId);
            // @ts-ignore
            return newData[key] || '';
        } else {
            return '';
        }
    }

    public addGuild(guild: Guild){
        const newData: GuildData = this.guilds.get(guild.id);
        newData.NAME =  guild.name;
        newData.ID =  guild.name;
        this.guilds.set(guild.id, newData);
    }

    public removeGuild(guild: Guild){
        this.guilds.delete(guild.id);
    }
}