require('dotenv').config();
import config from '../../../config.json';

export const OWNER: string = process.env.OWNER || config.owner;//
export const OWNER_GUILD: string = process.env.OWNER_GUILD || config.ownerGuild;//
export const PREFIX: string = process.env.PREFIX || config.prefix;//
export const LOG_CHANNEL_ID: string = process.env.LOG_CHANNEL_ID || config.logChannelId;//
export const STATUS_CHANNEL_ID: string = process.env.STATUS_CHANNEL_ID || config.statusChannelId;//
export const RANDOM_PERSON_URL: string = process.env.RANDOM_PERSON_URL || config.randomPersonUrl;



export const ANNOUNCEMENT_CHANNEL_ID: string = process.env.ANNOUNCEMENT_CHANNEL_ID || config.announcementChannelId;
export const CODEX_CHANNEL_ID: string = process.env.CODEX_CHANNEL_ID || config.codexChannelId;
export const RANDOM_MEME_URL: string = process.env.RANDOM_MEME_URL || config.randomMemeUrl;
export const CODEX_SONGS_URL: string = process.env.CODEX_SONGS_URL || config.codexSongsUrl;
export const AUTO_REACTIONS_EMOJIS_URL: string = process.env.AUTO_REACTIONS_EMOJIS_URL || config.autoReactionsEmojisUrl;
export const AUTO_REACTIONS_COMMANDS_URL: string = process.env.AUTO_REACTIONS_COMMANDS_URL || config.autoReactionsCommandsUrl;
export const GUILD_ID: string = process.env.GUILD_ID || config.guildId;


export const DISCORD_TOKEN: string = process.env.DISCORD_TOKEN || config.discordToken;

export const ASSISTANT_ID: string = process.env.ASSISTANT_ID || config.assistantId;
export const ASSISTANT_CHANNEL_ID: string = process.env.ASSISTANT_CHANNEL_ID || config.assistantChannelId;
export const ASSISTANT_TTS_URL: string = process.env.ASSISTANT_TTS_URL || config.assistantTTSUrl;
export const ASSISTANT_TTS_API_KEY = process.env.ASSISTANT_TTS_API_KEY || config.assistantTTSApiKey;
export const ASSISTANT_STT_URL: string = process.env.ASSISTANT_STT_URL || config.assistantSTTUrl;
export const ASSISTANT_STT_API_KEY: string = process.env.ASSISTANT_STT_API_KEY || config.assistantSTTApiKey;
