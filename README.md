# Discord-bot
This is a simple discord bot build using [Discord.js](https://discord.js.org).  
The bot has been tweaked for usage on the [Ideefix](http://www.ideefix.skghendt.be) Discord server.

### Run this bot by yourself
To run this bot, you will need to follow [this](https://discordjs.guide/preparations) guide.  
```
Note: The guide recommends you to put your discord token inside config/config.json.
      This however could result in pushing your private token to Github. 
      Our bot therefore prefers variables from your local .env file.
      If you do not have the .env file, you can simply create it in the root folder.
      (This is the same directory as this README.md file.)
      Our .gitignore prevents pushing your local .env file which makes
      this a far more secure place to store your private tokens.
      Inside the file you should put the following:

        DISCORD_TOKEN=70k3n

      Replace 70k3n with your own token and you should be good to go.
```