module.exports = {
    name: 'ping',
    description: 'Ping!',
    cooldown: 5,
    args: false,
    usage: false, // Can be a string with an explanation of the required arguments
    guildOnly: false,
    execute(message, args) {
        message.channel.send('Pong!');
    },
};