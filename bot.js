// Run dotenv
require('dotenv').config();

const Discord = require('discord.js');
const config = require('./config.json');
const client = new Discord.Client();
const prefix = config.prefix;

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});


client.on('message', msg => {
  if (msg.content.toLowerCase().includes("bier")) {
    msg.react('🍻');
  }
  if (msg.content.toLowerCase().includes("ideefix") && !msg.content.includes(":ideefix:")) {
	  const ayy = client.emojis.cache.find(emoji => emoji.name === "ideefix");
	  msg.react(ayy);
  }
  if (msg.content.toLowerCase().includes("hospitalia") && !msg.content.includes(":hospitalia:")) {
	  const ayy = client.emojis.cache.find(emoji => emoji.name === "hospitalia");
	  msg.react(ayy);
  }
  if (msg.content.toLowerCase().includes("acantha") && !msg.content.includes(":acantha:")) {
	  const ayy = client.emojis.cache.find(emoji => emoji.name === "acantha");
	  msg.react(ayy);
  }
  if (msg.content.toLowerCase().includes("regent") && !msg.content.includes(":regent:")) {
	  const ayy = client.emojis.cache.find(emoji => emoji.name === "regent");
	  msg.react(ayy);
  }
});

client.login(process.env.DISCORD_TOKEN);