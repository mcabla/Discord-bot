module.exports = {
    name: 'bier',
    description: 'reacts with beer emoji',
    execute(message, client) {
        message.react('🍻');
    },
};