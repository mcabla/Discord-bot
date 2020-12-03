module.exports = {
    name: 'acantha',
    aliases: false, // Can be an array of strings with aliases for this auto reaction
    description: 'reacts with Acantha emoji',
    execute(message) {
        const emoji = message.client.emojis.cache.find(emoji => emoji.name === "acantha");
        message.react(emoji);
    },
};