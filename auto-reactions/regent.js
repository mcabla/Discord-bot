module.exports = {
    name: 'regent',
    aliases: false, // Can be an array of strings with aliases for this auto reaction
    description: 'reacts with reGent emoji',
    execute(message) {
        const emoji = message.client.emojis.cache.find(emoji => emoji.name === "regent");
        message.react(emoji);
    },
};