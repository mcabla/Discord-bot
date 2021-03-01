export namespace Keys {
    export enum Settings {
        owner = 'OWNER',
        ownerGuild = 'OWNER_GUILD',
        statusChannelId = 'STATUS_CHANNEL_ID',
        autoReactionsEmojisUrl = 'AUTO_REACTIONS_EMOJIS_URL',
        autoReactionsCommandsUrl = 'AUTO_REACTIONS_COMMANDS_URL',
        codexSongsUrl = 'CODEX_SONGS_URL'
    }

    export enum Guild {
        empty = '',
        name = 'NAME',
        id = 'ID',
        prefix = 'PREFIX',
        logChannelId = 'LOG_CHANNEL_ID',
        announcementChannelId = 'ANNOUNCEMENT_CHANNEL_ID',
        codexChannelId = 'CODEX_CHANNEL_ID',
        assistantChannelId = 'ASSISTANT_CHANNEL_ID',
        memeChannelId = 'MEME_CHANNEL_ID',
        triggers = 'TRIGGERS',
        randomPersonUrl = 'RANDOM_PERSON_URL',
        randomMemeUrl = 'RANDOM_MEME_URL'
    }
}