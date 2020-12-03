module.exports = {
    name: 'ideefix',
    aliases: ['club'],
    description: 'reacts with Ideefix emoji',
    execute(message) {
        const emoji = message.client.emojis.cache.find(emoji => emoji.name === "ideefix");
        message.react(emoji);
    },
};