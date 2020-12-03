module.exports = {
    name: 'ping',
    description: 'Ping!',
    cooldown: 5,
    args: true,
    usage: false, // Can be a string with an explanation of the required arguments
    guildOnly: false,
    execute(message, args) {
        message.channel.send('Pong!');
    },
};