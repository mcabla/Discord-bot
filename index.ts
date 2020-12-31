import {Collection, Message, PartialTextBasedChannelFields, TextChannel} from "discord.js";
import {CustomClient} from "./CustomClient";
import * as fs from "fs";
import {DISCORD_TOKEN, GUILD_ID, LOG_CHANNEL_ID, PREFIX, STATUS_CHANNEL_ID} from "./config";
import {IAutoReaction} from "./IAutoReaction";
import {ICommand} from "./ICommand";

// const fetch = require('node-fetch');
const prefix = PREFIX;
const client = new CustomClient();
const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const autoReactionFiles = fs.readdirSync('./auto-reactions').filter((file: string) => file.endsWith('.ts'));
for (const file of autoReactionFiles) {
    import(`./auto-reactions/${file}`)
        .then(({default: autoReaction}) => {
            const ar: IAutoReaction = new autoReaction();
            client.autoReactions.set(ar.name, ar)
        }).catch(console.log);

}

const commandFiles = fs.readdirSync('./commands').filter((file: string) => file.endsWith('.ts'));
for (const file of commandFiles) {
    import(`./commands/${file}`)
        .then(({default: command}) => {
            const cmd: ICommand = new command();
            client.commands.set(cmd.name, cmd);
        }).catch(console.log);
}

const cooldowns = new Collection<string, Collection<string, number>>();

client.on('ready', () => {
    console.log(`Logged in as ${client.user?.tag}!`);
    client.user?.setActivity(`${prefix}help`, { type: "LISTENING" });
});
client.on("warn", console.log);
client.on("error", console.error);


client.on('message', (message) => {
    addReactions(message);
    executeCommand(message);
});

client.on('guildMemberUpdate', (oldMember, newMember) => {
    // If the role(s) are present on the old member object but no longer on the new one (i.e role(s) were removed)
    const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));
    if (removedRoles.size > 0) console.log(`The roles ${removedRoles.map(r => r.name)} were removed from ${oldMember.displayName}.`);
    // If the role(s) are present on the new member object but are not on the old one (i.e role(s) were added)
    const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
    if (addedRoles.size > 0) console.log(`The roles ${addedRoles.map(r => r.name)} were added to ${oldMember.displayName}.`);
});

client.login(DISCORD_TOKEN)
    .catch(console.log);

function addReactions(message: Message) {
    let messageContentLowerCase = message.content.toLowerCase();
    if (client.autoReactions.some(autoReaction => messageContentLowerCase.includes(autoReaction.name) || (autoReaction.aliases?.length > 0 && autoReaction.aliases.includes(messageContentLowerCase)))) {
        for(const autoReaction of client.autoReactions.values()){
            if ((messageContentLowerCase.includes(autoReaction.name) || (autoReaction.aliases?.length > 0 && autoReaction.aliases.includes(messageContentLowerCase))) && !message.content.includes(`:${autoReaction.name}:`)) {
                try {
                    autoReaction.execute(message);
                } catch (error) {
                    console.error(error);
                }
            }
        }
    }
}

function executeCommand(message: Message){
    const prefixRegex = new RegExp(`^(<@!?${client.user?.id}>|${escapeRegex(prefix)})\\s*`);
    if (!prefixRegex.test(message.content) || message.author.bot) return;

    const matchedPrefix = message.content.match(prefixRegex);
    if (!matchedPrefix || matchedPrefix.length <= 1) return;
    const args = message.content.slice(matchedPrefix[1].length).trim().split(/ +/);
    const commandName = args.shift()?.toLowerCase();
    if (commandName == undefined) return;
    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    if (!command) return;

    if (command.guildOnly && message.channel.type === 'dm') {
        return message.reply('I can\'t execute that command inside DMs!');
    }

    if (command.args.length > 0 && !args.length) {
        let reply = `You didn't provide any arguments, ${message.author}!`;
        if (command.usage) {
            reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
        }
        return message.channel.send(reply);
    }

    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Collection<string, number>());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;

    // @ts-ignore
    if (timestamps.has(message.author.id)) {
        // @ts-ignore
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return message.reply(`Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
        }
    } else {
        // @ts-ignore
        timestamps.set(message.author.id, now);
        // @ts-ignore
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
    }

    try {
        command.execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply('There was an error trying to execute that command!').then();
    }
}