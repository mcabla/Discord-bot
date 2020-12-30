const {callAssistant} = require("../watson");
module.exports = {
    name: 'watson',
    aliases: false, // Can be an array of strings with aliases for this command
    description: 'AI assistant',
    cooldown: 1,
    args: true,
    usage: "[Tekst die je aan IBM's Watson Assistant wil meegeven.]", // Can be a string with an explanation of the required arguments
    guildOnly: false,
    execute(message, args) {
        args = args.join(' ');
        callAssistant(args).then(txt => {
            txt = txt.replace('{user}', message.author);
            message.channel.send(txt);
        });
    },
};