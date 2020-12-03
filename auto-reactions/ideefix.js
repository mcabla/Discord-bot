module.exports = {
    name: 'ideefix',
    description: 'reacts with Ideefix emoji',
    execute(message, client) {
        const emoji = client.emojis.cache.find(emoji => emoji.name === "ideefix");
        message.react(emoji);
    },
};