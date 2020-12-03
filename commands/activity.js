module.exports = {
    name: 'activity',
    description: 'Set the bot\'s activity!',
    cooldown: 5,
    execute(message, args) {
        message.client.user.setActivity(args.join(' '));
    },
};