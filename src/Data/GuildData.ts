import {Snowflake} from "discord.js";

export type GuildData = {
    NAME: string,
    ID: Snowflake,
    PREFIX: string,
    LOG_CHANNEL_ID: string,
    ANNOUNCEMENT_CHANNEL_ID: string,
    CODEX_CHANNEL_ID: string,
    ASSISTANT_CHANNEL_ID: string,
    MEME_CHANNEL_ID: string,
    TRIGGERS: false,
    RANDOM_PERSON_URL: string,
    RANDOM_MEME_URL: string,
}