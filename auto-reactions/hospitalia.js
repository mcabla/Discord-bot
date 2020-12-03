module.exports = {
    name: 'hospitalia',
    description: 'reacts with Hospitalia emoji',
    execute(message, client) {
        const emoji = client.emojis.cache.find(emoji => emoji.name === "hospitalia");
        message.react(emoji);
    },
};