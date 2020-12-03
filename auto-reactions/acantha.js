module.exports = {
    name: 'acantha',
    description: 'reacts with Acantha emoji',
    execute(message, client) {
        const emoji = client.emojis.cache.find(emoji => emoji.name === "acantha");
        message.react(emoji);
    },
};