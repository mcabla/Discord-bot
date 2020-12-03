// Run dotenv
require('dotenv').config();

const fs = require('fs');
const Discord = require('discord.js');
const config = require('./config.json');
const prefix = config.prefix;
const client = new Discord.Client();

client.autoReactions = new Discord.Collection();
const autoReactionFiles = fs.readdirSync('./auto-reactions').filter(file => file.endsWith('.js'));
for (const file of autoReactionFiles) {
    const autoReaction = require(`./auto-reactions/${file}`);
    client.autoReactions.set(autoReaction.name, autoReaction);
}

client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});


client.on('message', message => {
    addReactions(message);
    executeCommand(message);
});

client.login(process.env.DISCORD_TOKEN);

function addReactions(message) {
    let messageContentLowerCase = message.content.toLowerCase();
    if (client.autoReactions.keyArray().some(reactionName => messageContentLowerCase.includes(reactionName))) {
        for(const reactionName of client.autoReactions.keyArray()){
            console.log(`${reactionName}!`);
            if (messageContentLowerCase.includes(reactionName) && !message.content.includes(`:${reactionName}:`)) {
                const autoReaction = client.autoReactions.get(reactionName);
                try {
                    autoReaction.execute(message, client);
                } catch (error) {
                    console.error(error);
                }
            }
        }
    }
}

function executeCommand(message){
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    if (!client.commands.has(commandName)) return;
    const command = client.commands.get(commandName);

    try {
        command.execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply('there was an error trying to execute that command!');
    }
}