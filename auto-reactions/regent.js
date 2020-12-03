module.exports = {
    name: 'regent',
    description: 'reacts with reGent emoji',
    execute(message, client) {
        const emoji = client.emojis.cache.find(emoji => emoji.name === "regent");
        message.react(emoji);
    },
};