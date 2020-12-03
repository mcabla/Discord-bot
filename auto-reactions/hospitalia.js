module.exports = {
    name: 'hospitalia',
    aliases: false, // Can be an array of strings with aliases for this auto reaction
    description: 'reacts with Hospitalia emoji',
    execute(message, client) {
        const emoji = client.emojis.cache.find(emoji => emoji.name === "hospitalia");
        message.react(emoji);
    },
};