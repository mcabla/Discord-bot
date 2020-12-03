module.exports = {
    name: 'bier',
    aliases: ['beer'],
    description: 'reacts with beer emoji',
    execute(message) {
        message.react('🍻');
    },
};