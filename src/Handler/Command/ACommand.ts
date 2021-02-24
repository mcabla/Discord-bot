import {Message} from "discord.js";
import {ICommand} from "./ICommand";
import {CustomClient} from "../../Client/CustomClient";
import {GuildData} from "../../Data/GuildData";
import {Keys} from "../../Data/Keys";

export abstract class ACommand implements ICommand {
    readonly abstract name: string;
    readonly abstract description: string;
    readonly abstract usage: string; // Can be a string with an explanation of the required arguments
    readonly aliases: string[] = []; // Can be an array of strings with aliases for this command
    readonly args: string[] = [];
    readonly cooldown: number = 5;
    readonly guildOnly: boolean = false;
    readonly permissions: any[] = [];
    readonly bypassChannelIds: string[] = [];
    readonly bypassChannelIdKey: Keys.Guild = Keys.Guild.empty;
    private isSetup: boolean = false;

    abstract execute(message: Message, args: string[]): void;

    setup(client: CustomClient): Promise<ICommand> {
        if (this.bypassChannelIdKey != Keys.Guild.empty) {
            this.bypassChannelIds.length = 0;
            // @ts-ignore
            client.data.guilds.array().forEach( guildData => {
                this.addGuild(guildData);
            });
            if (!this.isSetup) {
                client.data.changes.on('changed', this.guildDataChangeListener)
            }
        }
        this.isSetup = true;
        return Promise.resolve(this);
    }

    private guildDataChangeListener = (keyName: string, oldValue: GuildData, newValue: GuildData) => {
        // @ts-ignore
        if (oldValue[this.bypassChannelIdKey] !== newValue[this.bypassChannelIdKey]){
            this.removeGuild(oldValue);
            this.addGuild(newValue);
        }
    };

    private addGuild = (guildData: GuildData) => {
        // @ts-ignore
        const channelId = guildData[this.bypassChannelIdKey];
        if (channelId && channelId.length > 0 && !this.bypassChannelIds.some(item => item === channelId)) {
            this.bypassChannelIds.push(channelId);
        }
    };

    private removeGuild = (guildData: GuildData) => {
        // @ts-ignore
        const channelId = guildData[this.bypassChannelIdKey];
        this.bypassChannelIds.forEach((item, index)=> {
            if (item === channelId) this.bypassChannelIds.splice(index,1);
        });
    };
}