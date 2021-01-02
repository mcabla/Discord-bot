require('dotenv').config();
import config from '../../config.json';

export const PREFIX = process.env.PREFIX || config.prefix;
export const LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID || config.logChannelId;
export const STATUS_CHANNEL_ID = process.env.STATUS_CHANNEL_ID || config.statusChannelId;
export const GUILD_ID = process.env.GUILD_ID || config.guildId;
export const DISCORD_TOKEN = process.env.DISCORD_TOKEN || config.discordToken;
export const ASSISTANT_ID = process.env.ASSISTANT_ID || config.assistantId;
export const ASSISTANT_TTS_URL = process.env.ASSISTANT_TTS_URL || config.assistantTTSUrl;
export const ASSISTANT_TTS_API_KEY = process.env.ASSISTANT_TTS_API_KEY || config.assistantTTSApiKey;
export const ASSISTANT_STT_URL = process.env.ASSISTANT_STT_URL || config.assistantSTTUrl;
export const ASSISTANT_STT_API_KEY = process.env.ASSISTANT_STT_API_KEY || config.assistantSTTApiKey;