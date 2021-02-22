import {Collection, Snowflake} from "discord.js";
import {Keys} from "./Keys";

export type GuildData = {
    name: string,
    id: Snowflake,
    prefix: string,
    channels: Collection<Keys.Guild, Snowflake>,
    apis: {
        randomPerson: string,
        randomMeme: string,
        codexSongs: string
    }
}