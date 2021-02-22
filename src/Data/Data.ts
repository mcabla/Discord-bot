import {CustomClient} from "../Client/CustomClient";
import {Keys} from "./Keys";
import * as Config from "./Config/Config";
import {Collection, Guild, Snowflake} from "discord.js";
import {GuildData} from "./GuildData";
import EventEmitter from "events";
const Enmap = require("enmap");

const dataDir = "./src/Data/Store"
export class Data{
    private readonly client: CustomClient;
    public update = new EventEmitter();

    constructor(client: CustomClient) {
        this.client = client;
        this.setup(client);
    }

    readonly settings = new Enmap({
        name: "settings",
        autoFetch: true,
        fetchAll: true,
        cloneLevel: 'deep',
        dataDir: dataDir
    });

    readonly guilds = new Enmap({
        name: "guilds",
        autoFetch: true,
        fetchAll: false,
        cloneLevel: 'deep',
        dataDir: dataDir
    });

    private setup(client: CustomClient) {
        this.setupSettings();
    }

    private setupSettings(){
        this.setSettingIfUndefined(Keys.Settings.owner, Config.OWNER, true);
        this.setSettingIfUndefined(Keys.Settings.ownerGuild, Config.OWNER_GUILD, true);
        this.setSettingIfUndefined(Keys.Settings.statusChannelId, Config.STATUS_CHANNEL_ID, true);
        this.setSettingIfUndefined(Keys.Guild.prefix, Config.PREFIX, true);
        this.setSettingIfUndefined(Keys.Guild.logChannelId, Config.LOG_CHANNEL_ID, true);
        this.setSettingIfUndefined(Keys.Guild.randomPersonUrl, Config.RANDOM_PERSON_URL, false);
        this.setSettingIfUndefined(Keys.Guild.randomMemeUrl, Config.RANDOM_MEME_URL, true);
        this.setSettingIfUndefined(Keys.Guild.codexSongsUrl, Config.CODEX_SONGS_URL, true);
    }

    private setSettingIfUndefined(key: string, value: string | number | boolean | undefined, required: boolean) {
        if (!this.settings.has(key)){
            if (required && (value === undefined || value === '')){
                throw new Error(`Value of ${key} is empty in config.`);
            }
            this.settings.set(key, value);
        }
    }

    private updatedGuild(oldGuildData: GuildData, newGuildData: GuildData) {
        this.update.emit('addedGuild', oldGuildData, newGuildData);
    }

    public updateGuildChannels(guildId: Snowflake, channelKey: Keys.Guild, channelId: Snowflake){
        if (this.guilds.has(guildId)) {
            const newData = this.guilds.get(guildId);
            const oldData = newData.clone(); //TODO check deep clone

            newData.channels.set(channelKey, channelId);

            this.updatedGuild(oldData, newData);

        }
    }

    public addGuild(guild: Guild){
        if (!this.guilds.has(guild.id)) {
            const channels = new Collection<Keys.Guild, Snowflake>();
            channels.set(Keys.Guild.logChannelId, '');
            channels.set(Keys.Guild.announcementChannelId, '');
            channels.set(Keys.Guild.codexChannelId, '');
            channels.set(Keys.Guild.assistantChannelId, '');
            channels.set(Keys.Guild.memeChannelId, '');

            const guildData: GuildData = {
                name: guild.name,
                id: guild.id,
                prefix: this.settings.get(Keys.Guild.prefix),
                channels,
                apis: {
                    randomPerson: this.settings.get(Keys.Guild.randomPersonUrl),
                    randomMeme: this.settings.get(Keys.Guild.randomMemeUrl),
                    codexSongs: this.settings.get(Keys.Guild.codexSongsUrl),
                }
            }
            this.guilds.set(guild.id, guildData);
            this.update.emit('addedGuild', guildData);
        } else {
            throw new Error(`Guild (${guild.id}) already has a datastore.`);
        }
    }

    public removeGuild(guild: Guild){
        const guildData = this.guilds.get(guild.id);
        this.guilds.delete(guild.id);
        this.update.emit('removedGuild', guildData);
    }
}