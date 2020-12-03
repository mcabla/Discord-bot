module.exports = {
    name: 'ping',
    aliases: false, // Can be an array of strings with aliases for this command
    description: 'Ping!',
    cooldown: 5,
    args: false,
    usage: false, // Can be a string with an explanation of the required arguments
    guildOnly: false,
    execute(message, args) {
        message.channel.send('Pong!');
    },
};