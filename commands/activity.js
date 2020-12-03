module.exports = {
    name: 'activity',
    description: 'Ping!',
    cooldown: 5,
    execute(message, args) {
        message.client.user.setActivity(args.join(' '));
    },
};